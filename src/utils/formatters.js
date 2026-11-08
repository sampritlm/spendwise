/**
 * Utility functions for formatting currency, dates, numbers, and styling mappings
 */

/**
 * Formats a number as INR (₹) or given currency code
 * @param {number} amount - The numeric value
 * @param {string} currency - 'INR' | 'USD' | 'EUR' | 'GBP'
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || '₹';

  if (currency === 'INR') {
    // Indian numbering format (lakhs, crores)
    return `${symbol}${num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })}`;
  }

  return `${symbol}${num.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Formats a date string (YYYY-MM-DD or ISO) into readable presentation
 * @param {string} dateString 
 * @param {'short'|'medium'|'long'} format
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (format === 'short') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Formats percentage
 * @param {number} value 
 */
export const formatPercent = (value) => {
  const num = Number(value) || 0;
  return `${Math.round(num)}%`;
};

/**
 * Category styling configurations: icon names, colors, and badge styles
 */
export const CATEGORY_CONFIG = {
  Food: {
    color: '#f97316', // Orange
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    iconName: 'UtensilsCrossed',
    type: 'Expense',
  },
  Shopping: {
    color: '#8b5cf6', // Violet
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    iconName: 'ShoppingBag',
    type: 'Expense',
  },
  Transportation: {
    color: '#0ea5e9', // Sky Blue
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    iconName: 'Car',
    type: 'Expense',
  },
  Education: {
    color: '#6366f1', // Indigo
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    iconName: 'GraduationCap',
    type: 'Expense',
  },
  Entertainment: {
    color: '#ec4899', // Pink
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    iconName: 'Film',
    type: 'Expense',
  },
  Healthcare: {
    color: '#ef4444', // Red
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    iconName: 'HeartPulse',
    type: 'Expense',
  },
  Bills: {
    color: '#eab308', // Amber
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    iconName: 'Receipt',
    type: 'Expense',
  },
  Salary: {
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    iconName: 'Wallet',
    type: 'Income',
  },
  Freelance: {
    color: '#06b6d4', // Cyan
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    iconName: 'Briefcase',
    type: 'Income',
  },
  Other: {
    color: '#64748b', // Slate
    bgLight: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    iconName: 'CircleDot',
    type: 'Expense',
  },
};

export const PAYMENT_METHODS = [
  'Razorpay Online',
  'UPI / GPay / PhonePe',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export const CATEGORIES_LIST = Object.keys(CATEGORY_CONFIG);

