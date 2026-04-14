// ========================================
// Stock Game - Core Game Engine
// ========================================

import type {
  Difficulty,
  GameState,
  Grade,
  Holding,
  MarketPhase,
  MarketPhaseInfo,
  NewsEvent,
  Player,
  QuizQuestion,
  SeasonEvent,
  SeasonReport,
  Stock,
  TradeRecord,
  TradeResult,
  TurnResult,
  Achievement,
} from './types';
import {
  DIFFICULTY_CONFIGS,
  STOCK_DEFS,
  MARKET_PHASE_CONFIG,
  PHASE_ORDER,
  NEWS_POOL,
  QUIZ_POOL,
  AI_PLAYER_CONFIGS,
  SEASON_EVENT_POOL,
  GRADE_THRESHOLDS,
  STYLE_TEMPLATES,
  TURNS_PER_SEASON,
  QUIZ_APPEAR_CHANCE,
  MAX_STOCK_CHANGE_PERCENT,
} from './constants';
import { QUIZ_BONUS } from './types';
import { executeAITurns, calculateRankings } from './ai-players';

// ----------------------------------------
// 유틸리티
// ----------------------------------------

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom<T>(array: T[]): T {
  return array[randomInt(array.length)];
}

function formatCurrency(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toLocaleString()}만`;
  }
  return value.toLocaleString();
}

// ----------------------------------------
// 게임 초기화
// ----------------------------------------

export function createInitialStocks(): Stock[] {
  return STOCK_DEFS.map((def) => ({
    code: def.code,
    name: def.name,
    sector: def.sector,
    basePrice: def.basePrice,
    currentPrice: def.basePrice,
    previousPrice: def.basePrice,
    priceHistory: [def.basePrice],
    volatility: def.volatility,
    trend: 0,
    isCyclical: def.isCyclical,
    isDefensive: def.isDefensive,
    isHighGrowth: def.isHighGrowth,
  }));
}

export function createInitialPlayers(difficulty: Difficulty, playerName: string): Player[] {
  const capital = DIFFICULTY_CONFIGS[difficulty].startingCapital;

  // 실제 플레이어
  const humanPlayer: Player = {
    name: playerName,
    cash: capital,
    holdings: [],
    tradeHistory: [],
    startingCapital: capital,
    isAI: false,
    quizCorrect: 0,
    quizTotal: 0,
    consecutiveTopRank: 0,
  };

  // AI 플레이어들
  const aiPlayers: Player[] = AI_PLAYER_CONFIGS.map((config) => ({
    name: config.name,
    cash: capital,
    holdings: [],
    tradeHistory: [],
    startingCapital: capital,
    isAI: true,
    strategy: config.strategy,
    quizCorrect: 0,
    quizTotal: 0,
    consecutiveTopRank: 0,
  }));

  return [humanPlayer, ...aiPlayers];
}

export function createInitialMarketPhase(): MarketPhaseInfo {
  const initialPhase: MarketPhase = 'bull';
  const config = MARKET_PHASE_CONFIG[initialPhase];
  const totalTurns = randomRange(config.minTurns, config.maxTurns);

  return {
    phase: initialPhase,
    name: config.name,
    emoji: config.emoji,
    turnsRemaining: totalTurns,
    turnsInPhase: 0,
    totalPhaseTurns: totalTurns,
  };
}

export function createSeasonEvents(): SeasonEvent[] {
  const shuffled = shuffleArray(SEASON_EVENT_POOL);
  const count = randomRange(2, 3);
  return shuffled.slice(0, count);
}

export function createAchievements(): Achievement[] {
  return [
    {
      id: 'first_trade',
      name: '첫 거래',
      description: '첫 번째 주식 거래를 완료하세요',
      emoji: '🎯',
      condition: (game) => game.players[0].tradeHistory.length >= 1,
      unlocked: false,
    },
    {
      id: 'first_profit',
      name: '첫 수익',
      description: '주식 매도로 수익을 내세요',
      emoji: '💰',
      condition: (game) => {
        const player = game.players[0];
        return player.tradeHistory.some((t) => {
          if (t.action !== 'sell') return false;
          return t.pricePerShare * t.quantity > t.totalAmount;
        });
      },
      unlocked: false,
    },
    {
      id: 'return_10',
      name: '10% 수익률',
      description: '총 자산 수익률 10% 달성',
      emoji: '📈',
      condition: (game) => {
        const total = getPlayerTotalAssets(game);
        return ((total - game.players[0].startingCapital) / game.players[0].startingCapital) * 100 >= 10;
      },
      unlocked: false,
    },
    {
      id: 'return_30',
      name: '30% 수익률',
      description: '총 자산 수익률 30% 달성',
      emoji: '🚀',
      condition: (game) => {
        const total = getPlayerTotalAssets(game);
        return ((total - game.players[0].startingCapital) / game.players[0].startingCapital) * 100 >= 30;
      },
      unlocked: false,
    },
    {
      id: 'diversified',
      name: '분산 투자',
      description: '3개 이상 종목을 보유하세요',
      emoji: '🌊',
      condition: (game) => game.players[0].holdings.length >= 3,
      unlocked: false,
    },
    {
      id: 'all_in',
      name: '올인!',
      description: '현금을 10% 미만으로 만드세요',
      emoji: '🔥',
      condition: (game) => {
        const player = game.players[0];
        const holdingsValue = getPlayerHoldingsValue(game);
        const total = player.cash + holdingsValue;
        return total > 0 && player.cash / total < 0.1;
      },
      unlocked: false,
    },
    {
      id: 'quiz_correct_10',
      name: '퀴즈 달인',
      description: '퀴즈 10개 정답',
      emoji: '🧠',
      condition: (game) => game.players[0].quizCorrect >= 10,
      unlocked: false,
    },
    {
      id: 'ai_beat_5',
      name: 'AI 이기기',
      description: '5턴 연속 1위',
      emoji: '🏆',
      condition: (game) => game.players[0].consecutiveTopRank >= 5,
      unlocked: false,
    },
    {
      id: 'bear_survivor',
      name: '하락장 생존자',
      description: '하락장에서도 수익률이 양수',
      emoji: '🐻',
      condition: (game) => {
        if (game.marketPhase.phase !== 'bear') return false;
        const total = getPlayerTotalAssets(game);
        return total > game.players[0].startingCapital;
      },
      unlocked: false,
    },
    {
      id: 'speed_trader',
      name: '단기 매매왕',
      description: '한 시즌에 20번 이상 거래',
      emoji: '⚡',
      condition: (game) => game.players[0].tradeHistory.length >= 20,
      unlocked: false,
    },
  ];
}

export function initGame(difficulty: Difficulty, playerName: string): GameState {
  return {
    difficulty,
    stocks: createInitialStocks(),
    players: createInitialPlayers(difficulty, playerName),
    currentPlayerIndex: 0,
    marketPhase: createInitialMarketPhase(),
    turn: 0,
    season: 1,
    seasonTurn: 0,
    turnsPerSeason: TURNS_PER_SEASON,
    currentNews: null,
    currentQuiz: null,
    quizAnswered: false,
    quizCorrect: false,
    seasonEvents: createSeasonEvents(),
    achievements: createAchievements(),
    isGameOver: false,
    rankHistory: [],
  };
}

// ----------------------------------------
// 플레이어 자산 계산
// ----------------------------------------

export function getPlayerTotalAssets(game: GameState): number {
  const player = game.players[game.currentPlayerIndex];
  return player.cash + getPlayerHoldingsValue(game);
}

export function getPlayerHoldingsValue(game: GameState): number {
  const player = game.players[game.currentPlayerIndex];
  return player.holdings.reduce((total, holding) => {
    const stock = game.stocks.find((s) => s.code === holding.stockCode);
    if (!stock) return total;
    return total + stock.currentPrice * holding.quantity;
  }, 0);
}

export function getPlayerReturnRate(game: GameState): number {
  const player = game.players[game.currentPlayerIndex];
  const total = player.cash + getPlayerHoldingsValue(game);
  return ((total - player.startingCapital) / player.startingCapital) * 100;
}

// ----------------------------------------
// 시장 국면 관리
// ----------------------------------------

export function advanceMarketPhase(phaseInfo: MarketPhaseInfo): MarketPhaseInfo {
  const currentIdx = PHASE_ORDER.indexOf(phaseInfo.phase);
  const nextIdx = (currentIdx + 1) % PHASE_ORDER.length;
  const nextPhase = PHASE_ORDER[nextIdx];
  const config = MARKET_PHASE_CONFIG[nextPhase];
  const totalTurns = randomRange(config.minTurns, config.maxTurns);

  return {
    phase: nextPhase,
    name: config.name,
    emoji: config.emoji,
    turnsRemaining: totalTurns,
    turnsInPhase: 0,
    totalPhaseTurns: totalTurns,
  };
}

export function tickMarketPhase(phaseInfo: MarketPhaseInfo): MarketPhaseInfo {
  const newTurnsRemaining = phaseInfo.turnsRemaining - 1;
  const newTurnsInPhase = phaseInfo.turnsInPhase + 1;

  if (newTurnsRemaining <= 0) {
    return advanceMarketPhase(phaseInfo);
  }

  return {
    ...phaseInfo,
    turnsRemaining: newTurnsRemaining,
    turnsInPhase: newTurnsInPhase,
  };
}

// ----------------------------------------
// 뉴스 생성
// ----------------------------------------

export function generateNews(phase: MarketPhase, _stocks: Stock[]): NewsEvent | null {
  const phaseConfig = MARKET_PHASE_CONFIG[phase];

  // 해당 국면에 맞는 뉴스 필터링
  const phaseNews = NEWS_POOL.filter((n) => n.phases.includes(phase));

  // 긍정/부정 가중치에 따라 선택
  const positiveNews = phaseNews.filter((n) => n.effect === 'positive');
  const negativeNews = phaseNews.filter((n) => n.effect === 'negative');
  const neutralNews = phaseNews.filter((n) => n.effect === 'neutral');

  const rand = Math.random();
  let selectedNews: (typeof NEWS_POOL)[number];

  if (rand < phaseConfig.positiveNewsWeight && positiveNews.length > 0) {
    selectedNews = pickRandom(positiveNews);
  } else if (
    rand < phaseConfig.positiveNewsWeight + phaseConfig.negativeNewsWeight &&
    negativeNews.length > 0
  ) {
    selectedNews = pickRandom(negativeNews);
  } else if (neutralNews.length > 0) {
    selectedNews = pickRandom(neutralNews);
  } else {
    selectedNews = pickRandom(phaseNews.length > 0 ? phaseNews : NEWS_POOL);
  }

  return {
    headline: selectedNews.headline,
    description: selectedNews.description,
    effect: selectedNews.effect,
    affectedStocks: selectedNews.affectedStocks,
    impactStrength: selectedNews.impactStrength,
    category: selectedNews.category,
  };
}

// ----------------------------------------
// 가격 변동 계산
// ----------------------------------------

export function calculatePriceChanges(
  stocks: Stock[],
  phase: MarketPhase,
  news: NewsEvent | null,
  volatilityMultiplier: number
): Stock[] {
  const phaseConfig = MARKET_PHASE_CONFIG[phase];
  const newStocks = stocks.map((stock) => {
    const previousPrice = stock.currentPrice;

    // 1. 기본 랜덤 움직임 (국면의 추세 바이어스)
    const baseVolatility = stock.volatility * phaseConfig.volatilityMod * volatilityMultiplier;
    const trendBias = phaseConfig.trendBias;

    // 경기주/방어주 효과
    let sectorMod = 1;
    if (stock.isCyclical && phase === 'bull') sectorMod = 1.2;
    if (stock.isCyclical && phase === 'bear') sectorMod = 1.3;
    if (stock.isDefensive && phase === 'bear') sectorMod = 0.7;
    if (stock.isDefensive && phase === 'consolidation') sectorMod = 0.8;
    if (stock.isHighGrowth && (phase === 'bull' || phase === 'recovery')) sectorMod = 1.15;
    if (stock.isHighGrowth && phase === 'bear') sectorMod = 1.25;

    // 정규분포 근사 (Box-Muller 간략화)
    const u1 = Math.random();
    const u2 = Math.random();
    const normalRandom = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);

    // 최종 변동률
    let changePercent =
      (normalRandom * baseVolatility * 0.04 + trendBias * 0.01) * sectorMod;

    // 2. 뉴스 효과
    if (news && news.affectedStocks.length === 0) {
      // 전체 시장 영향
      const newsEffect =
        news.effect === 'positive'
          ? news.impactStrength * 0.02
          : news.effect === 'negative'
          ? -news.impactStrength * 0.02
          : 0;
      changePercent += newsEffect * baseVolatility;
    } else if (news && news.affectedStocks.includes(stock.code)) {
      // 특정 종목 영향
      const newsEffect =
        news.effect === 'positive'
          ? news.impactStrength * 0.05
          : news.effect === 'negative'
          ? -news.impactStrength * 0.05
          : 0;
      changePercent += newsEffect * baseVolatility;
    }

    // 3. 상한가/하한가 제한
    changePercent = Math.max(-MAX_STOCK_CHANGE_PERCENT, Math.min(MAX_STOCK_CHANGE_PERCENT, changePercent));

    // 4. 새 가격 계산 (최소 100원)
    const newPrice = Math.max(100, Math.round(previousPrice * (1 + changePercent)));

    // 5. 트렌드 업데이트
    const newTrend = stock.priceHistory.length >= 3
      ? (newPrice - stock.priceHistory[stock.priceHistory.length - 3]) /
        (stock.priceHistory[stock.priceHistory.length - 3] || 1)
      : changePercent;

    return {
      ...stock,
      previousPrice,
      currentPrice: newPrice,
      priceHistory: [...stock.priceHistory, newPrice],
      trend: Math.max(-1, Math.min(1, newTrend)),
    };
  });

  return newStocks;
}

// ----------------------------------------
// 퀴즈 생성
// ----------------------------------------

export function generateQuiz(_game: GameState): QuizQuestion | null {
  if (!chance(QUIZ_APPEAR_CHANCE)) return null;
  return pickRandom(QUIZ_POOL);
}

export function answerQuiz(game: GameState, selectedAnswer: number): GameState {
  if (!game.currentQuiz || game.quizAnswered) return game;

  const isCorrect = selectedAnswer === game.currentQuiz.answer;
  const newPlayers = [...game.players];
  const player = { ...newPlayers[game.currentPlayerIndex] };

  if (isCorrect) {
    const bonus = QUIZ_BONUS[game.currentQuiz.difficulty] || 50_000;
    player.cash += bonus;
    player.quizCorrect += 1;
  }
  player.quizTotal += 1;

  newPlayers[game.currentPlayerIndex] = player;

  return {
    ...game,
    players: newPlayers,
    quizAnswered: true,
    quizCorrect: isCorrect,
  };
}

// ----------------------------------------
// 매매 실행
// ----------------------------------------

export function executeBuy(
  game: GameState,
  stockCode: string,
  quantity: number
): { game: GameState; result: TradeResult } {
  const player = game.players[game.currentPlayerIndex];
  const stock = game.stocks.find((s) => s.code === stockCode);

  if (!stock) {
    return {
      game,
      result: { success: false, message: '종목을 찾을 수 없습니다.', newCash: player.cash },
    };
  }

  const feeRate = DIFFICULTY_CONFIGS[game.difficulty].feeRate;
  const totalCost = stock.currentPrice * quantity;
  const fee = Math.floor(totalCost * feeRate);
  const totalWithFee = totalCost + fee;

  if (quantity <= 0) {
    return {
      game,
      result: { success: false, message: '수량을 1주 이상 입력해주세요.', newCash: player.cash },
    };
  }

  if (player.cash < totalWithFee) {
    return {
      game,
      result: {
        success: false,
        message: `자금이 부족합니다. 필요: ${formatCurrency(totalWithFee)}, 보유: ${formatCurrency(player.cash)}`,
        newCash: player.cash,
      },
    };
  }

  const newCash = player.cash - totalWithFee;
  const newHoldings = [...player.holdings];

  const existingIndex = newHoldings.findIndex((h) => h.stockCode === stockCode);
  if (existingIndex >= 0) {
    const existing = newHoldings[existingIndex];
    const newQuantity = existing.quantity + quantity;
    const newTotalCost = existing.totalCost + totalCost;
    newHoldings[existingIndex] = {
      ...existing,
      quantity: newQuantity,
      averagePrice: Math.floor(newTotalCost / newQuantity),
      totalCost: newTotalCost,
    };
  } else {
    newHoldings.push({
      stockCode,
      stockName: stock.name,
      quantity,
      averagePrice: stock.currentPrice,
      totalCost,
    });
  }

  const trade: TradeRecord = {
    turn: game.turn,
    stockCode,
    stockName: stock.name,
    action: 'buy',
    quantity,
    pricePerShare: stock.currentPrice,
    totalAmount: totalCost,
    fee,
  };

  const newPlayers = [...game.players];
  newPlayers[game.currentPlayerIndex] = {
    ...player,
    cash: newCash,
    holdings: newHoldings,
    tradeHistory: [...player.tradeHistory, trade],
  };

  return {
    game: { ...game, players: newPlayers },
    result: {
      success: true,
      message: `${stock.name} ${quantity}주 매수 완료 (수수료: ${formatCurrency(fee)})`,
      trade,
      newCash,
      newHolding: newHoldings.find((h) => h.stockCode === stockCode),
    },
  };
}

export function executeSell(
  game: GameState,
  stockCode: string,
  quantity: number
): { game: GameState; result: TradeResult } {
  const player = game.players[game.currentPlayerIndex];
  const stock = game.stocks.find((s) => s.code === stockCode);
  const holding = player.holdings.find((h) => h.stockCode === stockCode);

  if (!stock || !holding) {
    return {
      game,
      result: { success: false, message: '보유 중인 종목이 아닙니다.', newCash: player.cash },
    };
  }

  if (quantity <= 0) {
    return {
      game,
      result: { success: false, message: '수량을 1주 이상 입력해주세요.', newCash: player.cash },
    };
  }

  if (quantity > holding.quantity) {
    return {
      game,
      result: {
        success: false,
        message: `보유 수량을 초과합니다. 보유: ${holding.quantity}주`,
        newCash: player.cash,
      },
    };
  }

  const feeRate = DIFFICULTY_CONFIGS[game.difficulty].feeRate;
  const sellAmount = stock.currentPrice * quantity;
  const fee = Math.floor(sellAmount * feeRate);
  const proceeds = sellAmount - fee;
  const newCash = player.cash + proceeds;

  const newHoldings = player.holdings
    .map((h) => {
      if (h.stockCode !== stockCode) return h;
      const newQuantity = h.quantity - quantity;
      if (newQuantity === 0) return null;
      return { ...h, quantity: newQuantity };
    })
    .filter((h): h is Holding => h !== null);

  const trade: TradeRecord = {
    turn: game.turn,
    stockCode,
    stockName: stock.name,
    action: 'sell',
    quantity,
    pricePerShare: stock.currentPrice,
    totalAmount: sellAmount,
    fee,
  };

  const pnl = (stock.currentPrice - holding.averagePrice) * quantity - fee;
  const pnlText = pnl >= 0 ? `+${formatCurrency(pnl)}` : formatCurrency(pnl);

  const newPlayers = [...game.players];
  newPlayers[game.currentPlayerIndex] = {
    ...player,
    cash: newCash,
    holdings: newHoldings,
    tradeHistory: [...player.tradeHistory, trade],
  };

  return {
    game: { ...game, players: newPlayers },
    result: {
      success: true,
      message: `${stock.name} ${quantity}주 매도 완료 (손익: ${pnlText}, 수수료: ${formatCurrency(fee)})`,
      trade,
      newCash,
      newHolding: newHoldings.find((h) => h.stockCode === stockCode),
    },
  };
}

// ----------------------------------------
// 턴 진행
// ----------------------------------------

export function processTurn(game: GameState): TurnResult {
  const feeRate = DIFFICULTY_CONFIGS[game.difficulty].feeRate;
  const volMultiplier = DIFFICULTY_CONFIGS[game.difficulty].volatilityMultiplier;

  // 1. 뉴스 생성
  const news = generateNews(game.marketPhase.phase, game.stocks);

  // 2. 가격 변동
  const updatedStocks = calculatePriceChanges(
    game.stocks,
    game.marketPhase.phase,
    news,
    volMultiplier
  );

  // 가격 변동률 기록
  const priceChanges: Record<string, number> = {};
  updatedStocks.forEach((stock) => {
    const original = game.stocks.find((s) => s.code === stock.code);
    if (original) {
      priceChanges[stock.code] =
        original.currentPrice > 0
          ? ((stock.currentPrice - original.currentPrice) / original.currentPrice) * 100
          : 0;
    }
  });

  // 3. 퀴즈 생성
  const quiz = generateQuiz({ ...game, stocks: updatedStocks });

  // 4. AI 플레이어 행동
  const { updatedPlayers: aiUpdatedPlayers, actions: aiActions } = executeAITurns(
    game.players,
    updatedStocks,
    game.marketPhase.phase,
    feeRate,
    game.turn
  );

  // 5. 순위 계산
  const rankings = calculateRankings(aiUpdatedPlayers, updatedStocks);

  return {
    news,
    quiz,
    priceChanges,
    aiActions,
    rankings,
  };
}

export function advanceTurn(game: GameState, turnResult: TurnResult): GameState {
  const newTurn = game.turn + 1;
  const newSeasonTurn = game.seasonTurn + 1;

  // 시장 국면 틱
  const newMarketPhase = tickMarketPhase(game.marketPhase);

  // 시즌 종료 체크
  let newSeason = game.season;
  let newSeasonTurnFinal = newSeasonTurn;
  let newSeasonEvents = game.seasonEvents;

  if (newSeasonTurn >= game.turnsPerSeason) {
    newSeason += 1;
    newSeasonTurnFinal = 0;
    newSeasonEvents = createSeasonEvents();
  }

  // 순위 기록 업데이트
  const newRankHistory = [...game.rankHistory];
  if (turnResult.rankings.length > 0) {
    const playerRank = turnResult.rankings.find((r) => r.isPlayer);
    const playerIdx = game.currentPlayerIndex;
    const newPlayers = [...game.players];
    if (playerRank && playerRank.rank === 1) {
      newPlayers[playerIdx] = {
        ...newPlayers[playerIdx],
        consecutiveTopRank: newPlayers[playerIdx].consecutiveTopRank + 1,
      };
    } else {
      newPlayers[playerIdx] = {
        ...newPlayers[playerIdx],
        consecutiveTopRank: 0,
      };
    }
  }

  // 퀴즈 상태 초기화
  const hasQuiz = turnResult.quiz !== null;

  const updatedGame: GameState = {
    ...game,
    turn: newTurn,
    seasonTurn: newSeasonTurnFinal,
    season: newSeason,
    marketPhase: newMarketPhase,
    currentNews: turnResult.news,
    currentQuiz: turnResult.quiz,
    quizAnswered: !hasQuiz,
    quizCorrect: false,
    seasonEvents: newSeasonEvents,
    rankHistory: newRankHistory,
  };

  // 업적 체크
  updatedGame.achievements = checkAchievements(updatedGame);

  return updatedGame;
}

// ----------------------------------------
// 업적 체크
// ----------------------------------------

function checkAchievements(game: GameState): Achievement[] {
  return game.achievements.map((achievement) => {
    if (achievement.unlocked) return achievement;
    const unlocked = achievement.condition(game);
    return { ...achievement, unlocked };
  });
}

// ----------------------------------------
// 시즌 종료 리포트
// ----------------------------------------

export function generateSeasonReport(game: GameState): SeasonReport {
  const player = game.players[game.currentPlayerIndex];
  const holdingsValue = getPlayerHoldingsValue(game);
  const totalAssets = player.cash + holdingsValue;
  const returnRate = ((totalAssets - player.startingCapital) / player.startingCapital) * 100;

  const trades = player.tradeHistory.filter(
    (t) => t.turn > (game.season - 1) * game.turnsPerSeason
  );

  // 수익/손실 거래 분류
  let profitTrades = 0;
  let lossTrades = 0;
  const holdingsMap = new Map<string, number>();

  for (const trade of trades) {
    if (trade.action === 'buy') {
      holdingsMap.set(trade.stockCode, (holdingsMap.get(trade.stockCode) || 0) + trade.pricePerShare * trade.quantity);
    } else {
      const avgCost = holdingsMap.get(trade.stockCode) || 0;
      const sellRevenue = trade.pricePerShare * trade.quantity - trade.fee;
      if (sellRevenue > avgCost) profitTrades++;
      else lossTrades++;
    }
  }

  // 최대 낙폭 계산
  let maxDrawdown = 0;
  for (let i = 0; i < game.stocks.length; i++) {
    const stock = game.stocks[i];
    if (stock.priceHistory.length < 2) continue;
    const peak = Math.max(...stock.priceHistory);
    const trough = Math.min(...stock.priceHistory);
    const dd = peak > 0 ? (peak - trough) / peak : 0;
    maxDrawdown = Math.max(maxDrawdown, dd);
  }

  // 등급 산정
  const grade = calculateGrade(returnRate);

  // 스타일 분석
  const totalTradeCount = trades.length;
  const style = STYLE_TEMPLATES.find(
    (t) => totalTradeCount >= t.minTrades && totalTradeCount < t.maxTrades
  );

  // 하이라이트
  const highlights: string[] = [];
  if (returnRate > 20) highlights.push('뛰어난 수익률을 달성했습니다!');
  if (profitTrades > lossTrades * 2) highlights.push('승률이 매우 높습니다.');
  if (maxDrawdown < 0.1) highlights.push('안정적인 자산 관리를 보여주었습니다.');
  if (totalTradeCount < 5) highlights.push('소극적인 거래 패턴입니다.');
  if (returnRate < -10) highlights.push('손실 통제가 필요합니다.');

  return {
    grade: grade as Grade,
    totalAssets,
    returnRate,
    totalTrades: totalTradeCount,
    profitTrades,
    lossTrades,
    maxDrawdown,
    styleAnalysis: style?.description || '균형 잡힌 투자 스타일입니다.',
    highlights,
  };
}

function calculateGrade(returnRate: number): string {
  for (const threshold of GRADE_THRESHOLDS) {
    if (returnRate >= threshold.minReturn && returnRate < threshold.maxReturn) {
      return threshold.grade;
    }
  }
  return returnRate >= 30 ? 'S' : 'D';
}

// ----------------------------------------
// 최대 구매 가능 수량 계산
// ----------------------------------------

export function getMaxBuyQuantity(game: GameState, stockCode: string): number {
  const player = game.players[game.currentPlayerIndex];
  const stock = game.stocks.find((s) => s.code === stockCode);
  if (!stock || stock.currentPrice <= 0) return 0;

  const feeRate = DIFFICULTY_CONFIGS[game.difficulty].feeRate;
  // totalWithFee = price * qty * (1 + feeRate)
  // qty = cash / (price * (1 + feeRate))
  const maxQty = Math.floor(player.cash / (stock.currentPrice * (1 + feeRate)));
  return Math.max(0, maxQty);
}

// ----------------------------------------
// 보유 수량 조회
// ----------------------------------------

export function getHoldingQuantity(game: GameState, stockCode: string): number {
  const player = game.players[game.currentPlayerIndex];
  const holding = player.holdings.find((h) => h.stockCode === stockCode);
  return holding?.quantity || 0;
}

// ----------------------------------------
// 포맷 헬퍼
// ----------------------------------------

export { formatCurrency };
