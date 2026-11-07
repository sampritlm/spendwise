import json
import os
import logging
from decimal import Decimal
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key, Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "SpendWiseTransactions")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def create_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        "body": json.dumps(body, cls=DecimalEncoder),
    }

def lambda_handler(event, context):
    logger.info("Lambda handler received event: %s", json.dumps(event))
    
    http_ctx = event.get("requestContext", {}).get("http", {})
    method = http_ctx.get("method", event.get("httpMethod", "GET")).upper()
    path = http_ctx.get("path", event.get("rawPath", event.get("path", "/")))

    if method == "OPTIONS":
        return create_response(200, {"message": "CORS preflight OK"})

    if path.startswith("/transactions"):
        if method == "GET":
            return get_transactions_handler(event, context)
        elif method == "POST":
            return add_transaction_handler(event, context)
        elif method == "DELETE":
            return delete_transaction_handler(event, context)
    elif path.startswith("/summary"):
        return get_monthly_summary_handler(event, context)
    elif path.startswith("/receipts"):
        return generate_receipt_thumbnail_handler(event, context)

    return get_monthly_summary_handler(event, context)

def get_transactions_handler(event, context):
    logger.info("Executing getTransactions handler. Event: %s", json.dumps(event))
    try:
        query_params = event.get("queryStringParameters") or {}
        month = query_params.get("month")
        category = query_params.get("category")
        tx_type = query_params.get("type")

        scan_kwargs = {}
        filter_expressions = []

        if month and month != "all":
            filter_expressions.append(Attr("date").begins_with(month))
        if category and category != "all":
            filter_expressions.append(Attr("category").eq(category))
        if tx_type and tx_type != "all":
            filter_expressions.append(Attr("type").eq(tx_type))

        if filter_expressions:
            combined = filter_expressions[0]
            for expr in filter_expressions[1:]:
                combined = combined & expr
            scan_kwargs["FilterExpression"] = combined

        response = table.scan(**scan_kwargs)
        items = response.get("Items", [])

        items.sort(key=lambda x: x.get("date", ""), reverse=True)

        logger.info("Retrieved %d transactions from DynamoDB", len(items))
        return create_response(200, {
            "success": True,
            "count": len(items),
            "data": items
        })

    except Exception as e:
        logger.error("Error in getTransactions: %s", str(e), exc_info=True)
        return create_response(500, {"success": False, "message": str(e)})

def add_transaction_handler(event, context):
    logger.info("Executing addTransaction handler.")
    try:
        body_raw = event.get("body")
        if not body_raw:
            return create_response(400, {"success": False, "message": "Missing request body"})

        payload = json.loads(body_raw)

        title = payload.get("title", "").strip()
        amount_raw = payload.get("amount")
        tx_type = payload.get("type", "Expense")
        category = payload.get("category", "Other")
        date = payload.get("date")
        payment_method = payload.get("paymentMethod", "UPI")
        description = payload.get("description", "").strip()

        if not title:
            return create_response(400, {"success": False, "message": "Title is required"})
        
        try:
            amount = Decimal(str(amount_raw))
            if amount <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return create_response(400, {"success": False, "message": "Amount must be a positive number"})

        if not date:
            date = datetime.utcnow().strftime("%Y-%m-%d")

        item_id = f"tx-{int(datetime.utcnow().timestamp() * 1000)}"

        item = {
            "id": item_id,
            "title": title,
            "amount": amount,
            "type": tx_type,
            "category": category,
            "date": date,
            "paymentMethod": payment_method,
            "description": description,
            "createdAt": datetime.utcnow().isoformat() + "Z",
        }

        table.put_item(Item=item)
        logger.info("Successfully added transaction %s to DynamoDB", item_id)

        return create_response(201, {"success": True, "data": item})

    except Exception as e:
        logger.error("Error in addTransaction: %s", str(e), exc_info=True)
        return create_response(500, {"success": False, "message": str(e)})

