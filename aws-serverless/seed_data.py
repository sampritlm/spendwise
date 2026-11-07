import urllib.request
import json
import time

API_URL = "https://suel6yzak0.execute-api.ap-south-1.amazonaws.com/transactions"

transactions = [
  # --- November 2026 ---
  {
    "title": "Monthly Tech Salary",
    "amount": 55000,
    "type": "Income",
    "category": "Salary",
    "date": "2026-11-01",
    "paymentMethod": "Net Banking",
    "description": "Corporate salary credit from employer"
  },
  {
    "title": "Apartment Rent & Maintenance",
    "amount": 12000,
    "type": "Expense",
    "category": "Bills",
    "date": "2026-11-02",
    "paymentMethod": "Net Banking",
    "description": "Monthly flat rent and maintenance dues"
  },
  {
    "title": "Freelance UI/UX Dashboard",
    "amount": 10000,
    "type": "Income",
    "category": "Freelance",
    "date": "2026-11-02",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "Milestone payout for mobile dashboard design"
  },
  {
    "title": "Nature Basket Organic Groceries",
    "amount": 3850,
    "type": "Expense",
    "category": "Food",
    "date": "2026-11-03",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "Weekly organic vegetables, fruits, and pantry"
  },
  {
    "title": "Airtel Fiber Broadband Bill",
    "amount": 1199,
    "type": "Expense",
    "category": "Bills",
    "date": "2026-11-04",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "300 Mbps unlimited optical fiber connection"
  },
  {
    "title": "Fuel & Metro Smartcard",
    "amount": 1800,
    "type": "Expense",
    "category": "Transportation",
    "date": "2026-11-05",
    "paymentMethod": "Debit Card",
    "description": "Vehicle petrol refill and Metro smartcard top-up"
  },
  {
    "title": "Bistro Dining & Coffee",
    "amount": 1550,
    "type": "Expense",
    "category": "Food",
    "date": "2026-11-06",
    "paymentMethod": "Credit Card",
    "description": "Weekend cafe dining and artisanal bakery"
  },
  {
    "title": "AWS Cloud Lab & Certification",
    "amount": 1251,
    "type": "Expense",
    "category": "Education",
    "date": "2026-11-07",
    "paymentMethod": "Credit Card",
    "description": "Cloud Solutions Lab exam voucher fee"
  },
  {
    "title": "Apollo Pharmacy Health Supplies",
    "amount": 500,
    "type": "Expense",
    "category": "Healthcare",
    "date": "2026-11-07",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "Multivitamins and prescription medicine"
  },
  {
    "title": "Weekend Apparel & Shopping",
    "amount": 2450,
    "type": "Expense",
    "category": "Shopping",
    "date": "2026-11-08",
    "paymentMethod": "Credit Card",
    "description": "Casual shoes and shirts from retail outlet"
  },
  {
    "title": "IMAX Cinema & Netflix Subs",
    "amount": 950,
    "type": "Expense",
    "category": "Entertainment",
    "date": "2026-11-09",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "Weekend movie ticket and subscription"
  },

  # --- October 2026 ---
  {
    "title": "Monthly Tech Salary",
    "amount": 55000,
    "type": "Income",
    "category": "Salary",
    "date": "2026-10-01",
    "paymentMethod": "Net Banking",
    "description": "October corporate salary credit"
  },
  {
    "title": "Flat Rent & Utilities",
    "amount": 12000,
    "type": "Expense",
    "category": "Bills",
    "date": "2026-10-02",
    "paymentMethod": "Net Banking",
    "description": "October flat rent"
  },
  {
    "title": "Freelance Webhook Setup",
    "amount": 8500,
    "type": "Income",
    "category": "Freelance",
    "date": "2026-10-05",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "API integration milestone"
  },
  {
    "title": "Supermarket Groceries",
    "amount": 4500,
    "type": "Expense",
    "category": "Food",
    "date": "2026-10-10",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "Monthly grocery staples"
  },
  {
    "title": "Diwali Shopping & Gifts",
    "amount": 5800,
    "type": "Expense",
    "category": "Shopping",
    "date": "2026-10-15",
    "paymentMethod": "Credit Card",
    "description": "Festive clothes and family gifts"
  },
  {
    "title": "Concert & Movie Tickets",
    "amount": 1400,
    "type": "Expense",
    "category": "Entertainment",
    "date": "2026-10-20",
    "paymentMethod": "Credit Card",
    "description": "Musical concert show entry"
  },
  {
    "title": "Ola & Uber City Rides",
    "amount": 2100,
    "type": "Expense",
    "category": "Transportation",
    "date": "2026-10-25",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "City commute cab rides"
  },

  # --- September 2026 ---
  {
    "title": "Monthly Tech Salary",
    "amount": 55000,
    "type": "Income",
    "category": "Salary",
    "date": "2026-09-01",
    "paymentMethod": "Net Banking",
    "description": "September salary credit"
  },
  {
    "title": "Apartment Rent",
    "amount": 12000,
    "type": "Expense",
    "category": "Bills",
    "date": "2026-09-02",
    "paymentMethod": "Net Banking",
    "description": "September rent"
  },
  {
    "title": "Dining & Food Orders",
    "amount": 4200,
    "type": "Expense",
    "category": "Food",
    "date": "2026-09-12",
    "paymentMethod": "UPI / GPay / PhonePe",
    "description": "Zomato dining deliveries"
  },
  {
    "title": "Ergonomic Keyboard",
    "amount": 7500,
    "type": "Expense",
    "category": "Shopping",
    "date": "2026-09-18",
    "paymentMethod": "Credit Card",
    "description": "Keychron wireless keyboard"
  },
  {
    "title": "Vehicle Fuel & Servicing",
    "amount": 2900,
    "type": "Expense",
    "category": "Transportation",
    "date": "2026-09-24",
    "paymentMethod": "Debit Card",
    "description": "Quarterly bike servicing and petrol"
  }
]

print(f"Seeding {len(transactions)} sample records to live AWS API Gateway...")
for idx, tx in enumerate(transactions, 1):
    try:
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(tx).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[{idx}/{len(transactions)}] Added: {tx['title']} (₹{tx['amount']})")
    except Exception as e:
        print(f"[{idx}/{len(transactions)}] Error adding {tx['title']}: {e}")
    time.sleep(0.1)

print("\nDone! All sample records are now stored in live Amazon DynamoDB via AWS Lambda!")
