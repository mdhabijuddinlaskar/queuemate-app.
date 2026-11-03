import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Tv,
  Settings,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { TokenItem, QueueActivity, QueueSummary } from '../types';
import {
  subscribeToTodayTokens,
  subscribeToRecentActivities,
  calculateQueueSummary,
  callNextToken,
} from '../services/queueService';
import { formatTime, formatDateAndTime } from '../utils/format';
import { playTokenChime } from '../utils/audio';
import { TokenIssueModal } from '../components/common/TokenIssueModal';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { userProfile, business, isConfigured } = useAuth();
  const { success, error, info } = useToast();

  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [activities, setActivities] = useState<QueueActivity[]>([]);
  const [summary, setSummary] = useState<QueueSummary>({
    currentServingToken: null,
    waitingCount: 0,
    completedCount: 0,
    totalToday: 0,
    skippedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  useEffect(() => {
    if (!business?.id) {
      setLoading(false);
      return;
    }

    const unsubTokens = subscribeToTodayTokens(
      business.id,
      (newTokens) => {
        setTokens(newTokens);
        setSummary(calculateQueueSummary(newTokens));
        setLoading(false);
      },
      (err) => {
        console.error('Tokens subscription error:', err);
        setLoading(false);
      }
    );

    const unsubActivities = subscribeToRecentActivities(business.id, (acts) => {
      setActivities(acts);
    });

    return () => {
      unsubTokens();
      unsubActivities();
    };
  }, [business?.id]);

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

  const estWaitMins = summary.waitingCount * (business?.avgServiceMinutes || 10);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Operator Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {userProfile?.fullName || 'Operator'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Queue management for <strong className="text-white">{business?.name || 'your business'}</strong> ({business?.type || 'Service'}). Keep your waiting room running seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCallNext}
              disabled={callingNext || !isConfigured || summary.waitingCount === 0}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-40"
            >
              <PlayCircle className={`w-4 h-4 ${callingNext ? 'animate-spin' : ''}`} />
              <span>Call Next Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-teal-300" />
              <span>Issue Token</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Currently Serving */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Currently Serving
            </span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Ticket className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono-numbers">
              {summary.currentServingToken ? summary.currentServingToken.tokenNumber : '—'}
            </div>
            {summary.currentServingToken && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                In Service
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate">
            {summary.currentServingToken
              ? `Customer: ${summary.currentServingToken.customerName}`
              : 'No customer currently being served'}
          </p>
        </div>

        {/* Card 2: Waiting Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Waiting in Queue
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono-numbers">
              {summary.waitingCount}
            </div>
            <span className="text-xs text-slate-400">waiting</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Est. wait: ~{estWaitMins} mins</span>
          </p>
        </div>

        {/* Card 3: Completed Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Today
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono-numbers">
              {summary.completedCount}
            </div>
            <span className="text-xs text-slate-400">served</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {summary.skippedCount > 0 ? `${summary.skippedCount} skipped tokens` : '0 skipped so far'}
          </p>
        </div>

        {/* Card 4: Total Tokens Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Issued Today
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono-numbers">
              {summary.totalToday}
            </div>
            <span className="text-xs text-slate-400">tokens</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Sequential reset daily</p>
        </div>
      </div>

      {/* Main Grid: Active Queue Preview + Quick Tools + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Active Queue List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Live Waiting Queue</h3>
                <p className="text-xs text-slate-500">Upcoming customers ordered by token sequence</p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('queue-management')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Full Queue Desk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <span className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p>Loading queue data from Firestore...</p>
              </div>
            ) : tokens.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No tokens issued today</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Start by issuing a token to your first customer. The sequence will begin automatically.
                </p>
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Issue First Token</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tokens
                  .filter((t) => t.status === 'serving' || t.status === 'waiting')
                  .slice(0, 5)
                  .map((t) => {
                    const isServing = t.status === 'serving';
                    return (
                      <div
                        key={t.id}
                        className={`p-4 flex items-center justify-between transition-colors ${
                          isServing ? 'bg-teal-50/50' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-12 h-10 rounded-xl flex items-center justify-center font-mono-numbers font-bold text-sm border ${
                              isServing
                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {t.tokenNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900">
                                {t.customerName}
                              </span>
                              {isServing && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Currently Serving
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Issued at {formatTime(t.createdAt)}</span>
                              {t.customerPhone && <span>• {t.customerPhone}</span>}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${
                            isServing
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    );
                  })}

                {tokens.filter((t) => t.status === 'serving' || t.status === 'waiting').length ===
                  0 && (
                  <div className="p-8 text-center text-xs text-slate-500">
                    All waiting customers for today have been served!
                  </div>
                )}
              </div>
            )}

            {tokens.length > 5 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('queue-management')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  View all {tokens.length} tokens in Queue Management →
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onNavigate('customer-display')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Tv className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Customer Display</h4>
              <p className="text-xs text-slate-500 mt-1">
                Open full-screen waiting room TV kiosk mode with chimes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Wait Time Analytics</h4>
              <p className="text-xs text-slate-500 mt-1">
                View average service duration and completion performance.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Queue Settings</h4>
              <p className="text-xs text-slate-500 mt-1">
                Adjust avg duration ({business?.avgServiceMinutes || 10}m) & business type.
              </p>
            </button>
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Recent Queue Activity</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                Live Audit
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No activity logged today yet. Actions will appear in real time.
                </p>
              ) : (
                activities.map((act) => {
                  const badgeColor = {
                    issued: 'bg-blue-50 text-blue-700 border-blue-200',
                    called: 'bg-teal-50 text-teal-700 border-teal-200',
                    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    skipped: 'bg-amber-50 text-amber-700 border-amber-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                    status_changed: 'bg-slate-50 text-slate-700 border-slate-200',
                  }[act.type] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                          {act.type.toUpperCase()}
                        </span>
                        <span className="text-slate-400 font-mono-numbers text-[10px]">
                          {formatTime(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{act.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <TokenIssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
      />
    </div>
  );
};
