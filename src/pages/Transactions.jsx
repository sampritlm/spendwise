import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Calendar,
  Layers,
  Trash2,
  RefreshCw,
  X
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { TransactionTable } from '../components/TransactionTable';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { CATEGORIES_LIST } from '../utils/formatters';

export const Transactions = () => {
  const {
    transactions,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    deleteTransaction,
    setIsAddModalOpen,
    searchQuery: globalSearch,
  } = useTransactions();

  const [search, setSearch] = useState(globalSearch || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [txToDelete, setTxToDelete] = useState(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by Month
    if (selectedMonth && selectedMonth !== 'all') {
      result = result.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
    }

    // Filter by Type
    if (selectedType !== 'all') {
      result = result.filter((tx) => tx.type.toLowerCase() === selectedType.toLowerCase());
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(
        (tx) => tx.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (tx) =>
          tx.title.toLowerCase().includes(q) ||
          (tx.description && tx.description.toLowerCase().includes(q)) ||
          tx.category.toLowerCase().includes(q) ||
          tx.paymentMethod.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, selectedMonth, selectedType, selectedCategory, search, sortBy]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = ['ID', 'Title', 'Type', 'Category', 'Amount (INR)', 'Date', 'Payment Method', 'Description'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.type,
      tx.category,
      tx.amount,
      tx.date,
      `"${tx.paymentMethod}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendWise_Transactions_${selectedMonth || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedMonth('all');
    setSortBy('date_desc');
  };

  const hasActiveFilters =
    search !== '' || selectedCategory !== 'all' || selectedType !== 'all' || selectedMonth !== 'all';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, filter, search, and review all your income and expenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            title="Export filtered records to CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description, method..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m === '2026-11' ? 'Nov 2026 (Active)' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="Expense">Expense Only</option>
              <option value="Income">Income Only</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Sorting & Reset */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-700 font-medium cursor-pointer focus:outline-none"
            >
              <option value="date_desc">Date (Newest first)</option>
              <option value="date_asc">Date (Oldest first)</option>
              <option value="amount_desc">Amount (Highest first)</option>
              <option value="amount_asc">Amount (Lowest first)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredTransactions.length}</span> of {transactions.length} records
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Table Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-soft">
        <TransactionTable
          transactions={filteredTransactions}
          showAll={true}
          onDeleteRequest={(tx) => setTxToDelete(tx)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        transaction={txToDelete}
        onConfirm={(id, title) => deleteTransaction(id, title)}
      />
    </div>
  );
};

export default Transactions;

