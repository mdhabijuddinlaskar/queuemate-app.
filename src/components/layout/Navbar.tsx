import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layers, Database, LogIn, UserPlus, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { FirebaseSetupModal } from '../common/FirebaseSetupModal';

interface NavbarProps {
  currentTab?: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'landing', onNavigate }) => {
  const { currentUser, business, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/10 transition-transform group-hover:scale-105">
              <Layers className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
                Queue<span className="text-teal-600">Mate</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                Smart Queue
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className={`hover:text-slate-900 transition-colors ${
                currentTab === 'landing' ? 'text-teal-600 font-bold' : ''
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => onNavigate('features')}
              className={`hover:text-slate-900 transition-colors ${
                currentTab === 'features' ? 'text-teal-600 font-bold' : ''
              }`}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => onNavigate('how-it-works')}
              className={`hover:text-slate-900 transition-colors ${
                currentTab === 'how-it-works' ? 'text-teal-600 font-bold' : ''
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onNavigate('setup-guide')}
              className={`hover:text-slate-900 transition-colors flex items-center gap-1.5 ${
                currentTab === 'setup-guide' ? 'text-teal-600 font-bold' : ''
              }`}
            >
              <span>Deployment Docs</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Firebase connection status indicator */}
            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                isConfigured
                  ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to view or edit Firebase configuration"
            >
              <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-teal-600' : 'text-amber-600'}`} />
              <span>{isConfigured ? 'Firebase Active' : 'Setup Firebase'}</span>
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Dashboard ({business?.name || 'My Queue'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all shadow-sm shadow-teal-600/20 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className={`p-1.5 rounded-lg border text-xs ${
                isConfigured ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <button
              type="button"
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('features');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('how-it-works');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('setup-guide');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              Deployment & Firebase Guide
            </button>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold text-center"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-semibold"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold shadow-sm"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <FirebaseSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </>
  );
};
