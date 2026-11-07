import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { transactionService } from '../services/transactionService';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('spendwise_currency') || 'INR';
  });
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast notification system
  const showToast = useCallback((type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save currency to localStorage whenever changed
  const updateCurrency = useCallback((newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('spendwise_currency', newCurrency);
    showToast('info', 'Currency Updated', `Display currency changed to ${newCurrency}`);
  }, [showToast]);

  // Load all transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await transactionService.getTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showToast('error', 'Failed to load', err.message || 'Could not fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Derive unique months available in data
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthSet.add(tx.date.substring(0, 7));
      }
    });
    // Ensure 2026-11 is always in the list even if no transactions
    monthSet.add('2026-11');
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  // Filtered transactions by the currently selected month
  const monthlyTransactions = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'all') {
      return transactions;
    }
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Dynamically calculate summary stats based on monthlyTransactions
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;

    monthlyTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') {
        income += amt;
      } else if (tx.type === 'Expense') {
        expenses += amt;
      }
    });

    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

    return {
      totalBalance: balance,
      totalIncome: income,
      totalExpenses: expenses,
      savingsRate,
      transactionCount: monthlyTransactions.length,
    };
  }, [monthlyTransactions]);

  // Add new transaction
  const addTransaction = useCallback(async (txData) => {
    try {
      const res = await transactionService.addTransaction(txData);
      if (res.success && res.data) {
        // Optimistically update list
        setTransactions((prev) => [res.data, ...prev]);
        showToast('success', 'Transaction Added', `${res.data.type === 'Income' ? 'Received' : 'Spent'} ${res.data.title}`);
        return { success: true, data: res.data };
      }
    } catch (err) {
      showToast('error', 'Error Adding Transaction', err.message || 'Operation failed');
      return { success: false, error: err.message };
    }
  }, [showToast]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id, title = 'Transaction') => {
    try {
      const res = await transactionService.deleteTransaction(id);
      if (res.success) {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
        showToast('info', 'Transaction Removed', `Deleted "${title}" successfully`);
        return { success: true };
      }
    } catch (err) {
      showToast('error', 'Error Deleting', err.message || 'Failed to remove');
      return { success: false, error: err.message };
    }
  }, [showToast]);

  // Reset to original sample data
  const resetToSampleData = useCallback(() => {
    const data = transactionService.resetToSampleData();
    setTransactions(data);
    setSelectedMonth('2026-11');
    showToast('success', 'Reset Complete', 'Transactions restored to realistic demo dataset');
  }, [showToast]);

  const value = {
    transactions,
    monthlyTransactions,
    loading,
    currency,
    setCurrency: updateCurrency,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
    toasts,
    showToast,
    removeToast,
    summary,
    addTransaction,
    deleteTransaction,
    resetToSampleData,
    refreshData: loadTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

