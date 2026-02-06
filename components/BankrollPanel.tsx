
import React from 'react';
import { EU_RACETRACK } from '../constants';
import { getRacetrackSection } from '../utils';

interface BankrollPanelProps {
  balance: number;
  currentUnit: number;
  consecutiveLosses: number;
  aiRecommendation: {
    section: string;
    targets: string[];
  } | null;
  baseChipValue: number;
  onBaseChipChange: (val: number) => void;
  history: string[];
}

const BankrollPanel: React.FC<BankrollPanelProps> = ({ 
  balance, 
  currentUnit, 
  consecutiveLosses,
  aiRecommendation,
  baseChipValue,
  onBaseChipChange,
  history
}) => {
  const isProfit = balance >= 0;
  const perNumberBet = baseChipValue * currentUnit;
  const nextBetAmount = perNumberBet * 5;

  const CHIPS = [5, 10, 20, 50, 100];

  // Calculate Last 5 distribution for the compact view
  const last5 = history.slice(-5);
  const last5Dist = last5.reduce((acc, num) => {
    const sec = getRacetrackSection(num, EU_RACETRACK);
    if (sec) acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getChipColor = (val: number) => {
    if (val >= 100) return 'bg-purple-600 border-purple-400';
    if (val >= 50) return 'bg-blue-600 border-blue-400';
    if (val >= 20) return 'bg-yellow-600 border-yellow-400 shadow-yellow-500/20';
    if (val >= 10) return 'bg-rose-600 border-rose-400 shadow-rose-500/20';
    return 'bg-emerald-600 border-emerald-400 shadow-emerald-500/20';
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Manual Chip Selector Row */}
      <div className="bg-slate-900/40 p-4 rounded-[1.5rem] border-2 border-slate-800/60 shadow-xl flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col text-center sm:text-left">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Manual Chip Selector</h3>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Sets your base stake per number</p>
        </div>
        <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => onBaseChipChange(chip)}
              className={`
                group relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-dashed flex items-center justify-center transition-all duration-300 active:scale-90
                ${getChipColor(chip)}
                ${baseChipValue === chip ? 'scale-110 border-white border-solid ring-4 ring-white/20 shadow-2xl z-10' : 'opacity-40 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 hover:scale-105'}
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-white font-black text-xs sm:text-lg leading-none">{chip}</span>
                <span className="text-[6px] sm:text-[8px] text-white/70 font-black uppercase">Taka</span>
              </div>
              {baseChipValue === chip && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                  <span className="text-emerald-600 text-[10px] font-black">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className={`p-5 rounded-[1.5rem] border-2 shadow-xl flex flex-col justify-center transition-colors duration-500 ${isProfit ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-rose-950/20 border-rose-500/20'}`}>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2 flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${isProfit ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]'}`} />
            Net P/L
          </h3>
          <div className={`text-2xl sm:text-3xl font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}{balance.toLocaleString()} <span className="text-[10px] opacity-60">TK</span>
          </div>
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-2">ROI: {balance > 0 ? 'Positive' : 'Tracking'}</p>
        </div>

        {/* AI Strategy Sector & Targets Card */}
        <div className="p-5 bg-blue-950/20 rounded-[1.5rem] border-2 border-blue-500/20 shadow-xl flex flex-col justify-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-black mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,1)]" />
            AI Targets
          </h3>
          {aiRecommendation ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white uppercase">{aiRecommendation.section}</span>
                <span className="text-[8px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">Sector Focus</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {aiRecommendation.targets.map(n => (
                  <span key={n} className="w-7 h-7 flex items-center justify-center bg-slate-950 text-blue-400 rounded-lg border border-blue-500/30 text-xs font-black">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-600 font-black italic">Awaiting spin data...</p>
          )}
        </div>

        {/* Recommended Bet Card */}
        <div className="p-5 bg-slate-900/60 rounded-[1.5rem] border-2 border-slate-800 shadow-xl flex flex-col justify-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,1)]" />
            Next Bet
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {nextBetAmount} <span className="text-[10px] opacity-40">TK</span>
            </div>
            <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 border-dashed ${getChipColor(perNumberBet)}`}>
              <span className="text-white font-black text-[10px]">{perNumberBet}</span>
            </div>
          </div>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-2">
            Stake {perNumberBet} TK x 5 targets
          </p>
        </div>

        {/* Progression & Last 5 Distribution */}
        <div className="p-5 bg-slate-900/60 rounded-[1.5rem] border-2 border-slate-800 shadow-xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
              Progress
            </h3>
            <span className="text-[10px] font-black text-slate-400">{currentUnit}x Unit</span>
          </div>
          
          {/* Last 5 Compact Bars */}
          <div className="grid grid-cols-4 gap-1 h-8 mt-1">
            {Object.keys(EU_RACETRACK).map(sec => {
              const hits = last5Dist[sec] || 0;
              const height = (hits / 5) * 100;
              const isActive = aiRecommendation?.section === sec;
              return (
                <div key={sec} className="relative group bg-slate-950/50 rounded-sm overflow-hidden flex flex-col justify-end">
                   <div 
                    className={`transition-all duration-500 ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`} 
                    style={{ height: `${Math.max(10, height)}%`, opacity: hits > 0 ? 1 : 0.2 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[6px] text-white font-black opacity-40 group-hover:opacity-100">{sec[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[7px] text-slate-600 font-black uppercase mt-2 text-center tracking-tighter">Last 5 Sector Distribution</p>
        </div>
      </div>
    </div>
  );
};

export default BankrollPanel;
