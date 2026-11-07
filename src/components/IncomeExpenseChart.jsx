import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const IncomeExpenseChart = () => {
  const { transactions, currency } = useTransactions();

  // Aggregate monthly totals across transactions
  const chartData = useMemo(() => {
    const monthlyMap = {};

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const mKey = tx.date.substring(0, 7); // 'YYYY-MM'
      if (!monthlyMap[mKey]) {
        monthlyMap[mKey] = { monthKey: mKey, income: 0, expenses: 0 };
      }
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') {
        monthlyMap[mKey].income += amt;
      } else if (tx.type === 'Expense') {
        monthlyMap[mKey].expenses += amt;
      }
    });

    // Sort chronologically and take last 6 months
    const sorted = Object.values(monthlyMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6)
      .map((item) => {
        const [year, month] = item.monthKey.split('-');
        const date = new Date(Number(year), Number(month) - 1, 1);
        const label = date.toLocaleDateString('en-US', { month: 'short' });
        return {
          ...item,
          name: label,
        };
      });

    return sorted;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-100 text-xs">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
            {label} 2026
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Income
              </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(payload[0]?.value, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Expenses
              </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(payload[1]?.value, currency)}
              </span>
            </div>
            {payload[0] && payload[1] && (
              <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-100">
                <span className="text-slate-500">Net Savings</span>
                <span
                  className={`font-bold ${
                    payload[0].value - payload[1].value >= 0
                      ? 'text-indigo-600'
                      : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(payload[0].value - payload[1].value, currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No comparative monthly data available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val) => `₹${val > 999 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;

