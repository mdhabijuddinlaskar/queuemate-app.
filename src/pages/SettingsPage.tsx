import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Clock,
  User,
  LogOut,
  Save,
  Database,
  Tag,
  ToggleLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { BusinessType, QueueOperationalStatus } from '../types';
import { updateBusiness } from '../services/queueService';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FirebaseSetupModal } from '../components/common/FirebaseSetupModal';

interface SettingsPageProps {
  onNavigate: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { business, userProfile, logout, refreshBusiness, isConfigured } = useAuth();
  const { success, error } = useToast();

  const [businessName, setBusinessName] = useState(business?.name || '');
  const [businessType, setBusinessType] = useState<BusinessType>(business?.type || 'Clinic');
  const [avgServiceMinutes, setAvgServiceMinutes] = useState(business?.avgServiceMinutes || 10);
  const [tokenPrefix, setTokenPrefix] = useState(business?.tokenPrefix || 'A');
  const [queueStatus, setQueueStatus] = useState<QueueOperationalStatus>(
    business?.status || 'open'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    if (!businessName.trim()) {
      error('Business name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await updateBusiness(business.id, {
        name: businessName.trim(),
        type: businessType,
        avgServiceMinutes: Number(avgServiceMinutes),
        tokenPrefix: tokenPrefix.trim().toUpperCase() || 'A',
        status: queueStatus,
      });

      await refreshBusiness();
      success('Settings updated successfully!');
    } catch (err: any) {
      console.error('Update business error:', err);
      error(err?.message || 'Failed to update business settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    onNavigate('landing');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure queue parameters, token prefix, and operational status
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveBusiness} className="space-y-6">
        {/* Business Profile Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>Business Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business / Clinic Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Wright Dental Clinic"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
              >
                <option value="Clinic">Clinic / Healthcare</option>
                <option value="Salon">Salon & Beauty Spa</option>
                <option value="Service Centre">Service Centre / Tech Support</option>
                <option value="Other">Other Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue Operational Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Queue Parameters & Timing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Avg Service Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                required
                value={avgServiceMinutes}
                onChange={(e) => setAvgServiceMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-mono-numbers border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used to compute estimated wait times on the Customer TV.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Daily Token Prefix
              </label>
              <input
                type="text"
                maxLength={4}
                value={tokenPrefix}
                onChange={(e) => setTokenPrefix(e.target.value.toUpperCase())}
                placeholder="A"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Preview: {tokenPrefix ? `${tokenPrefix}-001` : '001'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Queue Operational Status
              </label>
              <select
                value={queueStatus}
                onChange={(e) => setQueueStatus(e.target.value as QueueOperationalStatus)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium capitalize"
              >
                <option value="open">Open (Accepting Tokens)</option>
                <option value="paused">Paused (Temporarily on hold)</option>
                <option value="closed">Closed (Counter Finished)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Controls live queue intake state.
              </p>
            </div>
          </div>
        </div>

        {/* User Account Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <span>Account & Ownership</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Account Name
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {userProfile?.fullName || 'Operator'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block font-mono">
                {userProfile?.email || '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                User UID
              </span>
              <span className="text-slate-600 font-mono text-xs mt-0.5 block truncate">
                {userProfile?.uid || '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Business ID (Tenant Key)
              </span>
              <span className="text-slate-600 font-mono text-xs mt-0.5 block truncate">
                {business?.id || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Cloud & Database Diagnostic Panel */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Firebase Cloud Integration</h3>
              <p className="text-xs text-slate-400">
                {isConfigured
                  ? 'Cloud Firestore & Authentication are properly configured.'
                  : 'Firebase credentials missing or using fallback mode.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFirebaseModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Configure Credentials
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out of QueueMate"
        message="Are you sure you want to log out? Your queue status and token counters will remain safely preserved in Firestore."
        confirmLabel="Log Out"
        cancelLabel="Stay Logged In"
      />

      <FirebaseSetupModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />
    </div>
  );
};
