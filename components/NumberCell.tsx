
import React from 'react';
import { RED_NUMBERS } from '../constants';

interface NumberCellProps {
  num: string;
  onClick: (num: string) => void;
  status: 'default' | 'repeated' | 'missing' | 'selected' | 'suggested' | 'cold';
}

const NumberCell: React.FC<NumberCellProps> = ({ num, onClick, status }) => {
  const isRed = RED_NUMBERS.includes(num);
  const isZero = num === '0' || num === '00';

  const getBaseColor = () => {
    if (isZero) return 'bg-emerald-600 hover:bg-emerald-500';
    if (isRed) return 'bg-rose-700 hover:bg-rose-600';
    return 'bg-slate-800 hover:bg-slate-700';
  };

  const getOverlayStyles = () => {
    switch (status) {
      case 'repeated': 
        return 'ring-2 sm:ring-4 ring-emerald-400 ring-inset shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105 z-10 bg-emerald-900/80';
      case 'cold': 
        return 'opacity-90 border-2 border-cyan-500/40 bg-cyan-950/30';
      case 'missing': 
        return 'opacity-30 grayscale-[0.9]';
      case 'selected': 
        return 'ring-2 sm:ring-4 ring-blue-400 ring-inset scale-110 z-20 shadow-[0_0_20px_rgba(59,130,246,0.6)]';
      case 'suggested': 
        return 'ring-2 sm:ring-4 ring-blue-300 ring-inset border-2 border-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.4)]';
      default: 
        return '';
    }
  };

  return (
    <button
      onClick={() => onClick(num)}
      className={`
        relative flex items-center justify-center w-full aspect-square text-lg sm:text-2xl font-black rounded-lg sm:rounded-xl transition-all duration-300
        ${getBaseColor()}
        ${getOverlayStyles()}
      `}
    >
      {num}
      {status === 'repeated' && (
        <span className="absolute -top-1.5 sm:-top-2 -right-1 sm:-right-1.5 bg-emerald-500 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full text-white font-black uppercase shadow-xl border border-white/20">HOT</span>
      )}
      {status === 'cold' && (
        <span className="absolute -top-1.5 sm:-top-2 -right-1 sm:-right-1.5 text-sm sm:text-lg drop-shadow-lg">❄️</span>
      )}
    </button>
  );
};

export default NumberCell;
