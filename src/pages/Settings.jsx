import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Coins,
  Bell,
  Moon,
  Sun,
  Cloud,
  Database,
  Server,
  Activity,
  CheckCircle2,
  RefreshCw,
  Save,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  Lock
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { config, updateRuntimeConfig } from '../config';
import { razorpayService } from '../services/razorpayService';

export const Settings = () => {
  const { currency, setCurrency, resetToSampleData, showToast } = useTransactions();

  // Profile local state
  const [profile, setProfile] = useState({
    name: 'Aarav Sharma',
    email: 'aarav@spendwise.dev',
    jobTitle: 'Senior Cloud Solutions Architect',
    organization: 'Fintech Cloud Labs',
  });

  // Notification toggles
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetExceeded: true,
    weeklyReport: false,
    monthlySummary: true,
  });

  // AWS Configuration live state
  const [apiUrl, setApiUrl] = useState(config.apiBaseUrl || '');
  const [useMock, setUseMock] = useState(config.useMockApi);
  const [awsTesting, setAwsTesting] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    showToast('success', 'Profile Updated', 'User preferences saved successfully');
  };

  const handleSaveAwsConfig = () => {
    updateRuntimeConfig(apiUrl.trim(), useMock);
    showToast(
      'info',
      'AWS Configuration Saved',
      useMock
        ? 'Using Mock Prototype API (localStorage)'
        : `Connected to API Gateway: ${apiUrl || 'Default'}`
    );
  };

  const handleTestConnection = async () => {
    if (!apiUrl) {
      showToast('error', 'Missing URL', 'Please enter an Amazon API Gateway endpoint URL first');
      return;
    }
    setAwsTesting(true);
    try {
      const res = await fetch(`${apiUrl.replace(/\/+$/, '')}/summary`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        showToast('success', 'AWS Connected', 'Successfully received response from API Gateway!');
      } else {
        showToast('error', 'Gateway Error', `API responded with status ${res.status}`);
      }
    } catch (err) {
      showToast(
        'error',
        'Connection Failed',
        'Could not reach endpoint. Ensure CORS is enabled on API Gateway.'
      );
    } finally {
      setAwsTesting(false);
    }
  };

  const handleTestRazorpay = async () => {
    try {
      showToast('info', 'Opening Razorpay', `Launching checkout with Key: ${config.razorpayKeyId.substring(0, 12)}...`);
      await razorpayService.openCheckout({
        amount: 1,
        title: 'SpendWise Verification',
        description: 'Gateway Connectivity Test (₹1)',
        onSuccess: (res) => {
          showToast('success', 'Razorpay Success', `Payment verified! ID: ${res.paymentId}`);
        },
        onFailure: (err) => {
          showToast('info', 'Razorpay Dismissed', err.message || 'Modal closed');
        },
      });
    } catch (err) {
      showToast('error', 'Razorpay Error', err.message || 'Could not launch checkout');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal profile, currency formatting, and AWS Serverless FaaS connectivity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Profile Information</h3>
            <p className="text-xs text-slate-500">Your account identity and demo details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50"
            />
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-sm font-bold text-slate-800 block">{profile.name}</span>
              <span className="text-xs text-slate-500 block">{profile.email}</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                Primary Account Owner
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Currency & Preferences */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Regional & Currency Preferences</h3>
            <p className="text-xs text-slate-500">Configure default display currency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Display Currency</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { code: 'INR', symbol: '₹', label: 'Indian Rupee (Default)' },
                { code: 'USD', symbol: '$', label: 'US Dollar' },
                { code: 'EUR', symbol: '€', label: 'Euro' },
                { code: 'GBP', symbol: '£', label: 'British Pound' },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currency === c.code
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <span className="text-base font-bold mr-1.5">{c.symbol}</span>
                  <span className="text-xs font-semibold">{c.code}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{c.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Theme Mode</label>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-800">Fintech Light Theme (Active)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clean minimal light styling optimized with deep navy typography, emerald positive accents, and soft slate background for financial clarity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Notification Settings</h3>
            <p className="text-xs text-slate-500">Configure financial reminders and reports</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            { key: 'emailAlerts', title: 'High Expense Warning', desc: 'Notify when a single transaction exceeds ₹10,000' },
            { key: 'budgetExceeded', title: 'Monthly Budget Alerts', desc: 'Alert when category spending exceeds 80% threshold' },
            { key: 'weeklyReport', title: 'Weekly Digest', desc: 'Weekly financial recap and spending tips' },
            { key: 'monthlySummary', title: 'Monthly Summary Report', desc: 'Auto-generate income vs expense overview at month close' },
          ].map((item) => (
            <div key={item.key} className="py-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">{item.title}</span>
                <span className="text-[11px] text-slate-500 block">{item.desc}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.key]: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Razorpay Payment Gateway Integration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <CreditCard className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Razorpay Payment Gateway</h3>
              <p className="text-xs text-slate-500">Live payment processor for bills, expenses, and instant checkout</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Gateway Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Razorpay Key ID
            </span>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <code className="text-xs font-mono font-bold text-slate-800 break-all">
                {config.razorpayKeyId}
              </code>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Supported Payment Methods
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {['UPI (GPay/PhonePe)', 'Credit & Debit Cards', 'NetBanking', 'QR Code'].map((m) => (
                <span key={m} className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-700 border border-slate-200">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 max-w-md">
            Clicking the test button will trigger Razorpay's official checkout modal on your screen using your live key ID.
          </p>

          <button
            type="button"
            onClick={handleTestRazorpay}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-sky-200" />
            <span>Test ₹1 Razorpay Checkout</span>
          </button>
        </div>
      </div>

      {/* AWS Serverless Architecture & Cloud Integration Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-soft-lg border border-indigo-900/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                AWS Serverless (FaaS) Architecture Panel
              </h3>
              <p className="text-xs text-indigo-200">
                Academic Project Demonstration: Amazon Lambda (Python 3.12) + API Gateway + DynamoDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                useMock
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${useMock ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {useMock ? 'Mock API Active' : 'Live AWS Endpoint Active'}
            </span>
          </div>
        </div>

        {/* 4-Box Serverless Pipeline Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Server className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
            <span className="text-xs font-bold text-white block">React + Vite</span>
            <span className="text-[10px] text-slate-400">Frontend / S3 Hosted</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
            <span className="text-xs font-bold text-white block">API Gateway</span>
            <span className="text-[10px] text-slate-400">HTTP API Routes</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Cloud className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <span className="text-xs font-bold text-white block">AWS Lambda</span>
            <span className="text-[10px] text-slate-400">Python 3.12 FaaS</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <Database className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <span className="text-xs font-bold text-white block">Amazon DynamoDB</span>
            <span className="text-[10px] text-slate-400">Transactions Table</span>
          </div>
        </div>

        {/* Endpoint Input & Mode Switch */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">
              API Gateway Invoke URL (VITE_API_BASE_URL)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Mock Mode:</span>
              <button
                type="button"
                onClick={() => setUseMock(!useMock)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  useMock
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {useMock ? 'Mock Enabled' : 'Mock Disabled'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://xyz123.execute-api.ap-south-1.amazonaws.com"
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={awsTesting}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {awsTesting ? 'Testing...' : 'Test Ping'}
              </button>
              <button
                type="button"
                onClick={handleSaveAwsConfig}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Apply Config
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Tip: In mock prototype mode, SpendWise stores all data in your browser's localStorage using the exact same JSON schema as the DynamoDB table. When you switch off mock mode, the service layer makes direct HTTP calls to the Lambda endpoints.
          </p>
        </div>

        {/* Demo Data Reset Helper */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white block">Reset Prototype Data</span>
            <span className="text-[11px] text-slate-400 block">
              Restore the initial realistic transactions dataset (Nov 2026: ₹65,000 income, ₹22,150 expenses)
            </span>
          </div>

          <button
            type="button"
            onClick={resetToSampleData}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Transactions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

