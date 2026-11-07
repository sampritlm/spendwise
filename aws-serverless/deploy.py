"""
SpendWise — Automated AWS Serverless Deployment Script
Uses boto3 to create:
1. DynamoDB Table (SpendWiseTransactions)
2. IAM Role for Lambda
3. AWS Lambda Function (Python 3.12)
4. Amazon API Gateway (HTTP API) with CORS and Routes
5. Automatically configures the Frontend with the new API Gateway URL
"""

import os
import sys
import time
import json
import zipfile
import io
import boto3
from botocore.exceptions import ClientError

AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "ap-south-1")
TABLE_NAME = "SpendWiseTransactions"
FUNCTION_NAME = "SpendWiseBackend"
ROLE_NAME = "SpendWiseLambdaExecutionRole"
API_NAME = "SpendWiseHttpApi"

print("=" * 65)
print("  SpendWise — 1-Click AWS Serverless Deployment")
print(f"  Target AWS Region: {AWS_REGION}")
print("=" * 65)

# Verify credentials
try:
    sts = boto3.client("sts", region_name=AWS_REGION)
    identity = sts.get_caller_identity()
    print(f"\n[+] Verified AWS Credentials:")
    print(f"    Account ID: {identity['Account']}")
    print(f"    User / ARN: {identity['Arn']}")
except Exception as e:
    print(f"\n[!] Error: Unable to locate active AWS credentials.")
    print("    Please run 'aws configure' in your terminal and enter:")
    print("    - AWS Access Key ID")
    print("    - AWS Secret Access Key")
    print("    - Default region name (e.g., ap-south-1)")
    sys.exit(1)

dynamodb = boto3.client("dynamodb", region_name=AWS_REGION)
iam = boto3.client("iam", region_name=AWS_REGION)
lambda_client = boto3.client("lambda", region_name=AWS_REGION)
apigateway = boto3.client("apigatewayv2", region_name=AWS_REGION)

# -------------------------------------------------------------
# 1. Create DynamoDB Table
# -------------------------------------------------------------
print("\n[1/5] Setting up Amazon DynamoDB Table...")
try:
    dynamodb.describe_table(TableName=TABLE_NAME)
    print(f"      Table '{TABLE_NAME}' already exists.")
except ClientError as e:
    if e.response["Error"]["Code"] == "ResourceNotFoundException":
        print(f"      Creating table '{TABLE_NAME}' with Partition Key 'id' (String)...")
        dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        print("      Waiting for table to become active...")
        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        print("      Table is active and ready.")
    else:
        raise

# -------------------------------------------------------------
# 2. Create / Get IAM Role for Lambda
# -------------------------------------------------------------
print("\n[2/5] Configuring IAM Execution Role...")
assume_role_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole",
        }
    ],
}

role_arn = None
try:
    role_res = iam.get_role(RoleName=ROLE_NAME)
    role_arn = role_res["Role"]["Arn"]
    print(f"      Existing IAM Role found: {role_arn}")
except ClientError as e:
    if e.response["Error"]["Code"] == "NoSuchEntity":
        print(f"      Creating role '{ROLE_NAME}'...")
        res = iam.create_role(
            RoleName=ROLE_NAME,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy),
            Description="Execution role for SpendWise Lambda functions",
        )
        role_arn = res["Role"]["Arn"]
        # Attach policies
        iam.attach_role_policy(
            RoleName=ROLE_NAME,
            PolicyArn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
        )
        iam.attach_role_policy(
            RoleName=ROLE_NAME,
            PolicyArn="arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
        )
        print("      Policies attached. Waiting 10s for IAM propagation...")
        time.sleep(10)
    else:
        raise

# -------------------------------------------------------------
# 3. Create Lambda Deployment ZIP in memory
# -------------------------------------------------------------
print("\n[3/5] Packaging and Deploying AWS Lambda Function...")
zip_buffer = io.BytesIO()
script_dir = os.path.dirname(os.path.abspath(__file__))
handlers_path = os.path.join(script_dir, "lambda_handlers.py")

with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
    zip_file.write(handlers_path, arcname="lambda_handlers.py")

zip_bytes = zip_buffer.getvalue()

# We route requests based on HTTP route through the unified handler or specific handlers
function_arn = None
try:
    fn_res = lambda_client.get_function(FunctionName=FUNCTION_NAME)
    function_arn = fn_res["Configuration"]["FunctionArn"]
    print(f"      Updating existing Lambda code for '{FUNCTION_NAME}'...")
    lambda_client.update_function_code(
        FunctionName=FUNCTION_NAME,
        ZipFile=zip_bytes,
    )
