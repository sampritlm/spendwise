import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  Menu,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

export const Navbar = ({ onOpenSidebar }) => {
  const {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    searchQuery,
    setSearchQuery,
    setIsAddModalOpen,
    setActiveTab,
    monthlyTransactions,
    currency,
  } = useTransactions();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format month names like "November 2026"
  const formatMonthLabel = (mString) => {
    if (mString === 'all') return 'All Time Records';
    const [year, month] = mString.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setActiveTab('transactions');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search transactions, categories..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Month Picker, Notifications, Add Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Month Selector Dropdown */}
        <div className="relative">
          <div className="flex items-center bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 text-xs sm:text-sm font-medium py-1.5 px-3 rounded-xl border border-slate-200 transition-colors cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 mr-2 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-700 font-medium cursor-pointer focus:outline-none appearance-none pr-5 text-xs sm:text-sm"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-white text-slate-800">
                  {formatMonthLabel(m)}
                </option>
              ))}
              <option value="all" className="bg-white text-slate-800">
                All Recorded Months
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-4 pointer-events-none" />
          </div>
        </div>

        {/* Notifications Flyout */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">Notifications & Alerts</span>
                <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-slate-800">Salary Credited</p>
                    <p className="text-slate-500">₹55,000 received via Net Banking for Nov 2026.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Today</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-slate-800">Savings Target Hit</p>
                    <p className="text-slate-500">You saved over 60% of your income this month! Great discipline.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">1 day ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-slate-800">Bill Due Reminder</p>
                    <p className="text-slate-500">Broadband bill of ₹1,199 has been logged and accounted for.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Add Transaction */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Profile Avatar */}
        <div
          onClick={() => setActiveTab('settings')}
          className="cursor-pointer ml-1 ring-2 ring-slate-100 hover:ring-indigo-400 rounded-full transition-all"
          title="Account Settings"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;

