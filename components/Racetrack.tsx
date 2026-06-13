
import React, { useState } from 'react';
import { WheelMode, Stats } from '../types';
import { EU_WHEEL_ORDER, US_WHEEL_ORDER, RED_NUMBERS, EU_RACETRACK } from '../constants';

interface RacetrackProps {
  mode: WheelMode;
  history: string[];
  stats: Stats;
  onNumberClick: (num: string) => void;
  selectedNumber: string | null;
  suggestedNumbers: string[];
  aiSector: string | null;
}

const Racetrack: React.FC<RacetrackProps> = ({ 
  mode, 
  history, 
  stats, 
  onNumberClick,
  selectedNumber,
  suggestedNumbers,
  aiSector
}) => {
  const wheelOrder = mode === 'EU' ? EU_WHEEL_ORDER : US_WHEEL_ORDER;
  const lastHit = history[history.length - 1];
  const [clickedNum, setClickedNum] = useState<string | null>(null);

  // SVG Layout Parameters tuned to match the reference image's spacious, flat oval look
  const width = 1000;
  const height = 480;
  const rx = 420; // Horizontal radius
  const ry = 190; // Vertical radius - creates the professional flat look
  const cx = width / 2;
  const cy = height / 2;
  const chipRadius = 18; // Precise sizing to prevent any overlap while remaining legible

  const handleInternalClick = (num: string) => {
    setClickedNum(num);
    onNumberClick(num);
    setTimeout(() => setClickedNum(null), 400);
  };

  const sectorNumbers = aiSector ? (EU_RACETRACK as any)[aiSector] || [] : [];

  return (
    <div className="w-full bg-[#05070a] rounded-[3rem] border border-slate-800/30 p-8 sm:p-12 mb-10 relative shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 px-6 gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-[14px] font-[1000] text-slate-300 uppercase tracking-[0.4em]">
              {mode === 'EU' ? 'European' : 'American'} Racetrack
            </h3>
            <div className="h-[1px] w-12 bg-emerald-500/30 mt-1" />
          </div>
        </div>
        
        <div className="flex gap-8 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.5)] group-hover:scale-125 transition-transform" /> 
            <span className="group-hover:text-emerald-400 transition-colors">AI Prediction</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" /> 
            <span>Selection</span>
          </div>
        </div>
      </div>

      <div className="relative w-full mx-auto flex items-center justify-center">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] overflow-visible"
        >
          {/* Main Track Path (Subtle background path) */}
          <ellipse 
            cx={cx} cy={cy} rx={rx} ry={ry} 
            fill="none" stroke="#12151c" strokeWidth="58" className="opacity-80"
          />
          <ellipse 
            cx={cx} cy={cy} rx={rx} ry={ry} 
            fill="none" stroke="#0a0d14" strokeWidth="50" 
          />

          {/* AI Sector Background Highlight */}
          {aiSector && wheelOrder.map((num, i) => {
            if (!sectorNumbers.includes(num)) return null;
            const angle = (i / wheelOrder.length) * 2 * Math.PI - Math.PI / 2;
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);
            return (
              <circle 
                key={`sec-glow-${num}`}
                cx={x} cy={y} r="28" 
                className="fill-emerald-400/5 blur-xl animate-pulse"
              />
            );
          })}
          
          {wheelOrder.map((num, i) => {
            const angle = (i / wheelOrder.length) * 2 * Math.PI - Math.PI / 2;
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);
            
            const isRed = RED_NUMBERS.includes(num);
            const isZero = num === '0' || num === '00';
            const isLast = num === lastHit;
            const isSelected = num === selectedNumber;
            const isSuggested = suggestedNumbers.includes(num);
            const isAnimating = clickedNum === num;

            // Colors perfectly matched to reference image
            let chipColor = '#161922'; // Default Black/Dark Grey
            let textColor = '#cbd5e1'; // Light Grey Text

            if (isZero) {
              chipColor = '#0b5a3e'; // Deep Emerald/Green
              textColor = '#ffffff';
            } else if (isRed) {
              chipColor = '#520d14'; // Deep Crimson/Red
              textColor = '#ffffff';
            }

            // Highlighting style - Light Green for AI Targets
            if (isSuggested) {
              chipColor = '#4ade80';
              textColor = '#052e16';
            }

            return (
              <g 
                key={`${num}-${i}`} 
                className="cursor-pointer outline-none transition-all duration-300"
                onClick={() => handleInternalClick(num)}
              >
                {/* Visual Glow for targets */}
                {isSuggested && (
                  <circle 
                    cx={x} cy={y} r={chipRadius + 6} 
                    fill="url(#targetGlow)" className="animate-pulse opacity-40"
                  />
                )}

                {/* Main Chip Geometry */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={chipRadius} 
                  fill={chipColor}
                  className={`
                    transition-all duration-500 transform-gpu
                    ${isLast ? 'stroke-white stroke-[2.5px] shadow-[0_0_20px_rgba(255,255,255,0.3)]' : isSelected ? 'stroke-blue-400 stroke-[2px]' : 'stroke-slate-900/60 stroke-[1px]'}
                    ${isAnimating ? 'scale-125' : 'hover:scale-110'}
                  `}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />

                {/* Precise Number Text Alignment */}
                <text 
                  x={x} 
                  y={y} 
                  dominantBaseline="central"
                  textAnchor="middle" 
                  fill={textColor}
                  className={`
                    text-[14px] font-[1000] pointer-events-none select-none transition-transform duration-300 tracking-tight
                    ${isLast ? 'underline' : ''}
                    ${isAnimating ? 'scale-125' : ''}
                  `}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  {num}
                </text>

                {/* Last Result Pointer */}
                {isLast && (
                  <g className="animate-bounce">
                    <path 
                      d={`M ${x} ${y-28} L ${x-5} ${y-38} L ${x+5} ${y-38} Z`} 
                      className="fill-white drop-shadow-lg"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Gradients and Definitions */}
          <defs>
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Overlays to match image lighting */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 rounded-[3rem]" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-700/20 to-transparent" />
    </div>
  );
};

export default Racetrack;
