import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const SpendingTrendChart = () => {
  const { monthlyTransactions, currency } = useTransactions();

  // Build daily spending trend for the current month
  const trendData = useMemo(() => {
    const dailyMap = {};

    monthlyTransactions
      .filter((tx) => tx.type === 'Expense')
      .forEach((tx) => {
        if (!tx.date) return;
        const dayKey = tx.date; // 'YYYY-MM-DD'
        dailyMap[dayKey] = (dailyMap[dayKey] || 0) + Number(tx.amount || 0);
      });

    const sortedDays = Object.keys(dailyMap).sort();

    let cumulative = 0;
    return sortedDays.map((day) => {
      const dailyAmt = dailyMap[day];
      cumulative += dailyAmt;
      const date = new Date(day);
      const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return {
        date: day,
        label,
        amount: dailyAmt,
        cumulative,
      };
    });
  }, [monthlyTransactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 text-xs">
          <p className="font-semibold text-slate-800 mb-1">{item.label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Daily Spending:</span>
            <span className="font-bold text-rose-600">
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400">Cumulative:</span>
            <span className="font-semibold text-slate-700">
              {formatCurrency(item.cumulative, currency)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!trendData || trendData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No spending trends recorded for this period.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trendData}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val) => `₹${val > 999 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendingGradient)"
            dot={{ r: 3.5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingTrendChart;

