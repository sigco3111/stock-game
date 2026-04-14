'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Difficulty, GameState, Achievement, SeasonReport as SeasonReportType, RankingEntry } from '@/lib/types';
import {
  initGame,
  processTurn,
  advanceTurn,
  executeBuy,
  executeSell,
  answerQuiz,
  generateSeasonReport,
} from '@/lib/game-engine';
import { calculateRankings } from '@/lib/ai-players';
import {
  saveGame,
  loadGame,
  hasSavedGame,
  deleteSave,
  loadSettings,
  updateSettings,
} from '@/lib/storage';
import { DIFFICULTY_CONFIGS } from '@/lib/constants';
import GameBoard from '@/components/GameBoard';
import SeasonReportComponent from '@/components/SeasonReport';

// ----------------------------------------
// Screen Types
// ----------------------------------------
type Screen = 'START' | 'PLAYING' | 'REPORT';

// ----------------------------------------
// Main Page Component
// ----------------------------------------
export default function Home() {
  // Screen management
  const [screen, setScreen] = useState<Screen>('START');

  // Start screen state
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [hasSave, setHasSave] = useState(false);

  // Game state
  const [game, setGame] = useState<GameState | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [previousRanks] = useState<Record<string, number>>({});
  const [seasonReport, setSeasonReport] = useState<SeasonReportType | null>(null);
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(null);

  // Refs for tracking previous achievements
  const prevAchievementsRef = useRef<Set<string>>(new Set());
  const gameStartTimeRef = useRef<number>(0);

  // ----------------------------------------
  // Load saved game info on mount
  // ----------------------------------------
  useEffect(() => {
    const settings = loadSettings();
    if (settings.playerName && settings.playerName !== '투자자') {
      setPlayerName(settings.playerName);
    }
    if (settings.difficulty) {
      setDifficulty(settings.difficulty);
    }
    setHasSave(hasSavedGame());
  }, []);

  // ----------------------------------------
  // Start a new game
  // ----------------------------------------
  const handleNewGame = useCallback(() => {
    const name = playerName.trim() || '투자자';
    const newGame = initGame(difficulty, name);

    // Generate first turn
    const turnResult = processTurn(newGame);
    const advancedGame = advanceTurn(newGame, turnResult);

    // Apply stock price changes from turn result
    const updatedStocks = advancedGame.stocks.map((stock) => {
      const change = turnResult.priceChanges[stock.code];
      if (change === undefined) return stock;
      const original = newGame.stocks.find((s) => s.code === stock.code);
      if (!original) return stock;
      const newPrice = Math.max(100, Math.round(original.currentPrice * (1 + change / 100)));
      return {
        ...stock,
        previousPrice: original.currentPrice,
        currentPrice: newPrice,
        priceHistory: [...original.priceHistory, newPrice],
      };
    });

    const fullGame = { ...advancedGame, stocks: updatedStocks };
    const newRankings = calculateRankings(fullGame.players, fullGame.stocks);

    setGame(fullGame);
    setRankings(newRankings);
    setSeasonReport(null);
    setSelectedStockCode(null);
    setLatestAchievement(null);
    prevAchievementsRef.current = new Set(fullGame.achievements.map((a) => a.id));
    gameStartTimeRef.current = Date.now();

    // Save settings
    updateSettings({ playerName: name, difficulty });
    saveGame(fullGame);

    setScreen('PLAYING');
  }, [playerName, difficulty]);

  // ----------------------------------------
  // Continue saved game
  // ----------------------------------------
  const handleContinue = useCallback(() => {
    const savedGame = loadGame();
    if (!savedGame) return;

    const currentRankings = calculateRankings(savedGame.players, savedGame.stocks);

    setGame(savedGame);
    setRankings(currentRankings);
    setSeasonReport(null);
    setSelectedStockCode(null);
    setLatestAchievement(null);
    prevAchievementsRef.current = new Set(savedGame.achievements.map((a) => a.id));
    gameStartTimeRef.current = Date.now();

    setScreen('PLAYING');
  }, []);

  // ----------------------------------------
  // Handle trade (buy/sell)
  // ----------------------------------------
  const handleTrade = useCallback(
    (stockCode: string, action: 'buy' | 'sell', quantity: number) => {
      if (!game) return;

      const { game: updatedGame, result } =
        action === 'buy'
          ? executeBuy(game, stockCode, quantity)
          : executeSell(game, stockCode, quantity);

      if (!result.success) {
        console.warn('Trade failed:', result.message);
        return;
      }

      // Recalculate rankings
      const newRankings = calculateRankings(updatedGame.players, updatedGame.stocks);

      // Check for new achievements
      const prevIds = prevAchievementsRef.current;
      const newAchievement = updatedGame.achievements.find(
        (a) => a.unlocked && !prevIds.has(a.id)
      );
      if (newAchievement) {
        const newIds = new Set(prevIds);
        newIds.add(newAchievement.id);
        prevAchievementsRef.current = newIds;
        setLatestAchievement(newAchievement);
        setTimeout(() => setLatestAchievement(null), 3000);
      }

      setGame(updatedGame);
      setRankings(newRankings);
      saveGame(updatedGame);
    },
    [game]
  );

  // ----------------------------------------
  // Advance to next turn
  // ----------------------------------------
  const handleAdvanceTurn = useCallback(() => {
    if (!game) return;

    // Process AI decisions
    const turnResult = processTurn(game);
    const advancedGame = advanceTurn(game, turnResult);

    // Apply stock price changes from turn result
    const updatedStocks = advancedGame.stocks.map((stock) => {
      const change = turnResult.priceChanges[stock.code];
      if (change === undefined) return stock;
      const original = game.stocks.find((s) => s.code === stock.code);
      if (!original) return stock;
      const newPrice = Math.max(100, Math.round(original.currentPrice * (1 + change / 100)));
      return {
        ...stock,
        previousPrice: original.currentPrice,
        currentPrice: newPrice,
        priceHistory: [...original.priceHistory, newPrice],
      };
    });

    const fullGame = { ...advancedGame, stocks: updatedStocks };
    const newRankings = calculateRankings(fullGame.players, fullGame.stocks);

    // Check for new achievements
    const prevIds = prevAchievementsRef.current;
    const newAchievement = fullGame.achievements.find(
      (a) => a.unlocked && !prevIds.has(a.id)
    );
    if (newAchievement) {
      const newIds = new Set(prevIds);
      newIds.add(newAchievement.id);
      prevAchievementsRef.current = newIds;
      setLatestAchievement(newAchievement);
      setTimeout(() => setLatestAchievement(null), 3000);
    }

    // Check if season ended
    if (fullGame.seasonTurn >= fullGame.turnsPerSeason) {
      const report = generateSeasonReport(fullGame);
      setSeasonReport(report);
    }

    setGame(fullGame);
    setRankings(newRankings);
    saveGame(fullGame);

    // If season ended, show report
    if (fullGame.seasonTurn >= fullGame.turnsPerSeason) {
      setScreen('REPORT');
    }
  }, [game]);

  // ----------------------------------------
  // Handle quiz answer
  // ----------------------------------------
  const handleAnswerQuiz = useCallback(
    (optionIndex: number) => {
      if (!game) return;

      const updatedGame = answerQuiz(game, optionIndex);
      setGame(updatedGame);
      saveGame(updatedGame);
    },
    [game]
  );

  // ----------------------------------------
  // Handle season report close
  // ----------------------------------------
  const handleSeasonReportClose = useCallback(() => {
    if (!game) return;

    // Advance to next season's first turn
    const turnResult = processTurn(game);
    const advancedGame = advanceTurn(game, turnResult);

    // Apply stock price changes
    const updatedStocks = advancedGame.stocks.map((stock) => {
      const change = turnResult.priceChanges[stock.code];
      if (change === undefined) return stock;
      const original = game.stocks.find((s) => s.code === stock.code);
      if (!original) return stock;
      const newPrice = Math.max(100, Math.round(original.currentPrice * (1 + change / 100)));
      return {
        ...stock,
        previousPrice: original.currentPrice,
        currentPrice: newPrice,
        priceHistory: [...original.priceHistory, newPrice],
      };
    });

    const fullGame = { ...advancedGame, stocks: updatedStocks };
    const newRankings = calculateRankings(fullGame.players, fullGame.stocks);

    setGame(fullGame);
    setRankings(newRankings);
    setSeasonReport(null);
    gameStartTimeRef.current = Date.now();
    saveGame(fullGame);
    setScreen('PLAYING');
  }, [game]);

  // ----------------------------------------
  // Go back to main menu
  // ----------------------------------------
  const handleGoToMain = useCallback(() => {
    deleteSave();
    setGame(null);
    setRankings([]);
    setSeasonReport(null);
    setSelectedStockCode(null);
    setLatestAchievement(null);
    setScreen('START');
    setHasSave(hasSavedGame());
  }, []);

  // ----------------------------------------
  // Dismiss achievement toast
  // ----------------------------------------
  const handleDismissAchievement = useCallback(() => {
    setLatestAchievement(null);
  }, []);

  // ----------------------------------------
  // RENDER: Start Screen
  // ----------------------------------------
  if (screen === 'START') {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black gradient-text leading-tight">
              오르락 내리락 📈📉
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              주식 시뮬레이션 게임
            </p>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
              AI 투자자들과 경쟁하며 한국 주식 시장의 흐름을 읽고
              최고의 수익률을 달성해보세요!
              뉴스, 퀴즈, 시장 국면 변화 속에서 살아남으세요.
            </p>
          </div>

          {/* Player Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              플레이어 이름
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={12}
              className="w-full px-4 py-3 bg-[#1a2236] border border-[#2a3654] rounded-xl
                         text-gray-100 placeholder-gray-600 text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                         transition-colors"
            />
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              난이도 선택
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'hard', 'expert'] as Difficulty[]).map((diff) => {
                const config = DIFFICULTY_CONFIGS[diff];
                const isSelected = difficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-3 rounded-xl border text-center transition-all text-sm
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-[#2a3654] bg-[#1a2236] text-gray-400 hover:border-gray-500 hover:bg-[#1e2a42]'
                      }`}
                  >
                    <div className="text-xl mb-1">{config.emoji}</div>
                    <div className="font-bold text-xs">{config.label}</div>
                    <div className="text-[10px] mt-1 text-gray-500">
                      {(config.startingCapital / 100_000_000).toFixed(0)}억원
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-gray-600 text-center">
              수수료: 일반 0.015% · 어려움 0.3% · 전문가 0.5% + 변동성 증가
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleNewGame}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                         hover:from-blue-500 hover:to-purple-500
                         text-white font-bold text-sm transition-all
                         shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                         active:scale-[0.98]"
            >
              🎮 새 게임 시작
            </button>

            {hasSave && (
              <button
                onClick={handleContinue}
                className="w-full py-3.5 rounded-xl border border-[#2a3654] bg-[#1a2236]
                           hover:bg-[#1e2a42] text-gray-300 font-bold text-sm transition-all
                           active:scale-[0.98]"
              >
                💾 이어하기
              </button>
            )}
          </div>

          {/* Credits */}
          <div className="text-center text-[10px] text-gray-600 pt-4 border-t border-[#1a2236]">
            <p>영감 출처: 한국거래소 오르락 내리락 / 황비홍비 유튜브</p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // RENDER: Report Screen
  // ----------------------------------------
  if (screen === 'REPORT' && seasonReport) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <SeasonReportComponent
          report={seasonReport}
          onClose={handleSeasonReportClose}
        />

        {/* Additional action buttons below the modal */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[60]">
          <button
            onClick={handleSeasonReportClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                       hover:from-blue-500 hover:to-purple-500
                       text-white font-bold text-sm transition-all
                       shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            🚀 다음 시즌
          </button>
          <button
            onClick={handleGoToMain}
            className="px-6 py-2.5 rounded-xl border border-[#2a3654] bg-[#1a2236]
                       hover:bg-[#1e2a42] text-gray-300 font-bold text-sm transition-all
                       active:scale-[0.98]"
          >
            🏠 메인으로
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // RENDER: Playing Screen
  // ----------------------------------------
  if (screen === 'PLAYING' && game) {
    return (
      <GameBoard
        game={game}
        rankings={rankings}
        previousRanks={previousRanks}
        seasonReport={seasonReport}
        latestAchievement={latestAchievement}
        selectedStockCode={selectedStockCode}
        onSelectStock={setSelectedStockCode}
        onTrade={handleTrade}
        onAdvanceTurn={handleAdvanceTurn}
        onAnswerQuiz={handleAnswerQuiz}
        onCloseSeasonReport={handleSeasonReportClose}
        onDismissAchievement={handleDismissAchievement}
      />
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-gray-500 text-sm">로딩 중...</div>
    </div>
  );
}
