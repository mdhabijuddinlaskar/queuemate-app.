import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Tv,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Sparkles,
  Info,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import type { TokenItem } from '../types';
import { subscribeToTodayTokens } from '../services/queueService';
import { playTokenChime } from '../utils/audio';
import { formatTime, formatDurationMinutes } from '../utils/format';

interface CustomerDisplayPageProps {
  onBackToDashboard?: () => void;
}

export const CustomerDisplayPage: React.FC<CustomerDisplayPageProps> = ({
  onBackToDashboard,
}) => {
  const { business } = useAuth();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const prevServingTokenId = useRef<string | null>(null);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Firestore subscription
  useEffect(() => {
    if (!business?.id) return;

    const unsub = subscribeToTodayTokens(business.id, (newTokens) => {
      const currentServing = newTokens.find((t) => t.status === 'serving');

      // If serving token changed and sound enabled, ring chime!
      if (currentServing && currentServing.id !== prevServingTokenId.current) {
        if (soundEnabled && prevServingTokenId.current !== null) {
          playTokenChime();
        }
        prevServingTokenId.current = currentServing.id;
      }

      setTokens(newTokens);
    });

    return () => unsub();
  }, [business?.id, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentlyServing = tokens.find((t) => t.status === 'serving');
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const avgMinutes = business?.avgServiceMinutes || 10;
  const estimatedWait = waitingTokens.length * avgMinutes;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Top TV Bar */}
      <header className="h-20 px-6 sm:px-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {business?.name || 'QueueMate'}
              </h1>
              <p className="text-xs text-teal-400 font-medium">
                {business?.type || 'Customer Service Hall'} • Live Queue Display
              </p>
            </div>
          </div>
        </div>

        {/* Live Digital Clock & Display Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 text-slate-300 font-mono-numbers text-lg font-bold bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/60">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>{currentTimeStr}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-teal-500/20 border-teal-500/30 text-teal-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Chime sound is active' : 'Chime sound is muted'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Kiosk Grid */}
      <main className="flex-1 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-7xl w-full mx-auto">
        {/* Left Big Screen: CURRENTLY SERVING (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/60 rounded-3xl border-2 border-teal-500/40 p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle glowing backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 font-bold text-xs uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
              <span>Now Serving</span>
            </div>

            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Desk 1 / Main Counter
            </span>
          </div>

          {/* Huge Token Display */}
          <div className="relative z-10 text-center my-8 sm:my-12">
            {currentlyServing ? (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="text-7xl sm:text-8xl md:text-9xl font-black text-teal-400 font-mono-numbers tracking-tight drop-shadow-md">
                  {currentlyServing.tokenNumber}
                </div>
                <div className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
                  {currentlyServing.customerName}
                </div>
                <p className="mt-1 text-sm text-teal-200/70">
                  Please proceed to the service counter
                </p>
              </div>
            ) : (
              <div className="py-12">
                <div className="text-6xl sm:text-7xl font-bold text-slate-700 font-mono-numbers">
                  READY
                </div>
                <p className="mt-4 text-base text-slate-400 max-w-md mx-auto">
                  Counter is currently open. Next waiting ticket will be called momentarily.
                </p>
              </div>
            )}
          </div>

          {/* Estimated Waiting Time Footer Bar */}
          <div className="relative z-10 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Estimated Waiting Time
                </p>
                <p className="text-lg font-black text-white font-mono-numbers">
                  {waitingTokens.length > 0 ? `~${formatDurationMinutes(estimatedWait)}` : '0 mins'}
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                People Waiting
              </p>
              <p className="text-lg font-black text-teal-300 font-mono-numbers">
                {waitingTokens.length} in queue
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: NEXT IN LINE TOKENS (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-lg text-white">Next Up in Queue</h3>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono-numbers">
                {waitingTokens.length} WAITING
              </span>
            </div>

            {/* Waiting List */}
            <div className="mt-4 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {waitingTokens.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <p className="font-medium text-sm">No customers currently waiting in line.</p>
                  <p className="text-xs mt-1 text-slate-600">
                    New tokens will appear here instantly.
                  </p>
                </div>
              ) : (
                waitingTokens.slice(0, 8).map((token, index) => {
                  const estWait = (index + 1) * avgMinutes;
                  return (
                    <div
                      key={token.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-mono-numbers font-black text-lg text-white">
                            {token.tokenNumber}
                          </span>
                          <p className="text-xs text-slate-400">{token.customerName}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono-numbers font-bold text-teal-400">
                          ~{estWait} mins
                        </span>
                        <p className="text-[10px] text-slate-500">estimated</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Transparent Wait Time Disclaimer Banner as explicitly requested */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> Estimated wait times are approximate and calculated based on an average service duration of {avgMinutes} minutes per customer. Actual consultation and treatment times may vary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
