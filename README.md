# SpendWise — Smart Expense Tracker & Financial Analytics

[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless_FaaS-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)

**SpendWise** is a commercial-grade personal finance dashboard and expense analytics web application. It was designed as an academic demonstration of **AWS Serverless / Function-as-a-Service (FaaS)** architecture utilizing **Amazon Lambda (Python 3.12)**, **Amazon API Gateway (HTTP API)**, **Amazon DynamoDB**, and **Amazon CloudWatch**.

---

## 🌟 Key Features

### 1. Financial Overview (Dashboard)
- **Live Summary Cards**: Dynamically calculated **Total Balance**, **Total Income**, **Total Expenses**, and **Savings Rate** in INR (₹).
- **Income vs Expenses**: Multi-month comparative bar chart powered by Recharts.
- **Expense Breakdown**: Interactive donut chart with category swatches and percentage breakdown.
- **Spending Trends**: Smooth cumulative area/line graph tracking daily expenditures.
- **Recent Transactions**: Real-time table with colored category badges, payment methods, and deletion controls.

### 2. Transaction Management
- Comprehensive transaction table with live search across titles, descriptions, and payment methods.
- Dynamic filtering by **Category**, **Income / Expense**, and **Date / Month**.
- Multi-criteria sorting (Date Newest/Oldest, Amount Highest/Lowest).
- CSV export for reporting and analysis.
- Deletion with confirmation modal.

### 3. Add Transaction Modal
- Form validation (amount > 0, required fields, title length).
- Toggle between Expense and Income with adaptive category selection.
- Date picker, payment method selector (UPI, Credit Card, Net Banking, Cash, Debit Card), and optional notes.
- Instant reactive recalculation across dashboard cards, charts, and table.
- Animated toast notifications on success/error.

### 4. Deep Analytics & Reports
- Monthly selector with dynamic re-calculation.
- **Highest Spending Category** alert banner highlighting top expense drivers.
- Average daily spend calculations.
- Visual category progress bars with percentage of budget.

### 5. Categories Page
- Complete expense and income source breakdown.
- Progress bars and transaction counts per category.

### 6. Settings & AWS Cloud Architecture Panel
- Profile and user identity customization.
- Live currency switcher (default INR `₹`, supports `USD`, `EUR`, `GBP`).
- AWS API Gateway endpoint URL configuration (`VITE_API_BASE_URL`).
- Mode switcher: **Mock Prototype Mode** (localStorage) vs. **Live AWS Lambda API**.
- One-click **Reset Prototype Data** to restore the realistic Nov 2026 dataset (Income ₹65,000, Expenses ₹22,150, Balance ₹42,850, Savings Rate 66%).

---

## 🏗️ Project Folder Structure

```
spendwise/
├── aws-serverless/                  # AWS FaaS Backend Architecture
│   ├── lambda_handlers.py           # Python 3.12 Lambda functions (boto3, DynamoDB)
│   ├── template.yaml                # AWS SAM / CloudFormation serverless template
│   └── README.md                    # Serverless deployment & architecture doc
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── AddTransactionModal.jsx  # Transaction entry modal with validation
│   │   ├── DeleteConfirmModal.jsx   # Deletion confirmation modal
│   │   ├── ExpenseChart.jsx         # Donut chart for expense breakdown
│   │   ├── IncomeExpenseChart.jsx   # Bar chart comparing monthly income vs expense
│   │   ├── Navbar.jsx               # Top navigation bar, search, month selector
│   │   ├── Sidebar.jsx              # Responsive navigation sidebar
│   │   ├── SpendingTrendChart.jsx   # Area chart for daily spending trends
│   │   ├── SummaryCard.jsx          # KPI stat cards (Balance, Income, Expenses, Savings)
│   │   ├── Toast.jsx                # Global notification toast container
│   │   └── TransactionTable.jsx     # Transaction data table with category badges
│   ├── context/
│   │   └── TransactionContext.jsx   # Central React state provider
│   ├── pages/
│   │   ├── Analytics.jsx            # Financial health & category analytics
│   │   ├── Categories.jsx           # Spending category budgets and allocation
│   │   ├── Dashboard.jsx            # Main dashboard overview
│   │   ├── Settings.jsx             # User profile, currency, & AWS Gateway configuration
│   │   └── Transactions.jsx         # Full transaction management, search, and export
│   ├── services/
│   │   ├── api.js                   # Universal HTTP client for API Gateway
│   │   └── transactionService.js    # Data access layer (DynamoDB Lambda / Mock storage)
│   ├── utils/
│   │   ├── formatters.js            # INR currency, date, and category style helpers
│   │   └── sampleData.js            # Realistic initial demo transactions
│   ├── config.js                    # Central app & AWS environment configuration
│   ├── App.jsx                      # App root and tab router
│   ├── main.jsx                     # Application entrypoint
│   └── index.css                    # Tailwind CSS and sleek UI typography styles
├── index.html                       # HTML template with Inter typography
├── package.json                     # Node.js dependencies (React, Recharts, Lucide, Tailwind)
├── tailwind.config.js               # Fintech light theme color palette
├── vite.config.js                   # Vite bundler configuration
└── .env                             # Environment configuration (VITE_API_BASE_URL)
```

---

## ⚡ Quick Start & Running Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port displayed in your terminal).

### 4. Build for Production
```bash
npm run build
```
This produces optimized production assets in the `dist/` directory, ready for deployment to Amazon S3.

---

## ☁️ Connecting to AWS Lambda & API Gateway

SpendWise is pre-architected with a clean API service layer (`src/services/api.js` and `src/services/transactionService.js`).

1. **Deploy the AWS Backend**:
   Navigate to `aws-serverless/` and run `sam deploy --guided` using AWS SAM.
2. **Obtain API Gateway Invoke URL**:
   The deployment outputs a URL such as `https://xxxxxx.execute-api.ap-south-1.amazonaws.com`.
3. **Connect Frontend**:
   - In `.env`:
     ```env
     VITE_API_BASE_URL=https://xxxxxx.execute-api.ap-south-1.amazonaws.com
     VITE_USE_MOCK_API=false
     ```
   - **OR** directly inside the running application: open the **Settings** page, paste your API Gateway URL into the **AWS Serverless Panel**, toggle Mock Mode off, and click **Apply Config**!

