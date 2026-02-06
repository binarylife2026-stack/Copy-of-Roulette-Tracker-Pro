
import React from 'react';
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

  // SVG Ellipse Layout Parameters - matching image proportions
  const width = 800;
  const height = 360;
  const rx = 350;
  const ry = 140;
  const cx = width / 2;
  const cy = height / 2;

  // Sector highlighting logic
  const sectorNumbers = aiSector ? (EU_RACETRACK as any)[aiSector] || [] : [];

  return (
    <div className="w-full bg-[#0b0e14] rounded-[2rem] border-2 border-slate-800/40 p-6 sm:p-10 mb-8 relative shadow-2xl overflow-hidden">
      {/* Header matching image style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          <h3 className="text-[10px] sm:text-[13px] font-black text-slate-400 uppercase tracking-[0.4em]">
            {mode === 'EU' ? 'European' : 'American'} Racetrack
          </h3>
        </div>
        
        <div className="flex gap-5 text-[9px] sm:text-[11px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" /> 
            <span>AI Target</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 
            <span>Selection</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-[2.2/1] w-full max-w-5xl mx-auto flex items-center justify-center">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible"
        >
          {/* Main Track Glow */}
          <ellipse 
            cx={cx} 
            cy={cy} 
            rx={rx} 
            ry={ry} 
            fill="none" 
            stroke="#1a1c24" 
            strokeWidth="54" 
          />
          <ellipse 
            cx={cx} 
            cy={cy} 
            rx={rx} 
            ry={ry} 
            fill="none" 
            stroke="#111318" 
            strokeWidth="48" 
          />

          {/* AI Sector Glow Background */}
          {aiSector && wheelOrder.map((num, i) => {
            if (!sectorNumbers.includes(num)) return null;
            const angle = (i / wheelOrder.length) * 2 * Math.PI - Math.PI / 2;
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);
            return (
              <circle 
                key={`sec-bg-${num}`}
                cx={x} 
                cy={y} 
                r="28" 
                className="fill-emerald-500/10 blur-sm"
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

            // Chip Background Colors - Image Style
            let chipColor = '#161922'; // Default black numbers
            let textColor = '#94a3b8'; // Default text

            if (isZero) {
              chipColor = '#064e3b'; // Dark green
              textColor = '#fff';
            } else if (isRed) {
              chipColor = '#7f1d1d'; // Dark red
              textColor = '#fff';
            }

            // High Priority UI Overrides requested by user:
            // Highlighting color is now Light Green
            if (isSuggested) {
              chipColor = '#4ade80'; // Light Green (Green-400)
              textColor = '#064e3b'; // Dark text for contrast
            }

            return (
              <g 
                key={`${num}-${i}`} 
                className="cursor-pointer group transition-all duration-300"
                onClick={() => onNumberClick(num)}
              >
                {/* Chip Outer Ring for Selection */}
                {isSelected && (
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="24" 
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    className="opacity-50"
                  />
                )}

                {/* Main Chip Circle */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="19" 
                  fill={chipColor}
                  className={`
                    transition-all duration-500 shadow-xl
                    ${isLast ? 'stroke-white stroke-[2px]' : isSelected ? 'stroke-blue-400 stroke-[2px]' : 'stroke-slate-900/40 stroke-[1px]'}
                    ${isSuggested ? 'stroke-[#4ade80] stroke-[1px] shadow-[0_0_15px_rgba(74,222,128,0.4)]' : ''}
                  `}
                />

                {/* Number Text */}
                <text 
                  x={x} 
                  y={y} 
                  dy="0.36em" 
                  textAnchor="middle" 
                  fill={textColor}
                  className={`
                    text-[13px] font-black pointer-events-none select-none transition-all duration-300
                    ${isLast ? 'font-bold underline' : ''}
                  `}
                >
                  {num}
                </text>

                {/* Last Hit Indicator (White Arrow) */}
                {isLast && (
                  <path 
                    d={`M ${x} ${y-28} L ${x-5} ${y-38} L ${x+5} ${y-38} Z`} 
                    className="fill-white drop-shadow-md"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Decorative inner gradient overlay to match image depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/10 rounded-[2rem]" />
    </div>
  );
};

export default Racetrack;
