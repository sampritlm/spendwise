import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const SummaryCard = ({ type, title, value, subtitle, trend, trendLabel }) => {
  const { currency } = useTransactions();

  // Visual variants mapping
  const configs = {
    balance: {
      icon: Wallet,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      borderColor: 'border-slate-200/80',
    },
    income: {
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      borderColor: 'border-slate-200/80',
    },
    expense: {
      icon: TrendingDown,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700',
      borderColor: 'border-slate-200/80',
    },
    savings: {
      icon: PiggyBank,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
      borderColor: 'border-slate-200/80',
    },
  };

  const current = configs[type] || configs.balance;
  const Icon = current.icon;

  const displayValue = type === 'savings' 
    ? formatPercent(value) 
    : formatCurrency(value, currency);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${current.iconBg}`}>
            <Icon className={`w-5 h-5 ${current.iconColor}`} />
          </div>
        </div>

        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {displayValue}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          {subtitle || 'This month'}
        </span>

        {trend !== undefined && (
          <span className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full text-[11px] ${current.badgeBg}`}>
            {trend > 0 ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {trendLabel || `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;

