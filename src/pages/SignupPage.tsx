import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';
import type { BusinessType } from '../types';
import { FirebaseSetupModal } from '../components/common/FirebaseSetupModal';

interface SignupPageProps {
  onNavigate: (tab: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, isConfigured } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Clinic');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Field Validations
    if (!fullName.trim() || !businessName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!isConfigured) {
      setSetupModalOpen(true);
      setErrorMessage('Please connect Firebase configuration first so user accounts can be authenticated.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        businessType,
      });

      success('Account created successfully! Welcome to QueueMate.');
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      let userMsg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        userMsg = 'This email address is already registered. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        userMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        userMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setErrorMessage(userMsg);
      error(userMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-950">
            Queue<span className="text-teal-600">Mate</span>
          </span>
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Register your business
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-semibold text-teal-600 hover:text-teal-700"
          >
            Log in here
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          {/* Firebase unconfigured reminder */}
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Firebase Credentials Needed</p>
                <p className="mt-0.5 text-amber-800">
                  Firebase Authentication is required to register and authenticate users safely.
                </p>
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(true)}
                  className="mt-2 text-xs font-bold px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg transition-colors inline-block"
                >
                  Configure Firebase Credentials
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Alexander Wright"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Wright Dental Clinic"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Clinic">Clinic / Healthcare</option>
                  <option value="Salon">Salon & Beauty Spa</option>
                  <option value="Service Centre">Service Centre / Repair</option>
                  <option value="Other">Other Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed pt-2">
              By creating an account, your business profile and queue records will be securely isolated in Cloud Firestore under your authenticated user ID.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Setup Queue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <FirebaseSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