except ClientError as e:
    if e.response["Error"]["Code"] == "ResourceNotFoundException":
        print(f"      Creating new Lambda function '{FUNCTION_NAME}' (Python 3.12)...")
        res = lambda_client.create_function(
            FunctionName=FUNCTION_NAME,
            Runtime="python3.12",
            Role=role_arn,
            Handler="lambda_handlers.lambda_handler", # unified entrypoint router
            Code={"ZipFile": zip_bytes},
            Description="SpendWise Serverless Backend Handler",
            Timeout=15,
            MemorySize=256,
            Environment={"Variables": {"DYNAMODB_TABLE": TABLE_NAME}},
        )
        function_arn = res["FunctionArn"]
        print("      Waiting for Lambda function to become active...")
        time.sleep(5)
    else:
        raise

# -------------------------------------------------------------
# 4. Set up Amazon API Gateway HTTP API
# -------------------------------------------------------------
print("\n[4/5] Configuring Amazon API Gateway (HTTP API) with CORS...")
apis = apigateway.get_apis().get("Items", [])
api_id = None
api_endpoint = None

for a in apis:
    if a.get("Name") == API_NAME:
        api_id = a["ApiId"]
        api_endpoint = a["ApiEndpoint"]
        print(f"      Existing API Gateway found: {api_id}")
        break

if not api_id:
    print(f"      Creating HTTP API '{API_NAME}' with permissive CORS...")
    cors_config = {
        "AllowOrigins": ["*"],
        "AllowMethods": ["GET", "POST", "DELETE", "OPTIONS"],
        "AllowHeaders": ["Content-Type", "Authorization"],
        "MaxAge": 600,
    }
    create_api_res = apigateway.create_api(
        Name=API_NAME,
        ProtocolType="HTTP",
        CorsConfiguration=cors_config,
    )
    api_id = create_api_res["ApiId"]
    api_endpoint = create_api_res["ApiEndpoint"]

    # Create Lambda Integration
    integration = apigateway.create_integration(
        ApiId=api_id,
        IntegrationType="AWS_PROXY",
        IntegrationUri=function_arn,
        PayloadFormatVersion="2.0",
    )
    integration_id = integration["IntegrationId"]

    # Routes to create
    routes = [
        "GET /transactions",
        "POST /transactions",
        "GET /summary",
        "DELETE /transactions",
        "POST /receipts/thumbnail",
        "$default",
    ]

    for r_key in routes:
        apigateway.create_route(
            ApiId=api_id,
            RouteKey=r_key,
            Target=f"integrations/{integration_id}",
        )

    # Create $default stage with auto-deploy
    apigateway.create_stage(
        ApiId=api_id,
        StageName="$default",
        AutoDeploy=True,
    )

# Grant API Gateway permission to invoke Lambda
try:
    lambda_client.add_permission(
        FunctionName=FUNCTION_NAME,
        StatementId=f"apigateway-invoke-{api_id}",
        Action="lambda:InvokeFunction",
        Principal="apigateway.amazonaws.com",
        SourceArn=f"arn:aws:execute-api:{AWS_REGION}:{identity['Account']}:{api_id}/*/*",
    )
except ClientError as e:
    if e.response["Error"]["Code"] != "ResourceConflictException":
        print(f"      Permission note: {e}")

# -------------------------------------------------------------
# 5. Connect Frontend Configuration
# -------------------------------------------------------------
print("\n[5/5] Connecting Frontend to AWS...")
root_dir = os.path.dirname(script_dir)
env_path = os.path.join(root_dir, ".env")

with open(env_path, "w", encoding="utf-8") as f:
    f.write(f"# SpendWise AWS Serverless Live Backend Configuration\n")
    f.write(f"VITE_API_BASE_URL={api_endpoint}\n")
    f.write(f"VITE_USE_MOCK_API=false\n")
    f.write(f"VITE_AWS_REGION={AWS_REGION}\n")

print("\n" + "=" * 65)
print("  🚀 DEPLOYMENT SUCCESSFUL!")
print("=" * 65)
print(f"  Amazon API Gateway URL: {api_endpoint}")
print(f"  DynamoDB Table Name:    {TABLE_NAME}")
print(f"  Lambda Function Name:   {FUNCTION_NAME}")
print(f"  AWS Region:             {AWS_REGION}")
print("=" * 65)
print("\nYour frontend has been automatically configured with the live API URL!")
print("Open http://localhost:3000 to test your live AWS cloud backend.")
