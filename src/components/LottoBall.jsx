import React from 'react';
import { getLottoBallColor } from '../utils/lottoGenerator';

export default function LottoBall({ number, size = 'md', isBonus = false, animate = false, delay = 0 }) {
  const colorInfo = getLottoBallColor(number);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold shadow-md',
    md: 'w-11 h-11 text-base font-extrabold shadow-lg',
    lg: 'w-14 h-14 text-xl font-extrabold shadow-xl',
    xl: 'w-16 h-16 text-2xl font-black shadow-2xl',
  }[size] || 'w-11 h-11 text-base font-extrabold shadow-lg';

  return (
    <div
      className={`relative flex items-center justify-center rounded-full transition-transform duration-300 transform hover:scale-110 select-none ${sizeClasses} ${
        animate ? 'animate-bounce' : ''
      }`}
      style={{
        backgroundColor: colorInfo.bg,
        color: colorInfo.text,
        boxShadow: `0 4px 14px ${colorInfo.shadow}, inset 0 -3px 6px rgba(0, 0, 0, 0.3), inset 0 3px 6px rgba(255, 255, 255, 0.6)`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* 3D Gloss Highlight */}
      <span className="absolute top-1 left-2 w-3 h-2 bg-white/50 rounded-full blur-[0.5px] pointer-events-none transform -rotate-45" />

      {/* Number Display */}
      <span className="relative z-10 drop-shadow-sm font-mono tracking-tighter">
        {number < 10 ? `0${number}` : number}
      </span>

      {/* Optional Bonus Label Badge */}
      {isBonus && (
        <span className="absolute -bottom-1 -right-1 text-[9px] bg-purple-600 text-white font-bold px-1 rounded-full border border-white">
          +보너스
        </span>
      )}
    </div>
  );
}
