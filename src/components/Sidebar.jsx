import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  FolderTree,
  Settings,
  LogOut,
  Sparkles,
  Cloud,
  ChevronRight,
  X
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useTransactions();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Spend<span className="text-indigo-600">Wise</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                FaaS • AWS Serverless
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}

          {/* Academic AWS Architecture Callout */}
          <div className="pt-6 px-1">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-100/80">
              <div className="flex items-center gap-2 mb-1.5">
                <Cloud className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-900">
                  Cloud Backend
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                Engineered for AWS Lambda Python 3.12 with API Gateway & DynamoDB.
              </p>
              <button
                onClick={() => handleNavClick('settings')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Inspect AWS Config
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom: User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                  alt="Aarav Sharma"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  Aarav Sharma
                </p>
                <p className="text-xs text-slate-600 truncate">
                  aarav@spendwise.dev
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Do you want to switch or sign out of this session?')) {
                  handleNavClick('settings');
                }
              }}
              title="Logout / Account settings"
              className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

