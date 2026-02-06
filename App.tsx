
import React, { useState, useCallback, useMemo } from 'react';
import { WheelMode, Stats } from './types';
import { 
  ALL_NUMBERS_EU, 
  ALL_NUMBERS_US,
  EU_WHEEL_ORDER,
  US_WHEEL_ORDER,
  EU_RACETRACK
} from './constants';
import { 
  detectZigzag,
  getRacetrackSection
} from './utils';
import NumberCell from './components/NumberCell';
import StatsPanel from './components/StatsPanel';
import Racetrack from './components/Racetrack';
import BankrollPanel from './components/BankrollPanel';

const App: React.FC = () => {
  const [mode, setMode] = useState<WheelMode>('EU');
  const [history, setHistory] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [autoBetNeighbors, setAutoBetNeighbors] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<'RECORD' | 'ANALYZE'>('RECORD');

  // Money Management State
  const [balance, setBalance] = useState<number>(0);
  const [currentUnit, setCurrentUnit] = useState<number>(1);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [baseChipValue, setBaseChipValue] = useState<number>(5);

  const currentGridNumbers = useMemo(() => mode === 'EU' ? ALL_NUMBERS_EU : ALL_NUMBERS_US, [mode]);

  const stats: Stats = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(n => counts[n] = (counts[n] || 0) + 1);
    
    const hot = Object.entries(counts)
      .filter(([_, count]) => count >= 2)
      .map(([num]) => num);

    const cold = currentGridNumbers.filter(n => !history.includes(n));
    const isZigzag = detectZigzag(history, mode);

    return { hot, cold, isZigzag };
  }, [history, mode, currentGridNumbers]);

  const getNeighborBets = useCallback((number: string, wheel: string[], neighbors: number = 2) => {
    const index = wheel.indexOf(number);
    if (index === -1) return [];
    const wheelLength = wheel.length;
    let betNumbers: string[] = [];
    for (let i = -neighbors; i <= neighbors; i++) {
        let idx = (index + i + wheelLength) % wheelLength;
        betNumbers.push(wheel[idx]);
    }
    return Array.from(new Set(betNumbers));
  }, []);

  // Automated AI Strategy Calculation (Targets for the NEXT spin)
  const aiRecommendation = useMemo(() => {
    if (history.length < 3) return null;
    const wheel = mode === 'EU' ? EU_WHEEL_ORDER : US_WHEEL_ORDER;
    
    const sectionCounts = history.reduce((acc, num) => {
      const sec = getRacetrackSection(num, EU_RACETRACK);
      if (sec) acc[sec] = (acc[sec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hotSectionName = Object.entries(sectionCounts).reduce((a, b) => 
      (b[1] > (a ? a[1] : -1)) ? b : a, null as [string, number] | null
    );

    if (!hotSectionName) return null;

    const sectionName = hotSectionName[0];
    const numsInSec = history.filter(n => getRacetrackSection(n, EU_RACETRACK) === sectionName);
    const countsInSec: Record<string, number> = {};
    numsInSec.forEach(n => countsInSec[n] = (countsInSec[n] || 0) + 1);
    
    const sortedHits = Object.entries(countsInSec).sort((a, b) => b[1] - a[1]);
    const topNum = sortedHits.length > 0 ? sortedHits[0][0] : numsInSec[numsInSec.length - 1];

    return {
      section: sectionName,
      targets: getNeighborBets(topNum, wheel, 2)
    };
  }, [history, mode, getNeighborBets]);

  const handleAddSpin = useCallback((num: string) => {
    // Process Money Management before updating history
    if (aiRecommendation) {
      const isWin = aiRecommendation.targets.includes(num);
      const perNumberBet = baseChipValue * currentUnit;
      const totalBetAmount = perNumberBet * 5; 
      
      if (isWin) {
        // Payout: 35 to 1. One number hit out of 5.
        // Return = perNumberBet * 36 (35 profit + 1 stake)
        const winAmount = (perNumberBet * 36) - totalBetAmount;
        setBalance(prev => prev + winAmount);
        setConsecutiveLosses(0);
        setCurrentUnit(prev => Math.max(1, prev - 1));
      } else {
        setBalance(prev => prev - totalBetAmount);
        
        setConsecutiveLosses(prev => {
          const next = prev + 1;
          if (next >= 4) {
            setCurrentUnit(u => u + 1);
            return 0; // Reset counter after unit increase
          }
          return next;
        });
      }
    }

    setHistory(prev => {
      const next = [...prev, num];
      return next.slice(-10);
    });
    setSelectedNumber(null);
    setAutoBetNeighbors([]);
  }, [aiRecommendation, currentUnit, baseChipValue]);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
    setSelectedNumber(null);
    setAutoBetNeighbors([]);
  }, []);

  const handleCellClick = useCallback((num: string) => {
    if (inputMode === 'RECORD') {
      handleAddSpin(num);
    } else {
      const wheel = mode === 'EU' ? EU_WHEEL_ORDER : US_WHEEL_ORDER;
      if (selectedNumber === num) {
        setSelectedNumber(null);
        setAutoBetNeighbors([]);
      } else {
        setSelectedNumber(num);
        setAutoBetNeighbors(getNeighborBets(num, wheel, 2));
      }
    }
  }, [inputMode, handleAddSpin, selectedNumber, mode, getNeighborBets]);

  const clearHistory = () => {
    if (confirm('Erase all sequence and analytics data?')) {
      setHistory([]);
      setSelectedNumber(null);
      setAutoBetNeighbors([]);
      setBalance(0);
      setCurrentUnit(1);
      setConsecutiveLosses(0);
      setBaseChipValue(5);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 lg:p-10 animate-in">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-6 text-center xl:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center shadow-2xl border-2 border-emerald-400/30">
            <span className="text-2xl sm:text-4xl">🎡</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent tracking-tighter">
              ROULETTE TRACKER PRO
            </h1>
            <p className="text-slate-500 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Ultimate Precision Engine</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex bg-slate-800 p-1.5 rounded-xl border-2 border-slate-700 shadow-xl">
            <button onClick={() => { setMode('EU'); setHistory([]); }} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-black transition-all ${mode === 'EU' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>EUROPEAN</button>
            <button onClick={() => { setMode('US'); setHistory([]); }} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-black transition-all ${mode === 'US' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>AMERICAN</button>
          </div>
          <div className="flex bg-slate-800 p-1.5 rounded-xl border-2 border-slate-700 shadow-xl">
            <button onClick={() => setInputMode('RECORD')} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 ${inputMode === 'RECORD' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${inputMode === 'RECORD' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} /> RECORD
            </button>
            <button onClick={() => setInputMode('ANALYZE')} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 ${inputMode === 'ANALYZE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
              🔍 ANALYZE
            </button>
          </div>
        </div>
      </div>

      {/* Sequence Stream */}
      <div className="mb-8 p-4 sm:p-8 bg-slate-900/60 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-slate-800 shadow-2xl backdrop-blur-xl group">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-slate-500 font-black flex items-center group-hover:text-emerald-500/80 transition-colors">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 mr-2 sm:mr-3 shadow-[0_0_10px_rgba(16,185,129,1)]" />
            Live Sequence Stream
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleUndo} 
              disabled={history.length === 0}
              className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] sm:text-xs font-black text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
            >
              Undo
            </button>
            <span className={`text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-slate-700 ${history.length === 10 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              COUNT: {history.length} / 10
            </span>
          </div>
        </div>
        <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 custom-scrollbar min-h-[80px] sm:min-h-[110px] px-1">
          {history.length > 0 ? [...history].reverse().map((n, i) => {
            const isRepeat = history.filter(x => x === n).length > 1;
            const isLatest = i === 0;
            return (
              <div key={`${n}-${i}`} className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] font-black text-xl sm:text-3xl border-2 transition-all duration-500 relative ${isLatest ? 'scale-105 shadow-xl border-emerald-400 bg-emerald-950/40 text-white' : 'border-slate-800 bg-slate-900/80 text-slate-500 opacity-60'}`}>
                {n}
                {isRepeat && <div className="absolute -top-1 -right-1 w-3 sm:w-5 h-3 sm:h-5 bg-emerald-500 rounded-full border-2 sm:border-4 border-slate-950 shadow-xl" />}
              </div>
            );
          }) : (
            <div className="flex items-center justify-center w-full py-4 text-slate-700 text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] opacity-40 italic">Waiting for spins...</div>
          )}
        </div>
      </div>

      {/* Money Management Panel */}
      <BankrollPanel 
        balance={balance} 
        currentUnit={currentUnit} 
        consecutiveLosses={consecutiveLosses}
        aiRecommendation={aiRecommendation}
        baseChipValue={baseChipValue}
        onBaseChipChange={setBaseChipValue}
        history={history}
      />

      {/* Visual Racetrack - Integrated AI Strategy Highlighting */}
      <Racetrack 
        mode={mode} 
        history={history} 
        stats={stats} 
        onNumberClick={handleCellClick}
        selectedNumber={selectedNumber}
        suggestedNumbers={inputMode === 'ANALYZE' ? autoBetNeighbors : (aiRecommendation?.targets || [])}
        aiSector={aiRecommendation?.section || null}
      />

      {/* Stats Panel */}
      <StatsPanel stats={stats} history={history} mode={mode} />

      {/* Big Analyzer Suggestion View - Clean Styling, No Animation */}
      {selectedNumber && inputMode === 'ANALYZE' && (
        <div className="mb-10 p-6 sm:p-10 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2rem] sm:rounded-[3.5rem] animate-in slide-in-from-bottom-8 shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-center mb-10 gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-emerald-300 font-black text-xs sm:text-sm uppercase tracking-[0.2em] flex items-center justify-center lg:justify-start gap-3 mb-2">
                <span className="text-2xl sm:text-4xl">🚀</span> Probability Mapping
              </h3>
              <p className="text-[10px] sm:text-[12px] text-slate-500 font-bold uppercase tracking-widest">Neighbor Analysis for Cluster <span className="text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/20 ml-1">#{selectedNumber}</span></p>
            </div>
            <button onClick={() => handleAddSpin(selectedNumber)} className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-10 sm:px-14 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] text-xs sm:text-sm font-black shadow-2xl shadow-emerald-900/40 border border-emerald-400/30 transition-all active:scale-95">CONFIRM RECORD #{selectedNumber}</button>
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-8 overflow-visible px-4">
            {autoBetNeighbors.map((n, idx) => {
              const isTarget = n === selectedNumber;
              return (
                <div key={`${n}-${idx}`} className={`
                  relative flex flex-col items-center transition-all duration-700
                  ${isTarget ? 'scale-125 z-30' : 'scale-90 opacity-40 grayscale-[0.4]'}
                `}>
                  <div className={`
                    flex items-center justify-center font-mono font-black border-4 transition-all duration-500
                    ${isTarget 
                      ? 'w-24 h-24 sm:w-40 sm:h-40 bg-emerald-600 text-white border-emerald-300 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.5)]' 
                      : 'w-16 h-16 sm:w-24 sm:h-24 bg-slate-950/80 text-emerald-400 border-slate-800 rounded-2xl sm:rounded-[2rem] opacity-60'
                    }
                  `}>
                    <span className={`${isTarget ? 'text-4xl sm:text-7xl' : 'text-xl sm:text-3xl'}`}>{n}</span>
                    {isTarget && (
                      <span className="absolute -top-4 bg-emerald-400 text-slate-900 px-4 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-tighter shadow-xl whitespace-nowrap border-2 border-emerald-900">PRIMARY TARGET</span>
                    )}
                  </div>
                  {!isTarget && (
                    <span className="mt-3 text-[9px] sm:text-[11px] font-black text-slate-600 uppercase tracking-widest">Neighbor</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-2">
          <h3 className="text-[10px] sm:text-[12px] font-black text-slate-600 uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center gap-2">
             <div className="w-2 h-2 bg-slate-800 rounded-full" />
             Digital Surface Grid
          </h3>
          <div className="flex gap-6 sm:gap-8">
             <div className="flex items-center gap-2 text-emerald-500 text-[10px] sm:text-[11px] font-black">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-500 shadow-lg shadow-emerald-500/40" /> HOT
             </div>
             <div className="flex items-center gap-2 text-cyan-400 text-[10px] sm:text-[11px] font-black opacity-60">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-cyan-950 border-2 border-cyan-500/40" /> COLD
             </div>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-12 gap-3 sm:gap-5">
          {currentGridNumbers.map(n => {
            const isRepeated = history.filter(h => h === n).length > 1;
            const isCold = stats.cold.includes(n);
            const isMissing = history.length > 0 && !history.includes(n);
            const isSelected = selectedNumber === n;
            const isSuggested = autoBetNeighbors.includes(n) || (aiRecommendation?.targets.includes(n));

            let status: any = 'default';
            if (isSelected) status = 'selected';
            else if (isSuggested) status = 'suggested';
            else if (isRepeated) status = 'repeated';
            else if (isCold) status = 'cold';
            else if (isMissing) status = 'missing';

            return (
              <NumberCell key={n} num={n} status={status} onClick={handleCellClick} />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-6 sm:gap-10 border-t-2 border-slate-800 mt-12 sm:mt-20 pt-10 sm:pt-16 pb-12">
        <div className="flex gap-4">
          <button onClick={handleUndo} disabled={history.length === 0} className="bg-slate-900/50 hover:bg-slate-800 text-slate-400 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] transition-all text-[10px] sm:text-xs font-black border-2 border-slate-800 uppercase tracking-[0.3em] shadow-xl active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed">UNDO SPIN</button>
          <button onClick={clearHistory} className="bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-400 text-slate-600 px-10 sm:px-16 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] transition-all text-[10px] sm:text-xs font-black border-2 border-slate-800 uppercase tracking-[0.3em] shadow-xl active:scale-95">WIPE TRACKING DATA</button>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
           <p className="text-[10px] sm:text-[11px] text-slate-700 font-black uppercase tracking-[0.4em] sm:tracking-[0.6em]">Quantum Roulette Architecture v4.3.0 Stable</p>
           <p className="text-[8px] sm:text-[9px] text-slate-800 font-black uppercase tracking-widest opacity-40">Dynamic Probability Mapping Engine</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        @media (min-width: 640px) { .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; } }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 2px solid #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-in { animation: zoom-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
