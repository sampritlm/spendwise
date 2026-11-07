import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const DeleteConfirmModal = ({ isOpen, onClose, transaction, onConfirm }) => {
  const { currency } = useTransactions();

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Transaction</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 mb-5 text-sm space-y-1">
          <p className="font-semibold text-slate-800">{transaction.title}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Category: {transaction.category}</span>
            <span
              className={`font-bold ${
                transaction.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {transaction.type === 'Income' ? '+' : '-'}
              {formatCurrency(transaction.amount, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(transaction.id, transaction.title);
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm shadow-rose-600/25 transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

