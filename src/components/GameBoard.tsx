'use client';

import { GameState, RankingEntry, Achievement, SeasonReport as SeasonReportType } from '@/lib/types';

import TopBar from './TopBar';
import MarketPhaseBanner from './MarketPhaseBanner';
import StockList from './StockList';
import TradingPanel from './TradingPanel';
import NewsCard from './NewsCard';
import QuizModal from './QuizModal';
import RankingBoard from './RankingBoard';
import PortfolioPanel from './PortfolioPanel';
import PriceChart from './PriceChart';
import SeasonReport from './SeasonReport';
import AchievementToast from './AchievementToast';

interface GameBoardProps {
  game: GameState;
  rankings: RankingEntry[];
  previousRanks?: Record<string, number>;
  seasonReport: SeasonReportType | null;
  latestAchievement: Achievement | null;
  selectedStockCode: string | null;
  onSelectStock: (code: string) => void;
  onTrade: (stockCode: string, action: 'buy' | 'sell', quantity: number) => void;
  onAdvanceTurn: () => void;
  onAnswerQuiz: (optionIndex: number) => void;
  onCloseSeasonReport: () => void;
  onDismissAchievement: () => void;
}

export default function GameBoard({
  game,
  rankings,
  previousRanks,
  seasonReport,
  latestAchievement,
  selectedStockCode,
  onSelectStock,
  onTrade,
  onAdvanceTurn,
  onAnswerQuiz,
  onCloseSeasonReport,
  onDismissAchievement,
}: GameBoardProps) {
  const player = game.players[game.currentPlayerIndex];
  const selectedStock = game.stocks.find((s) => s.code === selectedStockCode) || null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* TopBar */}
      <TopBar
        difficulty={game.difficulty}
        season={game.season}
        seasonTurn={game.seasonTurn}
        turnsPerSeason={game.turnsPerSeason}
        cash={player.cash}
        totalAssets={
          player.cash +
          player.holdings.reduce((sum, h) => {
            const stock = game.stocks.find((s) => s.code === h.stockCode);
            return sum + (stock ? stock.currentPrice * h.quantity : 0);
          }, 0)
        }
        startingCapital={player.startingCapital}
        achievementCount={game.achievements.filter((a) => a.unlocked).length}
      />

      {/* MarketPhaseBanner */}
      <div className="px-4 pt-3">
        <MarketPhaseBanner phaseInfo={game.marketPhase} />
      </div>

      {/* 메인 그리드 */}
      <div className="px-4 py-3 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* 좌측: StockList */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <StockList
            stocks={game.stocks}
            selectedCode={selectedStockCode}
            onSelect={onSelectStock}
          />
        </div>

        {/* 중앙: NewsCard + TradingPanel */}
        <div className="lg:col-span-5 order-1 lg:order-2 space-y-3">
          <NewsCard news={game.currentNews} stocks={game.stocks} />
          <TradingPanel
            stocks={game.stocks}
            cash={player.cash}
            holdings={player.holdings}
            difficulty={game.difficulty}
            selectedStockCode={selectedStockCode}
            onTrade={onTrade}
            onAdvanceTurn={onAdvanceTurn}
          />
        </div>

        {/* 우측: RankingBoard + PortfolioPanel */}
        <div className="lg:col-span-4 order-3 space-y-3">
          <RankingBoard rankings={rankings} previousRanks={previousRanks} />
          <PortfolioPanel holdings={player.holdings} stocks={game.stocks} cash={player.cash} />
        </div>

        {/* 하단: PriceChart */}
        <div className="lg:col-span-12 order-4">
          <PriceChart stock={selectedStock} marketPhase={game.marketPhase.phase} />
        </div>
      </div>

      {/* QuizModal */}
      {game.currentQuiz && !game.isGameOver && (
        <QuizModal
          quiz={game.currentQuiz}
          answered={game.quizAnswered}
          isCorrect={game.quizCorrect}
          onAnswer={onAnswerQuiz}
        />
      )}

      {/* SeasonReport */}
      {seasonReport && (
        <SeasonReport report={seasonReport} onClose={onCloseSeasonReport} />
      )}

      {/* AchievementToast */}
      <AchievementToast achievement={latestAchievement} onDismiss={onDismissAchievement} />
    </div>
  );
}
