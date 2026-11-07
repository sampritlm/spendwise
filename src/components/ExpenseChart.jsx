import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, CATEGORY_CONFIG } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const ExpenseChart = () => {
  const { monthlyTransactions, currency } = useTransactions();
  const [activeIndex, setActiveIndex] = useState(null);

  // Calculate expense breakdown by category for the current selected month
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    let totalExpense = 0;

    monthlyTransactions.forEach((tx) => {
      if (tx.type === 'Expense') {
        const amt = Number(tx.amount) || 0;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
        totalExpense += amt;
      }
    });

    const entries = Object.entries(categoryTotals).map(([name, value]) => {
      const config = CATEGORY_CONFIG[name] || CATEGORY_CONFIG.Other;
      const percentage = totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0;
      return {
        name,
        value,
        percentage,
        color: config.color,
      };
    });

    // Sort descending by value
    entries.sort((a, b) => b.value - a.value);

    return { entries, totalExpense };
  }, [monthlyTransactions]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  if (!categoryData.entries || categoryData.entries.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <p className="font-medium text-slate-600">No expenses recorded for this period</p>
        <p className="mt-1 text-slate-400">Add an expense to view category distribution.</p>
      </div>
    );
  }

  const activeCategory = activeIndex !== null ? categoryData.entries[activeIndex] : null;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Centered Donut Chart with Interactive Center Label */}
      <div className="relative w-48 h-48 sm:w-52 sm:h-52 my-1 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData.entries}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={74}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="transparent"
            >
              {categoryData.entries.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-all duration-200 cursor-pointer"
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Dynamic Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[110px]">
            {activeCategory ? activeCategory.name : 'Total Spent'}
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight mt-0.5">
            {formatCurrency(
              activeCategory ? activeCategory.value : categoryData.totalExpense,
              currency
            )}
          </span>
          <span className="text-[11px] font-semibold text-indigo-600 mt-0.5">
            {activeCategory ? `${activeCategory.percentage}% of expenses` : `${categoryData.entries.length} Categories`}
          </span>
        </div>
      </div>

      {/* Clean, Full-Width Category Legend List */}
      <div className="w-full space-y-1.5 mt-3 pt-3 border-t border-slate-100 max-h-52 overflow-y-auto pr-1">
        {categoryData.entries.map((cat, idx) => {
          const isHighlighted = activeIndex === idx;
          return (
            <div
              key={cat.name}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                isHighlighted ? 'bg-indigo-50/80 ring-1 ring-indigo-200' : 'hover:bg-slate-50'
              }`}
            >
              {/* Left: Color dot & Category Name */}
              <div className="flex items-center gap-2.5 min-w-0 mr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {cat.name}
                </span>
              </div>

              {/* Right: Amount & Percentage Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(cat.value, currency)}
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md min-w-[34px] text-center">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseChart;
