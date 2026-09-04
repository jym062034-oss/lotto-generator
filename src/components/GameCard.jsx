import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Copy, Check, Sparkles } from 'lucide-react';

export default function GameCard({ game, index, isGenerating }) {
  const [copied, setCopied] = useState(false);

  const copySingleGame = () => {
    const formatted = `Game ${game.label}: ${game.numbers.map((n) => (n < 10 ? `0${n}` : n)).join(', ')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-md">
      {/* Background Subtle Gradient Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 via-rose-500 to-indigo-500" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Game Label */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 shrink-0">
            {game.label}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
              GAME {game.label}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 가중치 자동 조합
            </div>
          </div>
        </div>

        {/* 6 Lotto Balls */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2 sm:my-0 flex-wrap">
          {game.numbers.map((num, idx) => (
            <LottoBall
              key={`${game.label}-${num}-${idx}`}
              number={num}
              size="md"
              animate={isGenerating}
              delay={idx * 80}
            />
          ))}
        </div>

        {/* Copy Single Game Button */}
        <button
          onClick={copySingleGame}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 border shrink-0 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>복사완료</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>단일 복사</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
