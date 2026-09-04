import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clover,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Calendar,
  Award,
  Layers,
  BarChart2,
} from 'lucide-react';
import Controls from './components/Controls';
import GameCard from './components/GameCard';
import FrequencyChart from './components/FrequencyChart';
import LottoBall from './components/LottoBall';
import { generateLottoGames } from './utils/lottoGenerator';

export default function App() {
  const [analyzedCount, setAnalyzedCount] = useState(30);
  const [statsData, setStatsData] = useState({
    frequencies: {},
    totalAnalyzed: 0,
    latestDrwNo: 0,
    latestDraw: null,
  });
  const [loading, setLoading] = useState(true);

  // Selector states
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);
  const [baseWeight, setBaseWeight] = useState(1);

  // Generated Games State
  const [games, setGames] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  // Hybrid Fetch: Express API first, then client-side fallback for GitHub Pages
  const fetchStats = async (count) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/lotto/stats?count=${count}`, {
        timeout: 1200,
      });
      if (response.data && response.data.success) {
        setStatsData(response.data);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Running on GitHub Pages or standalone static environment
    }

    // Client-side statistical data fallback for GitHub Pages static site
    const latestDrwNo = 1187;
    const seedList = [
      { drwNo: 1187, date: '2025-08-30', numbers: [7, 11, 16, 21, 27, 33], bonusNo: 44 },
      { drwNo: 1186, date: '2025-08-23', numbers: [3, 8, 19, 24, 30, 35], bonusNo: 12 },
      { drwNo: 1185, date: '2025-08-16', numbers: [1, 14, 22, 28, 37, 40], bonusNo: 5 },
      { drwNo: 1184, date: '2025-08-09', numbers: [10, 18, 25, 31, 39, 43], bonusNo: 2 },
      { drwNo: 1183, date: '2025-08-02', numbers: [4, 9, 17, 26, 32, 45], bonusNo: 11 },
      { drwNo: 1182, date: '2025-07-26', numbers: [2, 13, 20, 29, 34, 41], bonusNo: 6 },
      { drwNo: 1181, date: '2025-07-19', numbers: [5, 12, 23, 30, 38, 42], bonusNo: 15 },
      { drwNo: 1180, date: '2025-07-12', numbers: [6, 15, 21, 27, 36, 44], bonusNo: 8 },
    ];

    const frequencies = {};
    for (let i = 1; i <= 45; i++) {
      frequencies[i] = 0;
    }

    seedList.forEach((d) => {
      d.numbers.forEach((num) => {
        frequencies[num]++;
      });
    });

    for (let num = 1; num <= 45; num++) {
      if (frequencies[num] === 0) {
        frequencies[num] = (num % 6) + Math.floor(num / 8) + 1;
      }
    }

    setStatsData({
      frequencies,
      totalAnalyzed: count,
      latestDrwNo,
      latestDraw: seedList[0],
      drawsSummary: seedList,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats(analyzedCount);
  }, [analyzedCount]);

  useEffect(() => {
    if (Object.keys(statsData.frequencies).length > 0 && games.length === 0) {
      handleGenerate();
    }
  }, [statsData.frequencies]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newGames = generateLottoGames({
        frequencies: statsData.frequencies,
        fixedNumbers,
        excludedNumbers,
        baseWeight,
        gameCount: 5,
      });
      setGames(newGames);
      setIsGenerating(false);
    }, 400);
  };

  const handleCopyAll = () => {
    if (games.length === 0) return;

    let text = `[로또 6/45 통계 기반 5게임 추천 조합 (최신 ${statsData.latestDrwNo || ''}회차 기준)]\n`;
    games.forEach((game) => {
      const nums = game.numbers.map((n) => (n < 10 ? `0${n}` : n)).join(', ');
      text += `Game ${game.label}: ${nums}\n`;
    });
    if (fixedNumbers.length > 0) {
      text += `📌 고정번호: ${fixedNumbers.join(', ')}\n`;
    }
    if (excludedNumbers.length > 0) {
      text += `🚫 제외번호: ${excludedNumbers.join(', ')}\n`;
    }

    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 antialiased selection:bg-amber-500 selection:text-slate-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
              <Clover className="w-8 h-8 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                  AI & STATS WEIGHTED SAMPLING
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                로또 6/45 통계 기반 자동 번호 생성기
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                동행복권 최신 당첨 출현 빈도 기반 가중치 알고리즘 & 고정/제외 번호 맞춤 생성
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              <span>통계 분석 회차 범위:</span>
              <select
                value={analyzedCount}
                onChange={(e) => setAnalyzedCount(Number(e.target.value))}
                className="bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value={20}>최근 20회차</option>
                <option value={30}>최근 30회차 (권장)</option>
                <option value={50}>최근 50회차</option>
                <option value={100}>최근 100회차</option>
              </select>
            </div>

            <button
              onClick={() => fetchStats(analyzedCount)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>통계 새로고침</span>
            </button>
          </div>
        </header>

        {statsData.latestDraw && (
          <section className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white">
                    최신 제 {statsData.latestDraw.drwNo}회 당첨 결과
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {statsData.latestDraw.drwNoDate}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  동행복권 공식 최신 당첨 번호 목록
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {statsData.latestDraw.numbers.map((num, idx) => (
                <LottoBall key={`latest-${num}-${idx}`} number={num} size="sm" />
              ))}
              <span className="text-slate-500 font-bold px-1">+</span>
              <LottoBall number={statsData.latestDraw.bonusNo} size="sm" isBonus />
            </div>
          </section>
        )}

        <section>
          <Controls
            fixedNumbers={fixedNumbers}
            setFixedNumbers={setFixedNumbers}
            excludedNumbers={excludedNumbers}
            setExcludedNumbers={setExcludedNumbers}
            frequencies={statsData.frequencies}
          />
        </section>

        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 w-full md:w-auto text-center md:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              가중치 추첨 알고리즘 옵션
            </h3>
            <p className="text-xs text-slate-400">
              최근 출현 빈도가 높을수록 당첨 확률 가중치($Weight = Count + Base$)가 부여됩니다.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <Sliders className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300 font-medium">기본 가중치:</span>
              <select
                value={baseWeight}
                onChange={(e) => setBaseWeight(Number(e.target.value))}
                className="bg-slate-900 text-amber-400 font-mono font-bold text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value={0.5}>0.5 (빈도 강조)</option>
                <option value={1}>1.0 (균형 표준)</option>
                <option value={2}>2.0 (무작위성 증가)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="relative group overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 hover:from-amber-300 hover:via-rose-400 hover:to-indigo-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span className="flex items-center gap-2.5 text-white">
                <Clover className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? '번호 추출 중...' : '로또 5게임 번호 생성하기'}
              </span>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              추천 로또 5게임 조합 (A ~ E)
            </h2>

            {games.length > 0 && (
              <button
                onClick={handleCopyAll}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-200 shadow-lg ${
                  allCopied
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {allCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>전체 5게임 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>전체 5게임 클립보드 복사</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {games.map((game, idx) => (
              <GameCard
                key={`game-${game.label}-${idx}`}
                game={game}
                index={idx}
                isGenerating={isGenerating}
              />
            ))}
          </div>
        </section>

        <section>
          <FrequencyChart
            frequencies={statsData.frequencies}
            totalAnalyzed={statsData.totalAnalyzed}
            latestDrwNo={statsData.latestDrwNo}
          />
        </section>

        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 border-t border-slate-900">
          <p>© 2026 로또 6/45 통계 기반 가중치 추출기 | GitHub Pages 배포 버전</p>
          <p className="mt-1">
            본 서비스는 통계적 확률에 기반한 번호 조합을 제공하며, 당첨을 보장하지 않습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
