import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Database,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { FirebaseSetupModal } from '../components/common/FirebaseSetupModal';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, resetPassword, isConfigured } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    if (!isConfigured) {
      setSetupModalOpen(true);
      setErrorMessage('Please connect Firebase configuration first so user authentication can work.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      success('Logged in successfully!');
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      let userMsg = 'Authentication failed. Please verify your email and password.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        userMsg = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many failed login attempts. Please wait a moment or reset your password.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setErrorMessage(userMsg);
      error(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      error('Please enter your account email address.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      success(`Password reset email sent to ${resetEmail.trim()}. Please check your inbox.`);
      setResetModalOpen(false);
      setResetEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (err.message) {
        msg = err.message;
      }
      error(msg);
    } finally {
      setResetLoading(false);
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
          Sign in to your queue
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="font-semibold text-teal-600 hover:text-teal-700"
          >
            Create one free
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Firebase Credentials Needed</p>
                <p className="mt-0.5 text-amber-800">
                  Firebase Authentication is required to verify your password and sign in.
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
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
                  placeholder="operator@clinic.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetModalOpen(true);
                  }}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Need help deploying to production?{' '}
              <button
                type="button"
                onClick={() => onNavigate('setup-guide')}
                className="font-medium text-slate-800 underline hover:text-teal-600"
              >
                View Vercel & Firebase Guide
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Password"
        description="Enter your account email to receive a password reset link."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="operator@clinic.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </Modal>

      <FirebaseSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
