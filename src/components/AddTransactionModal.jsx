import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES_LIST, PAYMENT_METHODS, CATEGORY_CONFIG } from '../utils/formatters';
import { useTransactions } from '../context/TransactionContext';

export const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, currency } = useTransactions();

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Expense',
    category: 'Food',
    date: today,
    paymentMethod: 'UPI / GPay / PhonePe',
    description: '',
    receiptUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, receiptUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Transaction title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    const amt = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amt)) {
      newErrors.amount = 'Valid amount is required';
    } else if (amt <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    const result = await addTransaction({
      title: formData.title,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      description: formData.description,
      receiptUrl: formData.receiptUrl,
    });
    setSubmitting(false);

    if (result && result.success) {
      // Reset form and close
      setFormData({
        title: '',
        amount: '',
        type: 'Expense',
        category: 'Food',
        date: today,
        paymentMethod: 'UPI / GPay / PhonePe',
        description: '',
        receiptUrl: '',
      });
      setImagePreview(null);
      setErrors({});
      onClose();
    }
  };

  // Switch category automatically to appropriate default when changing type
  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'Income' ? 'Salary' : 'Food',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-fade-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Transaction</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter transaction details to update balances and analytics
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Type Toggle: Expense / Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleTypeChange('Expense')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  formData.type === 'Expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Income')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  formData.type === 'Income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Payee *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Swiggy Food Delivery, Client Retainer, Rent"
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 font-semibold transition-all ${
                    errors.amount
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add optional notes, receipt reference or memo..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Receipt / Invoice Upload (AWS Lambda Thumbnail Handler Demo) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Attach Receipt / Invoice (Optional)</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                AWS FaaS Thumbnail Trigger
              </span>
            </label>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50/30 transition-all text-center group">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mb-1" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-600">
                  Click to upload bill image / receipt
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Triggers Lambda image processing handler for thumbnail generation
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <img
                  src={imagePreview}
                  alt="Receipt Thumbnail"
                  className="w-14 h-14 object-cover rounded-lg border border-indigo-200 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    Receipt Image Attached
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Thumbnail processed via Lambda handler
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, receiptUrl: '' }));
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition-all flex items-center gap-2 ${
                formData.type === 'Income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
              } disabled:opacity-60`}
            >
              {submitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;

