import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency, formatPercent, CATEGORY_CONFIG } from '../utils/formatters';
import { IncomeExpenseChart } from '../components/IncomeExpenseChart';
import { ExpenseChart } from '../components/ExpenseChart';
import { SpendingTrendChart } from '../components/SpendingTrendChart';
import { CategoryIcon } from '../components/TransactionTable';

export const Analytics = () => {
  const {
    monthlyTransactions,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    currency,
  } = useTransactions();

  // Calculate detailed analytics for the current selected month
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const categoryTotals = {};
    const dailyExpenses = {};

    monthlyTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') {
        income += amt;
      } else if (tx.type === 'Expense') {
        expenses += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
        if (tx.date) {
          dailyExpenses[tx.date] = (dailyExpenses[tx.date] || 0) + amt;
        }
      }
    });

    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((netSavings / income) * 100)) : 0;

    // Category breakdown sorted descending
    const categoryList = Object.entries(categoryTotals)
      .map(([name, amount]) => {
        const config = CATEGORY_CONFIG[name] || CATEGORY_CONFIG.Other;
        return {
          name,
          amount,
          percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
          color: config.color,
          bgLight: config.bgLight,
          textColor: config.textColor,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const highestCategory = categoryList.length > 0 ? categoryList[0] : null;

    // Daily average
    const daysWithExpenses = Object.keys(dailyExpenses).length;
    const averageDailySpend = daysWithExpenses > 0 ? Math.round(expenses / daysWithExpenses) : 0;

    return {
      income,
      expenses,
      netSavings,
      savingsRate,
      categoryList,
      highestCategory,
      averageDailySpend,
      totalTransactions: monthlyTransactions.length,
    };
  }, [monthlyTransactions]);

  const formatMonthTitle = (m) => {
    if (m === 'all') return 'All Recorded Time';
    const [year, month] = m.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Page Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deep dive into spending habits, category breakdowns, and cash-flow health.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-xs text-xs sm:text-sm font-medium text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-2 font-medium"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthTitle(m)}
                </option>
              ))}
              <option value="all">All Available Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI 4-Card Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(stats.income, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Total inflows received</p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(stats.expenses, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Total spent across categories</p>
        </div>

        {/* Net Savings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Net Savings</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold ${
              stats.netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(stats.netSavings, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Income minus total expenses</p>
        </div>

        {/* Savings Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Savings Rate</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stats.savingsRate >= 50
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {stats.savingsRate >= 50 ? 'Excellent' : 'Moderate'}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatPercent(stats.savingsRate)}
          </div>
          <p className="text-xs text-slate-400 mt-2">Recommended benchmark: &gt; 20%</p>
        </div>
      </div>

      {/* Highest Spending Category & Spending Highlights Card */}
      {stats.highestCategory && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Highest Spending Category
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {stats.highestCategory.name} accounted for {stats.highestCategory.percentage}% of all expenses
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              You spent <span className="font-semibold text-white">{formatCurrency(stats.highestCategory.amount, currency)}</span> on {stats.highestCategory.name} this month. Keeping an eye on this category can boost your savings rate beyond {stats.savingsRate}%.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0 min-w-[200px] text-center">
            <span className="text-xs text-slate-300 block mb-1">Average Daily Spend</span>
            <span className="text-2xl font-black text-white">
              {formatCurrency(stats.averageDailySpend, currency)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">per active spending day</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Comparison */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Monthly Spending Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical inflow vs outflow comparison across quarters
            </p>
          </div>
          <IncomeExpenseChart />
        </div>

        {/* Expense Breakdown Donut */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Category-Wise Expenditure
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of spending for {formatMonthTitle(selectedMonth)}
            </p>
          </div>
          <ExpenseChart />
        </div>
      </div>

      {/* Daily Spending Trend Line */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base">
            Daily Spending Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Progression of daily expenses during {formatMonthTitle(selectedMonth)}
          </p>
        </div>
        <SpendingTrendChart />
      </div>

      {/* Category Breakdown Table / Progress List */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft">
        <h3 className="font-bold text-slate-900 text-base mb-1">
          Detailed Category Performance
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Proportional expenditure allocation across all tracked categories
        </p>

        {stats.categoryList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No expenses recorded for this month.
          </div>
        ) : (
          <div className="space-y-4">
            {stats.categoryList.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.bgLight} ${cat.textColor}`}
                    >
                      <CategoryIcon category={cat.name} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 mr-2">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span className="text-slate-400 font-medium">({cat.percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

