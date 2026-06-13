import React, { useState, useMemo } from 'react';
import { BetRound } from '../types';

interface SessionSummaryOverlayProps {
  betHistory: BetRound[];
  balance: number;
  onClearStats: () => void;
}

const SessionSummaryOverlay: React.FC<SessionSummaryOverlayProps> = ({
  betHistory,
  balance,
  onClearStats,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Derive metrics
  const stats = useMemo(() => {
    const totalBets = betHistory.length;
    const wins = betHistory.filter(b => b.win).length;
    const winRate = totalBets > 0 ? Math.round((wins / totalBets) * 100) : 0;

    const totalWagered = betHistory.reduce((sum, b) => sum + b.wagered, 0);
    const totalWon = betHistory.reduce((sum, b) => sum + b.won, 0);
    const netProfit = totalWon - totalWagered;
    const roi = totalWagered > 0 ? Math.round((netProfit / totalWagered) * 100) : 0;

    return {
      totalBets,
      wins,
      winRate,
      totalWagered,
      totalWon,
      netProfit,
      roi,
    };
  }, [betHistory]);

  const isProfit = stats.netProfit >= 0;

  return (
    <div id="session-summary-container">
      {/* Floating Minimize Pill */}
      {!isOpen && (
        <button
          id="btn-open-session-hud"
          onClick={() => setIsOpen(true)}
          className={`
            fixed bottom-4 right-4 z-40 
            flex items-center gap-3 px-4 py-3 rounded-full 
            border-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] 
            backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95
            ${betHistory.length > 0 
              ? isProfit 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' 
                : 'bg-rose-950/90 border-rose-500/50 text-rose-400'
              : 'bg-slate-950/90 border-slate-800 text-slate-400'
            }
          `}
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${betHistory.length > 0 ? (isProfit ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-slate-500'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${betHistory.length > 0 ? (isProfit ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-500'}`}></span>
          </span>
          <span className="text-xs font-black tracking-widest uppercase">
            {betHistory.length > 0 
              ? `LIVE STATS: ${stats.roi >= 0 ? '+' : ''}${stats.roi}% ROI` 
              : '📊 SESSION STATS'
            }
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-black">
            {stats.totalBets} {stats.totalBets === 1 ? 'BET' : 'BETS'}
          </span>
        </button>
      )}

      {/* Slide-out/Expand Details Overlay Panel */}
      {isOpen && (
        <div 
          id="session-summary-overlay-modal" 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            id="session-summary-card"
            className="w-full max-w-lg bg-slate-950 border-2 border-slate-800 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-slate-900 bg-slate-900/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center shadow-lg">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tighter text-white">SESSION ANCHOR INSIGHTS</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Calculated Performance Ledger</p>
                </div>
              </div>
              <button 
                id="btn-close-session-hud"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-850 flex items-center justify-center border border-slate-800 text-slate-500 hover:text-white transition-all font-black text-sm"
              >
                ✕
              </button>
            </div>

            {/* Metrics Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {/* Win Rate */}
                <div className="bg-slate-900/60 border border-slate-800/85 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block mb-1">Win Rate</span>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.winRate}%</span>
                    <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{stats.wins} / {stats.totalBets} wins</span>
                  </div>
                </div>

                {/* Total Bets */}
                <div className="bg-slate-900/60 border border-slate-800/85 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block mb-1">Total Bets</span>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.totalBets}</span>
                    <span className="text-[8px] text-slate-500 font-bold block mt-0.5">{stats.totalWagered} TK wagered</span>
                  </div>
                </div>

                {/* ROI % */}
                <div className={`border rounded-2xl p-4 flex flex-col justify-between ${
                  betHistory.length === 0 
                    ? 'bg-slate-900/60 border-slate-800/85' 
                    : isProfit 
                      ? 'bg-emerald-950/20 border-emerald-500/25' 
                      : 'bg-rose-950/20 border-rose-500/25'
                }`}>
                  <span className={`text-[9px] font-black uppercase tracking-wider block mb-1 ${
                    betHistory.length === 0 ? 'text-slate-500' : isProfit ? 'text-emerald-400' : 'text-rose-400'
                  }`}>ROI %</span>
                  <div>
                    <span className={`text-xl sm:text-2xl font-black font-mono block ${
                      betHistory.length === 0 ? 'text-white' : isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {betHistory.length > 0 && isProfit ? '+' : ''}{stats.roi}%
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold block mt-0.5">
                      {betHistory.length > 0 && isProfit ? '+' : ''}{stats.netProfit} TK Net
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Visual Representing Total Gain/Loss */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Strategy Returns</span>
                  <span className={`text-xs font-mono font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stats.totalWon} TK Received / {stats.totalWagered} TK Cost
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  {stats.totalWagered > 0 ? (
                    <div 
                      className={`h-full transition-all duration-700 ${isProfit ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                      style={{ width: `${Math.min(100, Math.max(8, (stats.totalWon / (stats.totalWagered + stats.totalWon || 1)) * 100))}%` }}
                    />
                  ) : (
                    <div className="h-full bg-slate-900 w-full" />
                  )}
                </div>
                <p className="text-[8px] text-slate-600 font-bold mt-2 text-center uppercase tracking-widest">
                  {betHistory.length === 0 ? "Awaiting automated recommendations and spins" : "Updates dynamically upon landing numbers"}
                </p>
              </div>

              {/* Recent Bet Logs Ledger */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Ledger (Last 5 Rounds)</h4>
                <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden max-h-[160px] overflow-y-auto custom-scrollbar">
                  {betHistory.length > 0 ? (
                    <div className="divide-y divide-slate-900/80">
                      {[...betHistory].reverse().slice(0, 5).map((log, index) => {
                        const hasWon = log.win;
                        return (
                          <div key={index} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 flex items-center justify-center font-mono font-black text-sm rounded-lg border-2 ${
                                hasWon ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                              }`}>
                                {log.actualNumber}
                              </span>
                              <div>
                                <div className="text-[10px] font-black text-slate-300">
                                  {hasWon ? '🎯 MATCHED TARGET' : '⭕ MISSED TARGET'}
                                </div>
                                <div className="text-[8px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                  Targets: {log.targets.join(', ')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-mono font-black ${hasWon ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {hasWon ? `+${log.won - log.wagered}` : `-${log.wagered}`} TK
                              </div>
                              <span className="text-[8px] text-slate-600 font-extrabold uppercase block mt-0.5">
                                unit stake: {log.wagered / 7} TK
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-600 italic text-[10px] uppercase tracking-widest">
                      No automated bets logged yet. Complete 10 initial spins to start recording signals.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-5 border-t border-slate-900 bg-slate-900/10 flex justify-between gap-3">
              <button
                id="btn-wipe-stats"
                onClick={() => {
                  if (confirm('Are you sure you want to clean statistics logs?')) {
                    onClearStats();
                    setIsOpen(false);
                  }
                }}
                className="px-4 py-2 border border-rose-950 bg-rose-950/15 text-rose-400 text-[10px] font-black tracking-widest uppercase rounded-lg hover:bg-rose-950/30 transition-all font-mono"
              >
                Reset stats
              </button>
              <button
                id="btn-close-overlay"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-500 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all"
              >
                Cool, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSummaryOverlay;
