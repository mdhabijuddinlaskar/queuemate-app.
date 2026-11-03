import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Ticket,
  ChevronRight,
  AlertTriangle,
  PlayCircle,
  Database,
  ExternalLink,
} from 'lucide-react';
import { TokenIssueModal } from '../common/TokenIssueModal';
import { FirebaseSetupModal } from '../common/FirebaseSetupModal';
import { callNextToken } from '../../services/queueService';
import { useToast } from '../../context/ToastContext';
import { playTokenChime } from '../../utils/audio';

interface DashboardLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onNavigate,
  children,
}) => {
  const { business, userProfile, isConfigured } = useAuth();
  const { success, error, info } = useToast();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  const handleCallNext = async () => {
    if (!business || !userProfile) return;
    setCallingNext(true);
    try {
      const nextToken = await callNextToken(business.id, userProfile.uid);
      if (nextToken) {
        playTokenChime();
        success(`Now serving Token ${nextToken.tokenNumber} (${nextToken.customerName})`);
      } else {
        info('No customers are currently in the waiting queue.');
      }
    } catch (err: any) {
      console.error('Call next error:', err);
      error(err?.message || 'Failed to call next token.');
    } finally {
      setCallingNext(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={onNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {business?.name || 'QueueMate'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{business?.type || 'Business Queue'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      business?.status === 'closed'
                        ? 'bg-rose-500'
                        : business?.status === 'paused'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="capitalize font-medium">
                    Queue {business?.status || 'Active'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate('customer-display')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Open customer-facing TV display"
            >
              <span>Customer TV</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={handleCallNext}
              disabled={callingNext || !isConfigured}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Call the next waiting customer"
            >
              <PlayCircle className={`w-4 h-4 text-teal-600 ${callingNext ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Call Next</span>
              <span className="xs:hidden">Next</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueModalOpen(true)}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>Issue Token</span>
            </button>
          </div>
        </header>

        {/* Firebase Warning Banner if credentials are not configured */}
        {!isConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Firebase is not yet configured:</strong> To enable real Firestore persistence
                and cloud synchronization across devices, connect your Firebase project.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className="font-bold underline ml-3 shrink-0 hover:text-amber-950 flex items-center gap-1"
            >
              <span>Configure Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Global Modals */}
      <TokenIssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
      />

      <FirebaseSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </div>
  );
};
