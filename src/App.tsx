/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { QueueManagementPage } from './pages/QueueManagementPage';
import { CustomerDisplayPage } from './pages/CustomerDisplayPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SetupGuidePage } from './pages/SetupGuidePage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Layers } from 'lucide-react';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Handle URL hash routing or state initialization
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user signs in and is on landing/login/signup, automatically navigate to dashboard
  useEffect(() => {
    if (currentUser && (currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup')) {
      setCurrentTab('dashboard');
      window.location.hash = 'dashboard';
    }
  }, [currentUser, currentTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 animate-pulse mb-4">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing QueueMate...
        </p>
      </div>
    );
  }

  // Standalone Customer TV Display mode (Full-screen kiosk without regular sidebar)
  if (currentTab === 'customer-display') {
    return (
      <CustomerDisplayPage
        onBackToDashboard={() => navigate(currentUser ? 'dashboard' : 'landing')}
      />
    );
  }

  // Public Landing / Auth Pages
  if (currentTab === 'landing' || currentTab === 'features' || currentTab === 'how-it-works') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentTab === 'login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentTab === 'signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  // Setup guide can be accessed publicly or inside dashboard
  if (currentTab === 'setup-guide' && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('landing')}
              className="text-xs font-bold text-slate-700 hover:text-teal-600 flex items-center gap-1.5"
            >
              ← Back to QueueMate Home
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => navigate('signup')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-8">
          <SetupGuidePage />
        </div>
      </div>
    );
  }

  // Protected Dashboard Views (if not authenticated, redirect to login)
  if (!currentUser) {
    return <LoginPage onNavigate={navigate} />;
  }

  return (
    <DashboardLayout currentTab={currentTab} onNavigate={navigate}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      {currentTab === 'queue-management' && <QueueManagementPage onNavigate={navigate} />}
      {currentTab === 'analytics' && <AnalyticsPage />}
      {currentTab === 'settings' && <SettingsPage onNavigate={navigate} />}
      {currentTab === 'setup-guide' && <SetupGuidePage />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
