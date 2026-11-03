import React from 'react';
import {
  Ticket,
  Users,
  Tv,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Smartphone,
  Sparkles,
  Building2,
  Stethoscope,
  Scissors,
  Wrench,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar currentTab="landing" onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Smart Digital Queue Management for Modern Businesses</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 font-sans leading-tight sm:leading-none">
              Queues Made <span className="text-teal-600 underline decoration-teal-300 decoration-wavy decoration-2">Simple</span>.
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              QueueMate helps clinics, salons, service centres, and local businesses eliminate crowded waiting rooms. Issue digital tokens, call next customers with one click, and broadcast live waiting times to any TV or tablet.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base transition-all shadow-md shadow-teal-600/20 hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign In to Dashboard</span>
              </button>
            </div>

            {/* Feature highlights bullet row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" /> No bulky hardware required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" /> Cloud Firestore synchronization
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600" /> TV Kiosk ready in seconds
              </span>
            </div>
          </div>

          {/* Interactive Preview Mockup Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">queuemate.app/dashboard</span>
              </div>
              <span className="text-[11px] font-semibold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                Live Queue Demo
              </span>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently Serving</span>
                  <div className="text-4xl font-black text-teal-600 font-mono-numbers mt-1">A-024</div>
                  <div className="text-sm font-bold text-slate-800 mt-2">Dr. Chen's Clinic</div>
                  <div className="text-xs text-slate-500">Room 3 • General Practice</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-600">
                  <span>Serving Now</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waiting in Line</span>
                  <div className="text-4xl font-black text-slate-900 font-mono-numbers mt-1">4 <span className="text-lg text-slate-400 font-normal">people</span></div>
                  <div className="text-xs text-slate-600 mt-2">Next in queue: <strong className="text-slate-800 font-mono-numbers">A-025, A-026</strong></div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Est. wait time:</span>
                  <strong className="text-slate-800 font-mono-numbers">~18 mins</strong>
                </div>
              </div>

              <div className="p-5 bg-teal-900 text-white rounded-xl shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">Quick Operator Desk</span>
                  <p className="text-xs text-teal-100/80 mt-1">Single click to advance queue, notify waiting hall chime, and log timestamp.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="mt-4 w-full py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Try Operator Console</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / Business Types Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by service professionals worldwide
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Clinics & Doctors</p>
                <p className="text-xs text-slate-500">Patient privacy & order</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Salons & Spas</p>
                <p className="text-xs text-slate-500">Walk-in queue manager</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Service Centres</p>
                <p className="text-xs text-slate-500">Auto, tech & repair desks</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Small Businesses</p>
                <p className="text-xs text-slate-500">Banks, bakeries & shops</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
              Everything you need to run a calm waiting room
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Say goodbye to paper tickets and shouting customer names. QueueMate puts modern queue technology in your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-5">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sequential Digital Tokens</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Issue clean, zero-padded daily token numbers (e.g. #A-001, #002) with atomic Firestore transactions to prevent duplicate tokens and concurrency race conditions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-5">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Live Customer TV Display</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Full-screen kiosk mode for waiting room television screens and iPads. Updates in real-time via Firestore listeners with audio chimes and estimated wait times.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Queue Analytics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Track total served customers, average wait durations, completion rates, and skipped tokens based on genuine database timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-4 tracking-tight">
              How QueueMate Works in 4 Steps
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Set up your business queue in under 2 minutes and start issuing digital tokens immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">Create Account</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign up with your business name, select your business category, and customize your token prefix.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">Issue Tokens</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter customer name and optional phone number. QueueMate increments the daily token sequence safely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">Call Next Customer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click "Call Next". The system transitions token to Serving, plays a chime, and logs timestamp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-1">Live TV Broadcast</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Display the Customer Screen on any waiting room TV or tablet with automatic real-time updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xl font-black text-white font-sans">
                Queue<span className="text-teal-400">Mate</span>
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Smart Digital Queue Management System. Built for clinics, salons, and service businesses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => onNavigate('setup-guide')}
                className="hover:text-white transition-colors"
              >
                Firebase & Vercel Guide
              </button>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="text-teal-400 hover:text-teal-300 font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© {new Date().getFullYear()} QueueMate Inc. All rights reserved.</span>
            <span>Cloud Firestore Powered • Real-time Zero-Latency Queue</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
