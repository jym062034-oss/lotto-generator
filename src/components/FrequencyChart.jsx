import React, { useState } from 'react';
import { Flame, Snowflake, BarChart3, SortAsc, TrendingUp } from 'lucide-react';
import { getLottoBallColor } from '../utils/lottoGenerator';

export default function FrequencyChart({ frequencies = {}, totalAnalyzed = 0, latestDrwNo = 0 }) {
  const [sortBy, setSortBy] = useState('number'); // 'number' or 'frequency'

  // Convert frequencies object to sorted array
  const frequencyList = Array.from({ length: 45 }, (_, i) => {
    const num = i + 1;
    return {
      num,
      count: frequencies[num] || 0,
      color: getLottoBallColor(num),
    };
  });

  const maxCount = Math.max(...frequencyList.map((f) => f.count), 1);

  // Top 5 Hot Numbers
  const hotNumbers = [...frequencyList]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top 5 Cold Numbers
  const coldNumbers = [...frequencyList]
    .sort((a, b) => a.count - b.count)
    .slice(0, 5);

  const sortedList = [...frequencyList].sort((a, b) => {
    if (sortBy === 'frequency') {
      return b.count - a.count || a.num - b.num;
    }
    return a.num - b.num;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 p-2 rounded-xl border border-blue-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            최근 {totalAnalyzed}회차 출현 빈도 통계 (Hot/Cold)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            동행복권 최근 {totalAnalyzed}회차({latestDrwNo - totalAnalyzed + 1}회 ~ {latestDrwNo}회) 당첨 번호 출현 횟수 분석
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('number')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              sortBy === 'number'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <SortAsc className="w-3.5 h-3.5 inline mr-1" />
            번호순
          </button>
          <button
            onClick={() => setSortBy('frequency')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              sortBy === 'frequency'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
            출현 빈도순
          </button>
        </div>
      </div>

      {/* Hot & Cold Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Hot Numbers Box */}
        <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-3">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>최다 출현 번호 Top 5 (Hot 🔥)</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {hotNumbers.map((item) => (
              <div
                key={`hot-${item.num}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-white text-xs font-mono font-bold"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: item.color.bg }}
                />
                <span>{item.num < 10 ? `0${item.num}` : item.num}</span>
                <span className="text-rose-300 text-[10px]">({item.count}회)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers Box */}
        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
            <Snowflake className="w-5 h-5 text-cyan-400" />
            <span>최소 출현 번호 Top 5 (Cold 🧊)</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {coldNumbers.map((item) => (
              <div
                key={`cold-${item.num}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-white text-xs font-mono font-bold"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: item.color.bg }}
                />
                <span>{item.num < 10 ? `0${item.num}` : item.num}</span>
                <span className="text-cyan-300 text-[10px]">({item.count}회)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Bar Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-15 gap-2 max-h-[360px] overflow-y-auto pr-1">
        {sortedList.map((item) => {
          const heightPercent = Math.max((item.count / maxCount) * 100, 15);
          return (
            <div
              key={`chart-${item.num}`}
              className="flex flex-col items-center justify-end bg-slate-800/40 border border-slate-800 rounded-xl p-2 hover:border-slate-600 transition-all group"
            >
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white mb-1">
                {item.count}회
              </span>

              {/* Frequency Vertical Bar */}
              <div className="w-full bg-slate-800 rounded-t-lg h-24 relative flex items-end justify-center p-0.5 overflow-hidden">
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: item.color.bg,
                    boxShadow: `0 0 10px ${item.color.shadow}`,
                  }}
                />
              </div>

              {/* Number Badge */}
              <div
                className="mt-2 w-7 h-7 rounded-full flex items-center justify-center font-mono font-extrabold text-xs shadow-md"
                style={{
                  backgroundColor: item.color.bg,
                  color: item.color.text,
                }}
              >
                {item.num < 10 ? `0${item.num}` : item.num}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
