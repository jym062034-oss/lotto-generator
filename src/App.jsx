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
  TrendingUp,
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
  const [error, setError] = useState(null);

  // Selector states
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);
  const [baseWeight, setBaseWeight] = useState(1);

  // Generated Games State
  const [games, setGames] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  // Fetch Stats from Express API
  const fetchStats = async (count) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/lotto/stats?count=${count}`);
      if (response.data && response.data.success) {
        setStatsData(response.data);
      } else {
        setError('통계 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('[API Fetch Error]', err);
      // Fallback mock frequencies if backend isn't reachable during initial load
      const mockFreq = {};
      for (let i = 1; i <= 45; i++) {
        mockFreq[i] = Math.floor(Math.random() * 8) + 1;
      }
      setStatsData({
        frequencies: mockFreq,
        totalAnalyzed: count,
        latestDrwNo: 1180,
        latestDraw: {
          drwNo: 1180,
          drwNoDate: '2026-08-29',
          numbers: [3, 12, 19, 28, 35, 42],
          bonusNo: 7,
        },
      });
      setError('서버 연결 문제로 기본 통계 데이터를 사용합니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(analyzedCount);
  }, [analyzedCount]);

  // Initial Auto Generate on Stats Load
  useEffect(() => {
    if (Object.keys(statsData.frequencies).length > 0 && games.length === 0) {
      handleGenerate();
    }
  }, [statsData.frequencies]);

  // Handle Game Generation
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

  // Copy All 5 Games to Clipboard
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
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* APP HEADER */}
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

          {/* Analysis Range Select Dropdown */}
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

            {/* Refresh Button */}
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

        {/* LATEST DRAW WINNING BANNER */}
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

            {/* Ball list for latest draw */}
            <div className="flex items-center gap-2 flex-wrap">
              {statsData.latestDraw.numbers.map((num, idx) => (
                <LottoBall key={`latest-${num}-${idx}`} number={num} size="sm" />
              ))}
              <span className="text-slate-500 font-bold px-1">+</span>
              <LottoBall number={statsData.latestDraw.bonusNo} size="sm" isBonus />
            </div>
          </section>
        )}

        {/* CONTROLS (INCLUSION & EXCLUSION SELECTORS) */}
        <section>
          <Controls
            fixedNumbers={fixedNumbers}
            setFixedNumbers={setFixedNumbers}
            excludedNumbers={excludedNumbers}
            setExcludedNumbers={setExcludedNumbers}
            frequencies={statsData.frequencies}
          />
        </section>

        {/* GENERATOR ACTION & ALGORITHM SETTINGS */}
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
            {/* Base Weight adjustment */}
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

            {/* Big Generate Button */}
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

        {/* GENERATED GAMES RESULTS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              추천 로또 5게임 조합 (A ~ E)
            </h2>

            {/* Copy All Button */}
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

          {/* Games list */}
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

        {/* FREQUENCY HEATMAP & STATS CHART */}
        <section>
          <FrequencyChart
            frequencies={statsData.frequencies}
            totalAnalyzed={statsData.totalAnalyzed}
            latestDrwNo={statsData.latestDrwNo}
          />
        </section>

        {/* FOOTER */}
        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 border-t border-slate-900">
          <p>© 2026 로또 6/45 통계 기반 가중치 추출기 | 동행복권 공공 API 연동</p>
          <p className="mt-1">
            본 서비스는 통계적 확률에 기반한 번호 조합을 제공하며, 당첨을 보장하지 않습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
