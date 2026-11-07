import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  Download
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { SummaryCard } from '../components/SummaryCard';
import { IncomeExpenseChart } from '../components/IncomeExpenseChart';
import { ExpenseChart } from '../components/ExpenseChart';
import { SpendingTrendChart } from '../components/SpendingTrendChart';
import { TransactionTable } from '../components/TransactionTable';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const Dashboard = () => {
  const {
    summary,
    monthlyTransactions,
    deleteTransaction,
    setIsAddModalOpen,
    setActiveTab,
    selectedMonth,
  } = useTransactions();

  const [txToDelete, setTxToDelete] = useState(null);

  const formatMonthTitle = (m) => {
    if (m === 'all') return 'All-Time Financial Overview';
    const [year, month] = m.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Welcome Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Financial Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, welcome back!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your finances for{' '}
            <span className="font-semibold text-slate-700">
              {formatMonthTitle(selectedMonth)}
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <SummaryCard
          type="balance"
          title="Total Balance"
          value={summary.totalBalance}
          subtitle="Net accumulated funds"
          trend={+12.4}
          trendLabel="+12.4% vs last mo"
        />
        <SummaryCard
          type="income"
          title="Total Income"
          value={summary.totalIncome}
          subtitle="Salary & freelance credits"
          trend={+8.5}
          trendLabel="+8.5% inflow"
        />
        <SummaryCard
          type="expense"
          title="Total Expenses"
          value={summary.totalExpenses}
          subtitle="Bills, shopping & dining"
          trend={-4.2}
          trendLabel="-4.2% lower"
        />
        <SummaryCard
          type="savings"
          title="Savings Rate"
          value={summary.savingsRate}
          subtitle="Goal: 50% target"
          trend={+6.0}
          trendLabel="Strong Health"
        />
      </div>

      {/* Primary Analytics Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly inflow and outflow comparison
              </p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              Detailed Analytics
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <IncomeExpenseChart />
        </div>

        {/* Expense Breakdown Donut Chart */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Expense Breakdown
              </h3>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                By Category
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Spending distribution for {formatMonthTitle(selectedMonth)}
            </p>
          </div>
          <ExpenseChart />
        </div>
      </div>

      {/* Spending Trends Area Chart */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Spending Trends
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily expenditure progression throughout the month
            </p>
          </div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-lg">
            Daily Trend (INR)
          </span>
        </div>
        <SpendingTrendChart />
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest financial activity logged in SpendWise
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto group"
          >
            <span>View All ({monthlyTransactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <TransactionTable
          transactions={monthlyTransactions}
          limit={6}
          onDeleteRequest={(tx) => setTxToDelete(tx)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        transaction={txToDelete}
        onConfirm={(id, title) => deleteTransaction(id, title)}
      />
    </div>
  );
};

export default Dashboard;

