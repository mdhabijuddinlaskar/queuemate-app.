import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  SkipForward,
  XCircle,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import type { TokenItem } from '../types';
import { getTokensForAnalytics } from '../services/queueService';
import { getTodayDateStr, formatDurationMinutes } from '../utils/format';

export const AnalyticsPage: React.FC = () => {
  const { business } = useAuth();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('today');

  const fetchAnalytics = async () => {
    if (!business?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getTokensForAnalytics(business.id);
      setTokens(data);
    } catch (err) {
      console.error('Failed to load analytics tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [business?.id]);

  const todayStr = getTodayDateStr();

  // Filtered tokens by date range
  const filteredTokens = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return tokens.filter((t) => {
      if (dateFilter === 'today') {
        return t.dateStr === todayStr;
      }
      if (dateFilter === 'week') {
        return t.createdAt >= sevenDaysAgo;
      }
      return true; // all
    });
  }, [tokens, dateFilter, todayStr]);

  // Aggregate Metrics based on real database records
  const stats = useMemo(() => {
    const total = filteredTokens.length;
    const completed = filteredTokens.filter((t) => t.status === 'completed');
    const skipped = filteredTokens.filter((t) => t.status === 'skipped');
    const cancelled = filteredTokens.filter((t) => t.status === 'cancelled');
    const waiting = filteredTokens.filter((t) => t.status === 'waiting');
    const serving = filteredTokens.filter((t) => t.status === 'serving');

    // Calculate real average waiting time (time from createdAt until servedAt or completedAt)
    const servedTokensWithTimes = filteredTokens.filter((t) => t.servedAt && t.createdAt);
    let avgWaitMins = 0;
    if (servedTokensWithTimes.length > 0) {
      const totalWaitMs = servedTokensWithTimes.reduce((acc, t) => {
        return acc + Math.max(0, (t.servedAt || 0) - t.createdAt);
      }, 0);
      avgWaitMins = totalWaitMs / (servedTokensWithTimes.length * 60 * 1000);
    }

    // Completion rate
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    const skipRate = total > 0 ? Math.round((skipped.length / total) * 100) : 0;

    // Hourly distribution for chart (8 AM to 8 PM)
    const hoursCount: { [hour: number]: number } = {};
    for (let h = 8; h <= 20; h++) {
      hoursCount[h] = 0;
    }
    filteredTokens.forEach((t) => {
      const d = new Date(t.createdAt);
      const h = d.getHours();
      if (hoursCount[h] !== undefined) {
        hoursCount[h] += 1;
      }
    });

    const maxHourlyCount = Math.max(1, ...Object.values(hoursCount));

    return {
      total,
      completedCount: completed.length,
      skippedCount: skipped.length,
      cancelledCount: cancelled.length,
      waitingCount: waiting.length,
      servingCount: serving.length,
      avgWaitMins,
      completionRate,
      skipRate,
      hoursCount,
      maxHourlyCount,
      sampleSize: servedTokensWithTimes.length,
    };
  }, [filteredTokens]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Queue Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational metrics calculated from authenticated Cloud Firestore records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Tokens Issued
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono-numbers mt-2">
            {stats.total}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {dateFilter === 'today' ? "Today's tokens" : `In selected filter (${dateFilter})`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Average Wait Duration
          </span>
          <div className="text-3xl sm:text-4xl font-black text-teal-600 font-mono-numbers mt-2">
            {stats.sampleSize > 0 ? formatDurationMinutes(stats.avgWaitMins) : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.sampleSize > 0
              ? `Based on ${stats.sampleSize} served tokens`
              : 'Requires served tokens with timestamps'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Completion Rate
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono-numbers mt-2">
            {stats.completionRate}%
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.completedCount} completed of {stats.total} issued
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Skipped & Cancelled
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 font-mono-numbers mt-2">
            {stats.skippedCount + stats.cancelledCount}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.skippedCount} skipped, {stats.cancelledCount} cancelled
          </p>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Distribution Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900">Hourly Queue Volume</h3>
              <p className="text-xs text-slate-500">Distribution of token requests throughout the day</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              Peak: {stats.maxHourlyCount} tokens/hr
            </span>
          </div>

          {stats.total === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
              No token history recorded for this period yet.
            </div>
          ) : (
            <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-100">
              {Object.entries(stats.hoursCount).map(([hourStr, count]) => {
                const hour = parseInt(hourStr);
                const heightPercent = Math.max(6, Math.round((count / stats.maxHourlyCount) * 100));
                const label = hour === 12 ? '12p' : hour > 12 ? `${hour - 12}p` : `${hour}a`;

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono-numbers font-semibold text-slate-500 group-hover:text-teal-600">
                      {count > 0 ? count : ''}
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-md relative flex items-end h-40">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          count > 0
                            ? 'bg-teal-600 group-hover:bg-teal-500 shadow-xs'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-700">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-slate-400 text-center mt-3">
            Hours are displayed in local operating time (8:00 AM — 8:00 PM)
          </p>
        </div>

        {/* Status Breakdown Summary (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Queue Status Breakdown</h3>
            <p className="text-xs text-slate-500 mb-5">Lifecycle resolution across all tokens</p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                  <span className="font-mono-numbers">
                    {stats.completedCount} ({stats.completionRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <SkipForward className="w-3.5 h-3.5" /> Skipped
                  </span>
                  <span className="font-mono-numbers">
                    {stats.skippedCount} ({stats.skipRate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${stats.skipRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Clock className="w-3.5 h-3.5" /> Currently Waiting
                  </span>
                  <span className="font-mono-numbers">{stats.waitingCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{
                      width: `${stats.total > 0 ? (stats.waitingCount / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-3.5 h-3.5" /> Cancelled
                  </span>
                  <span className="font-mono-numbers">{stats.cancelledCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{
                      width: `${stats.total > 0 ? (stats.cancelledCount / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl text-xs text-slate-500">
            Analytics reflect actual Firestore records and zero client fabrication.
          </div>
        </div>
      </div>
    </div>
  );
};
