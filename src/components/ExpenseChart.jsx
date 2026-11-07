import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-slate-800">{item.name}</span>
          </div>
          <div className="text-slate-600 font-semibold">
            {formatCurrency(item.value, currency)}{' '}
            <span className="text-slate-400 font-normal">({item.percentage}%)</span>
          </div>
        </div>
      );
    }
    return null;
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Donut Chart with Centered Total */}
      <div className="relative w-56 h-56 sm:w-60 sm:h-60 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={categoryData.entries}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={88}
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
                  className="transition-opacity duration-200 cursor-pointer"
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {activeCategory ? activeCategory.name : 'Total Spent'}
          </span>
          <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
            {formatCurrency(
              activeCategory ? activeCategory.value : categoryData.totalExpense,
              currency
            )}
          </span>
          {activeCategory && (
            <span className="text-[11px] font-semibold text-indigo-600">
              {activeCategory.percentage}% of expenses
            </span>
          )}
        </div>
      </div>

      {/* Category List & Color Swatches */}
      <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {categoryData.entries.map((cat, idx) => {
          const isHighlighted = activeIndex === idx;
          return (
            <div
              key={cat.name}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                isHighlighted ? 'bg-slate-100/90' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {cat.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(cat.value, currency)}
                </span>
                <span className="text-[10px] text-slate-600 ml-1.5 font-medium">
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

