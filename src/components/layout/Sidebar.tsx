import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Tv,
  BarChart3,
  Settings,
  LogOut,
  Database,
  Layers,
  FileCode2,
  ChevronRight,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { FirebaseSetupModal } from '../common/FirebaseSetupModal';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { userProfile, business, logout, isConfigured } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'queue-management',
      label: 'Queue Management',
      icon: Users,
      badge: 'Live',
    },
    {
      id: 'customer-display',
      label: 'Customer Display',
      icon: Tv,
      badge: 'TV',
    },
    {
      id: 'analytics',
      label: 'Queue Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Business Settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'setup-guide',
      label: 'Setup & Deployment',
      icon: FileCode2,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    onNavigate('landing');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white font-sans">
                Queue<span className="text-teal-400">Mate</span>
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              v1.0
            </span>
          </div>

          {/* Business identity badge */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                {business?.type || 'Business'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  business?.status === 'closed'
                    ? 'bg-rose-500'
                    : business?.status === 'paused'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
            </div>
            <p className="font-bold text-sm text-white mt-1 truncate">
              {business?.name || 'My Queue System'}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Avg service: {business?.avgServiceMinutes || 10} mins
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-teal-500/20 text-teal-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section: Database status & user logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {/* Firebase Connection Diagnostic Trigger */}
          <button
            type="button"
            onClick={() => setShowFirebaseModal(true)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-colors ${
              isConfigured
                ? 'bg-slate-900/40 text-teal-400 border-teal-500/20 hover:bg-teal-950/30'
                : 'bg-amber-950/20 text-amber-300 border-amber-500/30 hover:bg-amber-950/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <span>{isConfigured ? 'Firebase: Connected' : 'Firebase: Action Needed'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* User profile row */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
                {userProfile?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {userProfile?.fullName || 'Operator'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{userProfile?.email || ''}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors shrink-0"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to log out of QueueMate? You can log back in at any time with your email and password."
        confirmLabel="Log Out"
        cancelLabel="Stay Logged In"
      />

      <FirebaseSetupModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />
    </>
  );
};
