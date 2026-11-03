import React, { useState } from 'react';
import { Modal } from './Modal';
import { issueToken } from '../../services/queueService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { playTokenChime } from '../../utils/audio';
import { Ticket, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import type { TokenItem } from '../../types';

interface TokenIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated?: (token: TokenItem) => void;
}

export const TokenIssueModal: React.FC<TokenIssueModalProps> = ({
  isOpen,
  onClose,
  onTokenCreated,
}) => {
  const { business, userProfile } = useAuth();
  const { success, error } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedToken, setIssuedToken] = useState<TokenItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      error('Please enter the customer name.');
      return;
    }

    if (!business || !userProfile) {
      error('Business profile is not available. Please sign in or check your account.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await issueToken({
        businessId: business.id,
        ownerId: userProfile.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        tokenPrefix: business.tokenPrefix || 'A',
        notes: notes.trim(),
      });

      playTokenChime();
      setIssuedToken(token);
      success(`Token ${token.tokenNumber} issued successfully!`);
      if (onTokenCreated) onTokenCreated(token);

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    } catch (err: any) {
      console.error('Failed to issue token:', err);
      error(err?.message || 'Could not issue token. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIssuedToken(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={issuedToken ? 'Token Issued Successfully!' : 'Issue New Token'}
      description={
        issuedToken
          ? 'Hand this token number to the customer or display it.'
          : 'Add customer to the waiting queue with a sequential daily token.'
      }
      maxWidth="max-w-md"
    >
      {issuedToken ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Token Number
            </span>
            <div className="text-5xl font-black text-slate-900 font-mono-numbers mt-1 tracking-tight">
              {issuedToken.tokenNumber}
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-700">
              {issuedToken.customerName}
            </div>
            {issuedToken.customerPhone && (
              <div className="text-xs text-slate-500">{issuedToken.customerPhone}</div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIssuedToken(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Issue Another
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +1 555-0192"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Service Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. General checkup, Hair styling, Document verification..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 flex items-center gap-3">
            <Ticket className="w-5 h-5 text-teal-600 shrink-0" />
            <div className="text-xs text-teal-900 leading-snug">
              Token will be assigned to <strong>{business?.name || 'your business'}</strong> and
              starts in <span className="font-semibold text-teal-700">Waiting</span> status.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Issuing Token...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Issue Token</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
