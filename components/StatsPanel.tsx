
import React from 'react';
import { Stats, WheelMode } from '../types';
import { getRacetrackSection, getWheelOrder } from '../utils';
import { EU_RACETRACK } from '../constants';

interface StatsPanelProps {
  stats: Stats;
  history: string[];
  mode: WheelMode;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, history, mode }) => {
  const wheel = getWheelOrder(mode);
  
  // Calculate hits per section for Last 10
  const sectionCounts10 = history.reduce((acc, num) => {
    const sec = getRacetrackSection(num, EU_RACETRACK);
    if (sec) acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Last 5 momentum
  const recentHistory = history.slice(-5);
  const sectionCounts5 = recentHistory.reduce((acc, num) => {
    const sec = getRacetrackSection(num, EU_RACETRACK);
    if (sec) acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hotSection10 = Object.entries(sectionCounts10).reduce((a, b) => 
    (b[1] > (a ? a[1] : -1)) ? b : a, null as [string, number] | null
  );

  const getNeighborBets = (number: string, wheel: string[], neighbors: number = 2) => {
    const index = wheel.indexOf(number);
    if (index === -1) return [];
    const wheelLength = wheel.length;
    let betNumbers: string[] = [];
    for (let i = -neighbors; i <= neighbors; i++) {
        let idx = (index + i + wheelLength) % wheelLength;
        betNumbers.push(wheel[idx]);
    }
    return Array.from(new Set(betNumbers));
  };

  const aiSuggestion = React.useMemo(() => {
    if (history.length < 3 || !hotSection10) return null;
    const sectionName = hotSection10[0];
    const numsInSec = history.filter(n => getRacetrackSection(n, EU_RACETRACK) === sectionName);
    
    // Logic: find most frequent number in the hot section
    const countsInSec: Record<string, number> = {};
    numsInSec.forEach(n => countsInSec[n] = (countsInSec[n] || 0) + 1);
    
    // Fallback to most recent hit in section if no repeat found
    const sortedHits = Object.entries(countsInSec).sort((a, b) => b[1] - a[1]);
    const topNum = sortedHits.length > 0 ? sortedHits[0][0] : numsInSec[numsInSec.length - 1];
    
    return {
      section: sectionName,
      anchor: topNum,
      neighbors: getNeighborBets(topNum, wheel, 2) // Returns 5 numbers
    };
  }, [hotSection10, history, wheel]);

  // Pressure Zone logic for Missing Neighbors
  const pressureZone = React.useMemo(() => {
    if (history.length < 2) return [];
    
    const anchors = Array.from(new Set([...stats.hot, history[history.length - 1]]));
    const neighborsSet = new Set<string>();
    
    anchors.forEach(a => {
      getNeighborBets(a, wheel, 2).forEach(n => neighborsSet.add(n));
    });

    return Array.from(neighborsSet).filter(n => !history.includes(n)).slice(0, 10);
  }, [history, stats.hot, wheel]);

  return (
    <div className="space-y-6 mb-10">
      {/* Top Stats Row - Responsive Grid columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hot Clusters */}
        <div className="bg-emerald-950/30 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-xl flex flex-col">
          <h3 className="text-emerald-400 font-black uppercase text-[10px] sm:text-[11px] tracking-widest mb-4 flex items-center">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,1)]" />
            Hot Clusters
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[50px]">
            {stats.hot.length > 0 ? stats.hot.map(n => (
              <span key={n} className="bg-emerald-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-base sm:text-xl font-black shadow-lg border border-emerald-400/30 animate-in zoom-in">
                {n}
              </span>
            )) : <span className="text-slate-600 text-[9px] sm:text-[10px] font-bold uppercase italic mt-1">Scanning...</span>}
          </div>
        </div>

        {/* Missing Neighbors - Pressure Zone */}
        <div className="bg-orange-950/20 p-4 sm:p-5 rounded-2xl border border-orange-500/30 shadow-xl flex flex-col">
          <h3 className="text-orange-400 font-black uppercase text-[10px] sm:text-[11px] tracking-widest mb-4 flex items-center">
             <span className="mr-2 text-sm sm:text-base">🔥</span> Missing Neighbors
          </h3>
          <div className="flex flex-wrap gap-1.5 min-h-[40px] sm:min-h-[50px] content-start">
            {pressureZone.length > 0 ? pressureZone.map(n => (
              <span key={n} className="text-orange-200 bg-orange-900/40 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-black border border-orange-500/20">
                {n}
              </span>
            )) : (
              <span className="text-slate-600 text-[9px] sm:text-[10px] font-bold uppercase italic">No gaps detected</span>
            )}
          </div>
          <p className="text-[7px] sm:text-[8px] text-orange-500/60 font-black uppercase mt-3">Unhit gaps in active zones</p>
        </div>

        {/* Cold Numbers */}
        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-cyan-500/20 shadow-xl flex flex-col">
          <h3 className="text-cyan-400/80 font-black uppercase text-[10px] sm:text-[11px] tracking-widest mb-4 flex items-center">
             <span className="mr-2 text-sm sm:text-base">❄️</span> Cold Numbers
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-[80px] sm:max-h-[100px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar content-start">
             {stats.cold.length > 0 ? stats.cold.slice(0, 15).map(n => (
              <span key={n} className="text-cyan-200/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black border border-cyan-900/30 bg-cyan-950/20">
                {n}
              </span>
            )) : <span className="text-slate-600 text-[9px] sm:text-[10px] italic">Fully covered</span>}
          </div>
        </div>

        {/* AI STRATEGY */}
        <div className="bg-blue-950/20 p-4 sm:p-5 rounded-2xl border border-blue-500/30 shadow-2xl flex flex-col">
          <h3 className="text-blue-400 font-black uppercase text-[10px] sm:text-[11px] tracking-widest mb-4 flex items-center">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
            AI Strategy
          </h3>
          {aiSuggestion ? (
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="bg-blue-900/30 p-1.5 sm:p-2 rounded-xl border border-blue-500/20 text-center flex flex-col justify-center">
                <p className="text-[8px] sm:text-[9px] text-blue-400 font-black uppercase mb-1">Sector</p>
                <p className="text-xs sm:text-base text-white font-black truncate">{aiSuggestion.section}</p>
              </div>
              <div className="bg-blue-900/30 p-1.5 sm:p-2 rounded-xl border border-blue-500/20 flex flex-col justify-center">
                <p className="text-[8px] sm:text-[9px] text-blue-400 font-black uppercase mb-1 text-center">Targets</p>
                <div className="flex flex-wrap gap-1 justify-center">
                   {aiSuggestion.neighbors.slice(0, 5).map(n => (
                     <span key={n} className={`text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-black ${n === aiSuggestion.anchor ? 'bg-blue-500 text-white' : 'bg-slate-900 text-blue-200/60'}`}>
                       {n}
                     </span>
                   ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 text-[10px] sm:text-[11px] font-black italic border-2 border-dashed border-slate-800 rounded-xl py-3 sm:py-4">
               Waiting for data...
            </div>
          )}
        </div>
      </div>

      {/* Racetrack Charts - Responsive Grid */}
      {mode === 'EU' && history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-950/50 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-slate-500 text-[10px] sm:text-[12px] uppercase font-black tracking-widest mb-4 sm:mb-5">Racetrack Distribution (Live 10)</h3>
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(EU_RACETRACK).map(section => {
                const count = sectionCounts10[section] || 0;
                const percentage = Math.round((count / history.length) * 100);
                const isTarget = aiSuggestion?.section === section;
                return (
                  <div key={section} className="group">
                    <div className="flex justify-between text-[10px] sm:text-xs font-black mb-1.5 sm:mb-2 px-1">
                      <span className={isTarget ? 'text-blue-400' : 'text-slate-500'}>{section}</span>
                      <span className="text-slate-400 font-mono">{count} Hits ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${isTarget ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-950/50 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-slate-500 text-[10px] sm:text-[12px] uppercase font-black tracking-widest mb-4 sm:mb-5">Racetrack Distribution (Last 5 spins)</h3>
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(EU_RACETRACK).map(section => {
                const count = sectionCounts5[section] || 0;
                const percentage = Math.round((count / Math.max(1, recentHistory.length)) * 100);
                return (
                  <div key={section}>
                    <div className="flex justify-between text-[10px] sm:text-xs font-black mb-1.5 sm:mb-2 px-1">
                      <span className="text-slate-600">{section}</span>
                      <span className="text-slate-400 font-mono">{count} Hits ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-700 bg-emerald-600/50" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
