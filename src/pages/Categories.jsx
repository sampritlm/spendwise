import React, { useMemo } from 'react';
import {
  FolderTree,
  Plus,
  ArrowRight,
  TrendingDown,
  Sparkles,
  PieChart as PieIcon,
  Tag
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { CATEGORY_CONFIG, CATEGORIES_LIST, formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/TransactionTable';

export const Categories = () => {
  const {
    monthlyTransactions,
    currency,
    selectedMonth,
    setActiveTab,
    setIsAddModalOpen,
  } = useTransactions();

  // Aggregate category stats for the current month
  const categoryStats = useMemo(() => {
    const stats = {};
    let totalExpenses = 0;
    let totalIncome = 0;

    // Initialize all standard categories
    CATEGORIES_LIST.forEach((name) => {
      const conf = CATEGORY_CONFIG[name] || CATEGORY_CONFIG.Other;
      stats[name] = {
        name,
        type: conf.type,
        amount: 0,
        count: 0,
        color: conf.color,
        bgLight: conf.bgLight,
        textColor: conf.textColor,
        borderColor: conf.borderColor,
      };
    });

    // Populate with monthly transactions
    monthlyTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') {
        totalIncome += amt;
      } else {
        totalExpenses += amt;
      }

      if (!stats[tx.category]) {
        stats[tx.category] = {
          name: tx.category,
          type: tx.type,
          amount: 0,
          count: 0,
          color: '#64748b',
          bgLight: 'bg-slate-50',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-200',
        };
      }

      stats[tx.category].amount += amt;
      stats[tx.category].count += 1;
    });

    // Calculate percentages
    const list = Object.values(stats).map((item) => {
      const base = item.type === 'Income' ? totalIncome : totalExpenses;
      const percentage = base > 0 ? Math.round((item.amount / base) * 100) : 0;
      return {
        ...item,
        percentage,
      };
    });

    const expenseCategories = list
      .filter((i) => i.type === 'Expense')
      .sort((a, b) => b.amount - a.amount);

    const incomeCategories = list
      .filter((i) => i.type === 'Income')
      .sort((a, b) => b.amount - a.amount);

    return {
      expenseCategories,
      incomeCategories,
      totalExpenses,
      totalIncome,
    };
  }, [monthlyTransactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Category Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Spending Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of expense allocation, category frequencies, and budget tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Expense Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Expense Categories</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              Total {formatCurrency(categoryStats.totalExpenses, currency)}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.expenseCategories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.bgLight} ${cat.borderColor} ${cat.textColor}`}
                    >
                      <CategoryIcon category={cat.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-xs text-slate-400">
                        {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {cat.percentage}%
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Total Spent</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(2, cat.percentage))}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {cat.amount > 0 ? `${cat.percentage}% of monthly budget` : 'No expenses logged'}
                </span>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 group"
                >
                  View
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income Categories Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Income Sources</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Total {formatCurrency(categoryStats.totalIncome, currency)}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.incomeCategories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.bgLight} ${cat.borderColor} ${cat.textColor}`}
                  >
                    <CategoryIcon category={cat.name} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                    <p className="text-xs text-slate-400">
                      {cat.count} {cat.count === 1 ? 'credit entry' : 'credit entries'}
                    </p>
                  </div>
                </div>

                <span className="text-base font-extrabold text-emerald-600">
                  +{formatCurrency(cat.amount, currency)}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                  style={{
                    width: `${Math.min(100, Math.max(2, cat.percentage))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

