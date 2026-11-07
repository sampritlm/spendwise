import { api } from './api';
import { config } from '../config';
import { INITIAL_TRANSACTIONS } from '../utils/sampleData';

const STORAGE_KEY = 'spendwise_transactions_v1';

/**
 * Helper to get local storage transactions
 * @returns {Array} List of transactions
 */
const getStoredTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return [...INITIAL_TRANSACTIONS];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return [...INITIAL_TRANSACTIONS];
  }
};

/**
 * Helper to save local storage transactions
 * @param {Array} transactions 
 */
const setStoredTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
};

/**
 * Transaction Service Layer
 * Abstracts data access and cleanly delegates between Local Mock Prototype mode
 * and live AWS Lambda FaaS endpoints.
 */
export const transactionService = {
  /**
   * Fetch all transactions with optional filtering and sorting
   * Lambda: getTransactions (HTTP GET /transactions)
   */
  async getTransactions(filters = {}) {
    if (config.useMockApi) {
      // Simulate realistic slight network latency for authentic feel
      await new Promise((resolve) => setTimeout(resolve, 80));
      let items = getStoredTransactions();

      // Filter by Month (format YYYY-MM)
      if (filters.month && filters.month !== 'all') {
        items = items.filter((tx) => tx.date.startsWith(filters.month));
      }

      // Filter by Type (Income/Expense)
      if (filters.type && filters.type !== 'all') {
        items = items.filter((tx) => tx.type.toLowerCase() === filters.type.toLowerCase());
      }

      // Filter by Category
      if (filters.category && filters.category !== 'all') {
        items = items.filter((tx) => tx.category.toLowerCase() === filters.category.toLowerCase());
      }

      // Filter by Search Query (Title, Description, Category)
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(
          (tx) =>
            tx.title.toLowerCase().includes(q) ||
            (tx.description && tx.description.toLowerCase().includes(q)) ||
            tx.category.toLowerCase().includes(q) ||
            tx.paymentMethod.toLowerCase().includes(q)
        );
      }

      // Sort
      const sortBy = filters.sortBy || 'date_desc';
      items.sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });

      return { success: true, data: items, count: items.length };
    }

    // Live AWS Lambda via API Gateway
    return api.get('/transactions', filters);
  },

  /**
   * Create a new transaction
   * Lambda: addTransaction (HTTP POST /transactions)
   */
  async addTransaction(newTx) {
    if (config.useMockApi) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const items = getStoredTransactions();

      const itemToSave = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: newTx.title.trim(),
        amount: Number(newTx.amount),
        type: newTx.type,
        category: newTx.category,
        date: newTx.date,
        paymentMethod: newTx.paymentMethod || 'UPI / GPay / PhonePe',
        description: newTx.description ? newTx.description.trim() : '',
        createdAt: new Date().toISOString(),
      };

      // Add to beginning of array
      const updated = [itemToSave, ...items];
      setStoredTransactions(updated);

      return { success: true, data: itemToSave };
    }

    // Live AWS Lambda via API Gateway
    return api.post('/transactions', newTx);
  },

  /**
   * Delete a transaction by ID
   * Lambda: deleteTransaction (HTTP DELETE /transactions?id=...)
   */
  async deleteTransaction(id) {
    if (config.useMockApi) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      const items = getStoredTransactions();
      const updated = items.filter((tx) => tx.id !== id);
      setStoredTransactions(updated);
      return { success: true, message: 'Transaction deleted successfully' };
    }

    // Live AWS Lambda via API Gateway
    return api.delete('/transactions', { id });
  },

  /**
   * Generate monthly financial analytics summary
   * Lambda: getMonthlySummary (HTTP GET /summary?month=YYYY-MM)
   */
  async getMonthlySummary(month = null) {
    if (config.useMockApi) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      const items = getStoredTransactions();

      // If specific month is passed, filter by it, else use all or latest month
      const targetMonth = month && month !== 'all' ? month : null;
      const filtered = targetMonth
        ? items.filter((tx) => tx.date.startsWith(targetMonth))
        : items;

      let totalIncome = 0;
      let totalExpenses = 0;
      const categoryBreakdown = {};

      filtered.forEach((tx) => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'Income') {
          totalIncome += amt;
        } else if (tx.type === 'Expense') {
          totalExpenses += amt;
          categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + amt;
        }
      });

      const totalBalance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 
        ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) 
        : 0;

      // Format category breakdown with percentage
      const categoryList = Object.entries(categoryBreakdown).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      })).sort((a, b) => b.amount - a.amount);

      return {
        success: true,
        data: {
          month: targetMonth || 'all',
          totalBalance,
          totalIncome,
          totalExpenses,
          savingsRate,
          categoryBreakdown: categoryList,
          transactionCount: filtered.length,
        },
      };
    }

    // Live AWS Lambda via API Gateway
    return api.get('/summary', month ? { month } : {});
  },

  /**
   * Helper for prototype testing to reset sample data
   */
  resetToSampleData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    return [...INITIAL_TRANSACTIONS];
  },
};

export default transactionService;

