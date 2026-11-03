import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Ticket,
  Search,
  Filter,
  PlayCircle,
  CheckCircle,
  SkipForward,
  XCircle,
  Clock,
  Phone,
  User,
  AlertCircle,
  Plus,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import type { TokenItem, TokenStatus } from '../types';
import {
  subscribeToTodayTokens,
  callNextToken,
  updateTokenStatus,
} from '../services/queueService';
import { formatTime, formatDateAndTime } from '../utils/format';
import { playTokenChime } from '../utils/audio';
import { TokenIssueModal } from '../components/common/TokenIssueModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface QueueManagementPageProps {
  onNavigate?: (tab: string) => void;
}

export const QueueManagementPage: React.FC<QueueManagementPageProps> = () => {
  const { business, userProfile, isConfigured } = useAuth();
  const { success, error, info } = useToast();

  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TokenStatus>('all');

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  // Cancellation confirm dialog state
  const [tokenToCancel, setTokenToCancel] = useState<TokenItem | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Status change dialog or direct handler
  const [updatingTokenId, setUpdatingTokenId] = useState<string | null>(null);

  useEffect(() => {
    if (!business?.id) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToTodayTokens(
      business.id,
      (newTokens) => {
        setTokens(newTokens);
        setLoading(false);
      },
      (err) => {
        console.error('Queue subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [business?.id]);

  const handleCallNext = async () => {
    if (!business || !userProfile) return;
    setCallingNext(true);
    try {
      const nextToken = await callNextToken(business.id, userProfile.uid);
      if (nextToken) {
        playTokenChime();
        success(`Called Token ${nextToken.tokenNumber} (${nextToken.customerName})`);
      } else {
        info('No customers in the waiting line.');
      }
    } catch (err: any) {
      console.error('Call next error:', err);
      error(err?.message || 'Failed to call next token.');
    } finally {
      setCallingNext(false);
    }
  };

  const handleStatusChange = async (token: TokenItem, newStatus: TokenStatus) => {
    if (!business || !userProfile) return;
    setUpdatingTokenId(token.id);
    try {
      await updateTokenStatus({
        tokenId: token.id,
        businessId: business.id,
        ownerId: userProfile.uid,
        status: newStatus,
        tokenNumber: token.tokenNumber,
        customerName: token.customerName,
      });

      if (newStatus === 'serving') {
        playTokenChime();
      }

      success(`Token ${token.tokenNumber} marked as ${newStatus}.`);
    } catch (err: any) {
      console.error('Status update error:', err);
      error(err?.message || 'Failed to update token status.');
    } finally {
      setUpdatingTokenId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!tokenToCancel || !business || !userProfile) return;
    setCancelLoading(true);
    try {
      await updateTokenStatus({
        tokenId: tokenToCancel.id,
        businessId: business.id,
        ownerId: userProfile.uid,
        status: 'cancelled',
        tokenNumber: tokenToCancel.tokenNumber,
        customerName: tokenToCancel.customerName,
      });
      success(`Token ${tokenToCancel.tokenNumber} has been cancelled.`);
      setTokenToCancel(null);
    } catch (err: any) {
      console.error('Cancellation error:', err);
      error(err?.message || 'Failed to cancel token.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Filtered and searched tokens
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.tokenNumber.toLowerCase().includes(query) ||
        t.customerName.toLowerCase().includes(query) ||
        (t.customerPhone && t.customerPhone.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [tokens, statusFilter, searchQuery]);

  const currentlyServing = tokens.find((t) => t.status === 'serving');
  const waitingCount = tokens.filter((t) => t.status === 'waiting').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Queue Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operator console for {business?.name || 'your business'} (Today's sequence)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playTokenChime}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Test audio chime"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCallNext}
            disabled={callingNext || !isConfigured || waitingCount === 0}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-40"
          >
            <PlayCircle className={`w-4 h-4 text-teal-400 ${callingNext ? 'animate-spin' : ''}`} />
            <span>Call Next Waiting ({waitingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Token</span>
          </button>
        </div>
      </div>

      {/* Currently Serving Highlight Card */}
      {currentlyServing && (
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center font-mono-numbers font-black text-2xl shadow-inner">
              {currentlyServing.tokenNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Currently Serving
                </span>
                <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
              </div>
              <h3 className="text-xl font-extrabold mt-0.5">{currentlyServing.customerName}</h3>
              <p className="text-xs text-teal-200/80">
                Called at {formatTime(currentlyServing.servedAt)}
                {currentlyServing.customerPhone ? ` • ${currentlyServing.customerPhone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleStatusChange(currentlyServing, 'completed')}
              disabled={updatingTokenId === currentlyServing.id}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Completed</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange(currentlyServing, 'skipped')}
              disabled={updatingTokenId === currentlyServing.id}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <SkipForward className="w-4 h-4 text-amber-300" />
              <span>Skip Customer</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token # or customer name..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'All Tokens' },
              { id: 'waiting', label: `Waiting (${waitingCount})` },
              { id: 'serving', label: 'Serving' },
              { id: 'completed', label: 'Completed' },
              { id: 'skipped', label: 'Skipped' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tokens Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <span className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Syncing tokens from Firestore...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No tokens match your filter</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No tokens found matching "${searchQuery}".`
                : 'No tokens in this status category.'}
            </p>
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map((token) => {
                  const isServing = token.status === 'serving';
                  const isWaiting = token.status === 'waiting';
                  const isDone = token.status === 'completed' || token.status === 'cancelled';

                  const badgeStyles = {
                    waiting: 'bg-amber-50 text-amber-700 border-amber-200',
                    serving: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
                    completed: 'bg-slate-100 text-slate-700 border-slate-200',
                    skipped: 'bg-orange-50 text-orange-700 border-orange-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[token.status];

                  return (
                    <tr
                      key={token.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isServing ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      {/* Token Number */}
                      <td className="py-3.5 px-4 font-mono-numbers font-black text-slate-900 text-base">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 inline-block">
                          {token.tokenNumber}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{token.customerName}</div>
                        {token.notes && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">{token.notes}</div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-mono-numbers">
                        {token.customerPhone || '—'}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono-numbers">
                        {formatTime(token.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg border capitalize inline-flex items-center gap-1.5 ${badgeStyles}`}
                        >
                          {isServing && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {token.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isWaiting && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(token, 'serving')}
                              disabled={updatingTokenId === token.id}
                              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Start serving this customer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Serve</span>
                            </button>
                          )}

                          {isServing && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(token, 'completed')}
                              disabled={updatingTokenId === token.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </button>
                          )}

                          {(isWaiting || isServing) && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(token, 'skipped')}
                              disabled={updatingTokenId === token.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Skip customer if absent"
                            >
                              <SkipForward className="w-3.5 h-3.5 text-amber-600" />
                              <span className="hidden sm:inline">Skip</span>
                            </button>
                          )}

                          {token.status === 'skipped' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(token, 'waiting')}
                              disabled={updatingTokenId === token.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Re-add to waiting queue"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                              <span>Re-Queue</span>
                            </button>
                          )}

                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => setTokenToCancel(token)}
                              disabled={updatingTokenId === token.id}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Cancel token"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Token Cancellation Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!tokenToCancel}
        onClose={() => setTokenToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Token"
        message={`Are you sure you want to cancel Token ${tokenToCancel?.tokenNumber} for ${tokenToCancel?.customerName}? This will remove them from the active queue.`}
        confirmLabel="Yes, Cancel Token"
        cancelLabel="Keep Token"
        isDestructive={true}
        loading={cancelLoading}
      />

      {/* Issue Token Modal */}
      <TokenIssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
      />
    </div>
  );
};
