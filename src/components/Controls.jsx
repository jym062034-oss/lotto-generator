import React, { useState } from 'react';
import { Pin, Ban, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { getLottoBallColor } from '../utils/lottoGenerator';

export default function Controls({
  fixedNumbers,
  setFixedNumbers,
  excludedNumbers,
  setExcludedNumbers,
  frequencies,
}) {
  const [activeTab, setActiveTab] = useState('fixed'); // 'fixed' or 'excluded'
  const [warningMessage, setWarningMessage] = useState('');

  const toggleNumber = (num) => {
    setWarningMessage('');
    if (activeTab === 'fixed') {
      if (fixedNumbers.includes(num)) {
        setFixedNumbers(fixedNumbers.filter((n) => n !== num));
      } else {
        if (fixedNumbers.length >= 5) {
          setWarningMessage('고정 번호는 최대 5개까지 설정할 수 있습니다.');
          return;
        }
        if (excludedNumbers.includes(num)) {
          setWarningMessage(`숫자 ${num}번은 이미 제외 번호로 지정되어 있습니다.`);
          return;
        }
        setFixedNumbers([...fixedNumbers, num].sort((a, b) => a - b));
      }
    } else {
      if (excludedNumbers.includes(num)) {
        setExcludedNumbers(excludedNumbers.filter((n) => n !== num));
      } else {
        if (excludedNumbers.length >= 10) {
          setWarningMessage('제외 번호는 최대 10개까지 설정할 수 있습니다.');
          return;
        }
        if (fixedNumbers.includes(num)) {
          setWarningMessage(`숫자 ${num}번은 이미 고정 번호로 지정되어 있습니다.`);
          return;
        }
        setExcludedNumbers([...excludedNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  const clearFixed = () => setFixedNumbers([]);
  const clearExcluded = () => setExcludedNumbers([]);
  const clearAll = () => {
    setFixedNumbers([]);
    setExcludedNumbers([]);
    setWarningMessage('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <Pin className="w-5 h-5" />
            </span>
            번호 조합 맞춤 설정
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            원하는 고정 번호(최대 5개)와 제외할 번호(최대 10개)를 직접 선택하세요.
          </p>
        </div>

        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 전체 초기화
        </button>
      </div>

      {/* Tab Selector Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            setActiveTab('fixed');
            setWarningMessage('');
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border ${
            activeTab === 'fixed'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-lg shadow-emerald-900/30'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Pin className="w-4 h-4 text-emerald-300" />
          고정 번호 ({fixedNumbers.length}/5)
        </button>

        <button
          onClick={() => {
            setActiveTab('excluded');
            setWarningMessage('');
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border ${
            activeTab === 'excluded'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400/50 shadow-lg shadow-rose-900/30'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Ban className="w-4 h-4 text-rose-300" />
          제외 번호 ({excludedNumbers.length}/10)
        </button>
      </div>

      {/* Warning Message Toast */}
      {warningMessage && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Number Pad Grid 1..45 */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            {activeTab === 'fixed'
              ? '📌 반드시 포함될 번호를 터치하여 추가하세요'
              : '🚫 추첨에서 제외할 번호를 터치하여 등록하세요'}
          </span>
          <span className="text-[11px] text-slate-500">
            (번호 아래 숫자는 최근 출현 횟수)
          </span>
        </div>

        <div className="grid grid-cols-9 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
            const isFixed = fixedNumbers.includes(num);
            const isExcluded = excludedNumbers.includes(num);
            const freq = frequencies[num] || 0;
            const ballColor = getLottoBallColor(num);

            let stateStyle = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-700/80';
            if (isFixed) {
              stateStyle = 'bg-emerald-600 text-white border-emerald-400 font-extrabold ring-2 ring-emerald-400/50 scale-105 shadow-md shadow-emerald-600/30';
            } else if (isExcluded) {
              stateStyle = 'bg-rose-950/80 text-rose-400 border-rose-700/60 line-through opacity-65';
            }

            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`relative flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl border transition-all duration-200 select-none ${stateStyle}`}
              >
                <div
                  className="w-3 h-3 rounded-full mb-0.5 opacity-80"
                  style={{ backgroundColor: ballColor.bg }}
                />
                <span className="text-xs sm:text-sm font-bold font-mono leading-none">
                  {num < 10 ? `0${num}` : num}
                </span>
                <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                  {freq}회
                </span>

                {isFixed && (
                  <span className="absolute -top-1 -right-1 bg-emerald-400 text-slate-950 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-black">
                    ✓
                  </span>
                )}
                {isExcluded && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-black">
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Summary Badges */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" /> 고정 번호 세트:
          </span>
          {fixedNumbers.length > 0 ? (
            <button onClick={clearFixed} className="text-slate-500 hover:text-slate-300 text-[11px] underline">
              고정 비우기
            </button>
          ) : (
            <span className="text-slate-500 text-[11px]">미설정 (기본 0개)</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
          {fixedNumbers.length === 0 ? (
            <span className="text-xs text-slate-600 italic">선택된 고정 번호가 없습니다.</span>
          ) : (
            fixedNumbers.map((num) => (
              <span
                key={`fixed-${num}`}
                onClick={() => toggleNumber(num)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold cursor-pointer hover:bg-emerald-500/30 transition-colors"
              >
                {num < 10 ? `0${num}` : num}
                <span className="text-emerald-400 hover:text-white font-normal ml-0.5">✕</span>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-rose-400 font-semibold flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" /> 제외 번호 세트:
          </span>
          {excludedNumbers.length > 0 ? (
            <button onClick={clearExcluded} className="text-slate-500 hover:text-slate-300 text-[11px] underline">
              제외 비우기
            </button>
          ) : (
            <span className="text-slate-500 text-[11px]">미설정 (기본 0개)</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
          {excludedNumbers.length === 0 ? (
            <span className="text-xs text-slate-600 italic">선택된 제외 번호가 없습니다.</span>
          ) : (
            excludedNumbers.map((num) => (
              <span
                key={`ex-${num}`}
                onClick={() => toggleNumber(num)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-mono font-bold cursor-pointer hover:bg-rose-500/30 transition-colors"
              >
                {num < 10 ? `0${num}` : num}
                <span className="text-rose-400 hover:text-white font-normal ml-0.5">✕</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
