import React, { useState } from 'react';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { AddTransactionModal } from './components/AddTransactionModal';

import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeTab, isAddModalOpen, setIsAddModalOpen, toasts, removeToast } = useTransactions();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'analytics':
        return <Analytics />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Sticky Navbar */}
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p>
            <span className="font-semibold text-slate-700">SpendWise</span> — Smart Expense Tracker & Financial Analytics.
            Designed for AWS Serverless FaaS Demonstration (Amazon Lambda • API Gateway • DynamoDB • S3).
          </p>
        </footer>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Global Toast Notification System */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export const App = () => {
  return (
    <TransactionProvider>
      <MainLayout />
    </TransactionProvider>
  );
};

export default App;

