import React from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  GraduationCap,
  Film,
  HeartPulse,
  Receipt,
  Wallet,
  Briefcase,
  CircleDot,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatDate, CATEGORY_CONFIG } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const CategoryIcon = ({ category, className = 'w-4 h-4' }) => {
  const map = {
    Food: UtensilsCrossed,
    Shopping: ShoppingBag,
    Transportation: Car,
    Education: GraduationCap,
    Entertainment: Film,
    Healthcare: HeartPulse,
    Bills: Receipt,
    Salary: Wallet,
    Freelance: Briefcase,
    Other: CircleDot,
  };

  const IconComponent = map[category] || CircleDot;
  return <IconComponent className={className} />;
};

export const TransactionTable = ({
  transactions,
  onDeleteRequest,
  showAll = false,
  limit = 6,
}) => {
  const { currency } = useTransactions();

  const displayList = showAll ? transactions : transactions.slice(0, limit);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <CircleDot className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">No transactions recorded</h4>
        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
          Add your first transaction to view your income and expense records here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <th className="py-3 px-4 font-semibold">Transaction</th>
            <th className="py-3 px-4 font-semibold">Category</th>
            <th className="py-3 px-4 font-semibold">Date</th>
            <th className="py-3 px-4 font-semibold hidden md:table-cell">Payment Method</th>
            <th className="py-3 px-4 font-semibold text-right">Amount</th>
            <th className="py-3 px-4 font-semibold text-center w-12">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {displayList.map((tx) => {
            const isIncome = tx.type === 'Income';
            const catConf = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.Other;

            return (
              <tr
                key={tx.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Name / Title */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${catConf.bgLight} ${catConf.borderColor} ${catConf.textColor}`}
                    >
                      <CategoryIcon category={tx.category} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 text-sm truncate max-w-[180px] sm:max-w-xs">
                          {tx.title}
                        </p>
                        {tx.receiptUrl && (
                          <span
                            title="Receipt Thumbnail Processed"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                          >
                            Receipt
                          </span>
                        )}
                      </div>
                      {tx.description && (
                        <p className="text-xs text-slate-600 truncate max-w-[180px] sm:max-w-xs">
                          {tx.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${catConf.bgLight} ${catConf.borderColor} ${catConf.textColor}`}
                  >
                    {tx.category}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap font-medium">
                  {formatDate(tx.date, 'medium')}
                </td>

                {/* Payment Method */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap hidden md:table-cell">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200/60">
                    {tx.paymentMethod || 'UPI / GPay'}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span
                    className={`inline-flex items-center font-bold text-sm ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </td>

                {/* Action / Delete */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => onDeleteRequest(tx)}
                    title="Delete Transaction"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;