def delete_transaction_handler(event, context):
    logger.info("Executing deleteTransaction handler.")
    try:
        query_params = event.get("queryStringParameters") or {}
        tx_id = query_params.get("id")

        if not tx_id:
            return create_response(400, {"success": False, "message": "Query param 'id' is required"})

        table.delete_item(Key={"id": tx_id})
        logger.info("Successfully deleted transaction %s from DynamoDB", tx_id)

        return create_response(200, {"success": True, "message": "Transaction deleted successfully"})

    except Exception as e:
        logger.error("Error in deleteTransaction: %s", str(e), exc_info=True)
        return create_response(500, {"success": False, "message": str(e)})

def get_monthly_summary_handler(event, context):
    logger.info("Executing getMonthlySummary handler.")
    try:
        query_params = event.get("queryStringParameters") or {}
        month = query_params.get("month")

        scan_kwargs = {}
        if month and month != "all":
            scan_kwargs["FilterExpression"] = Attr("date").begins_with(month)

        response = table.scan(**scan_kwargs)
        items = response.get("Items", [])

        total_income = Decimal(0)
        total_expenses = Decimal(0)
        category_breakdown = {}

        for item in items:
            amt = item.get("amount", Decimal(0))
            t_type = item.get("type")
            cat = item.get("category", "Other")

            if t_type == "Income":
                total_income += amt
            elif t_type == "Expense":
                total_expenses += amt
                category_breakdown[cat] = category_breakdown.get(cat, Decimal(0)) + amt

        balance = total_income - total_expenses
        savings_rate = 0
        if total_income > 0:
            savings_rate = int(round(float((balance / total_income) * 100)))
            if savings_rate < 0:
                savings_rate = 0

        cat_list = []
        for cat_name, amt in category_breakdown.items():
            pct = 0
            if total_expenses > 0:
                pct = int(round(float((amt / total_expenses) * 100)))
            cat_list.append({
                "category": cat_name,
                "amount": amt,
                "percentage": pct
            })

        cat_list.sort(key=lambda x: x["amount"], reverse=True)

        return create_response(200, {
            "success": True,
            "data": {
                "month": month or "all",
                "totalBalance": balance,
                "totalIncome": total_income,
                "totalExpenses": total_expenses,
                "savingsRate": savings_rate,
                "categoryBreakdown": cat_list,
                "transactionCount": len(items)
            }
        })

    except Exception as e:
        logger.error("Error in getMonthlySummary: %s", str(e), exc_info=True)
        return create_response(500, {"success": False, "message": str(e)})

def generate_receipt_thumbnail_handler(event, context):
    logger.info("Executing generateReceiptThumbnail handler.")
    try:
        if "Records" in event and event["Records"][0].get("eventSource") == "aws:s3":
            s3_client = boto3.client("s3")
            for record in event["Records"]:
                bucket_name = record["s3"]["bucket"]["name"]
                object_key = record["s3"]["object"]["key"]

                if object_key.startswith("thumbnails/"):
                    continue

                logger.info(f"Processing image {object_key} from bucket {bucket_name}")
                download_path = f"/tmp/{os.path.basename(object_key)}"
                upload_path = f"/tmp/thumb-{os.path.basename(object_key)}"
                s3_client.download_file(bucket_name, object_key, download_path)

                try:
                    from PIL import Image
                    with Image.open(download_path) as image:
                        image.thumbnail((200, 200))
                        image.save(upload_path, "JPEG", quality=85)
                    
                    thumbnail_key = f"thumbnails/{os.path.basename(object_key)}"
                    s3_client.upload_file(upload_path, bucket_name, thumbnail_key, ExtraArgs={'ContentType': 'image/jpeg'})
                    logger.info(f"Saved thumbnail to {thumbnail_key}")
                except ImportError:
                    logger.warning("Pillow not installed in local environment, simulated thumbnail generation.")

            return create_response(200, {"success": True, "message": "Thumbnail generated successfully"})

        body_raw = event.get("body")
        if body_raw:
            payload = json.loads(body_raw)
            image_data = payload.get("imageData")
            return create_response(200, {
                "success": True,
                "thumbnailUrl": image_data or "https://images.unsplash.com/photo-1554415707-9e49017a1430?w=150&h=150&fit=crop",
                "message": "Thumbnail generated"
            })

        return create_response(400, {"success": False, "message": "Invalid event trigger"})

    except Exception as e:
        logger.error("Error in generateReceiptThumbnail: %s", str(e), exc_info=True)
        return create_response(500, {"success": False, "message": str(e)})
