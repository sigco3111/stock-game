// ========================================
// Stock Game - AI Player Logic
// ========================================

import type {
  AIAction,
  AIStrategy,
  Holding,
  MarketPhase,
  Player,
  Stock,
  TradeRecord,
} from './types';

// ----------------------------------------
// 유틸리티 함수
// ----------------------------------------

/** 0~max 사이의 랜덤 정수 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/** min~max 사이의 랜덤 정수 */
function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 확률 (0~1) */
function chance(probability: number): boolean {
  return Math.random() < probability;
}

/** 보유 종목의 현재 가치 계산 */
function getHoldingsValue(player: Player, stocks: Stock[]): number {
  return player.holdings.reduce((total, holding) => {
    const stock = stocks.find((s) => s.code === holding.stockCode);
    if (!stock) return total;
    return total + stock.currentPrice * holding.quantity;
  }, 0);
}

/** 주식의 최근 트렌드 분석 (최근 5턴) */
function getRecentTrend(stock: Stock): number {
  const history = stock.priceHistory;
  if (history.length < 2) return 0;
  const recent = history.slice(-5);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  return first > 0 ? (last - first) / first : 0;
}

/** 주식이 현재 가격 대비 얼마나 떨어졌는지 (하락률) */
function getDrawdownFromPeak(stock: Stock): number {
  if (stock.priceHistory.length === 0) return 0;
  const peak = Math.max(...stock.priceHistory);
  if (peak === 0) return 0;
  return (peak - stock.currentPrice) / peak;
}

// ----------------------------------------
// 매수/매도 헬퍼
// ----------------------------------------

interface TradeExecution {
  success: boolean;
  cash: number;
  holdings: Holding[];
  trade: TradeRecord | null;
}

/** 주식 매수 실행 */
function executeBuy(
  player: Player,
  stock: Stock,
  quantity: number,
  feeRate: number,
  turn: number
): TradeExecution {
  const totalCost = stock.currentPrice * quantity;
  const fee = Math.floor(totalCost * feeRate);
  const totalWithFee = totalCost + fee;

  if (player.cash < totalWithFee || quantity <= 0) {
    return { success: false, cash: player.cash, holdings: player.holdings, trade: null };
  }

  const newCash = player.cash - totalWithFee;
  const newHoldings = [...player.holdings];

  const existingIndex = newHoldings.findIndex((h) => h.stockCode === stock.code);
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
      stockCode: stock.code,
      stockName: stock.name,
      quantity,
      averagePrice: stock.currentPrice,
      totalCost,
    });
  }

  const trade: TradeRecord = {
    turn,
    stockCode: stock.code,
    stockName: stock.name,
    action: 'buy',
    quantity,
    pricePerShare: stock.currentPrice,
    totalAmount: totalCost,
    fee,
  };

  return { success: true, cash: newCash, holdings: newHoldings, trade };
}

/** 주식 매도 실행 */
function executeSell(
  player: Player,
  stock: Stock,
  quantity: number,
  feeRate: number,
  turn: number
): TradeExecution {
  const holding = player.holdings.find((h) => h.stockCode === stock.code);
  if (!holding || holding.quantity < quantity || quantity <= 0) {
    return { success: false, cash: player.cash, holdings: player.holdings, trade: null };
  }

  const sellAmount = stock.currentPrice * quantity;
  const fee = Math.floor(sellAmount * feeRate);
  const proceeds = sellAmount - fee;
  const newCash = player.cash + proceeds;

  const newHoldings = player.holdings
    .map((h) => {
      if (h.stockCode !== stock.code) return h;
      const newQuantity = h.quantity - quantity;
      if (newQuantity === 0) return null;
      return { ...h, quantity: newQuantity };
    })
    .filter((h): h is Holding => h !== null);

  const trade: TradeRecord = {
    turn,
    stockCode: stock.code,
    stockName: stock.name,
    action: 'sell',
    quantity,
    pricePerShare: stock.currentPrice,
    totalAmount: sellAmount,
    fee,
  };

  return { success: true, cash: newCash, holdings: newHoldings, trade };
}

// ----------------------------------------
// AI 전략 구현
// ----------------------------------------

/** 개미투자자: 무작위, 소액, 감정적 */
function antStrategy(
  player: Player,
  stocks: Stock[],
  phase: MarketPhase,
  feeRate: number,
  turn: number
): { updatedPlayer: Player; actions: AIAction[] } {
  const actions: AIAction[] = [];
  let currentCash = player.cash;
  let currentHoldings = [...player.holdings];

  // 행동 확률: 상승장에서는 사고 싶어하고, 하락장에서는 팔고 싶어함
  const buyProbability =
    phase === 'bull' ? 0.7 : phase === 'recovery' ? 0.5 : phase === 'consolidation' ? 0.4 : 0.25;

  // 1~3번 행동
  const actionCount = randomRange(1, 3);

  for (let i = 0; i < actionCount; i++) {
    if (chance(buyProbability)) {
      // 매수 시도
      const targetStock = stocks[randomInt(stocks.length)];
      const maxAffordable = Math.floor(currentCash / (targetStock.currentPrice * (1 + feeRate)));
      const quantity = Math.min(randomRange(1, Math.max(1, Math.floor(maxAffordable * 0.2))), maxAffordable);

      if (quantity > 0) {
        const result = executeBuy(
          { ...player, cash: currentCash, holdings: currentHoldings },
          targetStock,
          quantity,
          feeRate,
          turn
        );
        if (result.success && result.trade) {
          currentCash = result.cash;
          currentHoldings = result.holdings;
          actions.push({
            playerName: player.name,
            strategy: 'ant',
            action: 'buy',
            stockCode: targetStock.code,
            stockName: targetStock.name,
            quantity,
            amount: result.trade.totalAmount,
            reason: '그냥 사고 싶어서 샀습니다! 🐜',
          });
        }
      }
    } else {
      // 매도 시도
      if (currentHoldings.length > 0) {
        const holding = currentHoldings[randomInt(currentHoldings.length)];
        const stock = stocks.find((s) => s.code === holding.stockCode);
        if (stock) {
          const sellQuantity = Math.min(randomRange(1, holding.quantity), holding.quantity);
          const result = executeSell(
            { ...player, cash: currentCash, holdings: currentHoldings },
            stock,
            sellQuantity,
            feeRate,
            turn
          );
          if (result.success && result.trade) {
            currentCash = result.cash;
            currentHoldings = result.holdings;
            actions.push({
              playerName: player.name,
              strategy: 'ant',
              action: 'sell',
              stockCode: stock.code,
              stockName: stock.name,
              quantity: sellQuantity,
              amount: result.trade.totalAmount,
              reason: '불안해서 팔았습니다... 😰',
            });
          }
        }
      }
    }
  }

  return {
    updatedPlayer: { ...player, cash: currentCash, holdings: currentHoldings },
    actions,
  };
}

/** 기관투자자: 추세추종, 대규모 */
function institutionStrategy(
  player: Player,
  stocks: Stock[],
  phase: MarketPhase,
  feeRate: number,
  turn: number
): { updatedPlayer: Player; actions: AIAction[] } {
  const actions: AIAction[] = [];
  let currentCash = player.cash;
  let currentHoldings = [...player.holdings];

  const isBullish = phase === 'bull' || phase === 'recovery';
  const isBearish = phase === 'bear';

  if (isBullish && chance(0.75)) {
    // 상승/반등장: 대규모 매수 (강세주 우선)
    const sortedStocks = [...stocks].sort((a, b) => getRecentTrend(b) - getRecentTrend(a));
    const targets = sortedStocks.slice(0, 3); // 상위 3개

    for (const stock of targets) {
      if (!chance(0.6)) continue;
      const maxAffordable = Math.floor(currentCash / (stock.currentPrice * (1 + feeRate)));
      const quantity = Math.min(
        randomRange(Math.floor(maxAffordable * 0.1), Math.floor(maxAffordable * 0.3)),
        maxAffordable
      );
      if (quantity > 0) {
        const result = executeBuy(
          { ...player, cash: currentCash, holdings: currentHoldings },
          stock,
          quantity,
          feeRate,
          turn
        );
        if (result.success && result.trade) {
          currentCash = result.cash;
          currentHoldings = result.holdings;
          actions.push({
            playerName: player.name,
            strategy: 'institution',
            action: 'buy',
            stockCode: stock.code,
            stockName: stock.name,
            quantity,
            amount: result.trade.totalAmount,
            reason: '추세 확인, 대규모 매수 진행합니다. 🏢',
          });
        }
      }
    }
  } else if (isBearish && chance(0.7)) {
    // 하락장: 대규모 매도 (손실 있는 것 우선)
    const lossmaking = currentHoldings
      .map((h) => {
        const stock = stocks.find((s) => s.code === h.stockCode)!;
        return { holding: h, stock, pnl: (stock.currentPrice - h.averagePrice) / h.averagePrice };
      })
      .sort((a, b) => a.pnl - b.pnl);

    for (const { holding, stock } of lossmaking) {
      if (!chance(0.6)) continue;
      const sellQuantity = Math.floor(holding.quantity * randomRange(0.3, 0.8));
      if (sellQuantity > 0) {
        const result = executeSell(
          { ...player, cash: currentCash, holdings: currentHoldings },
          stock,
          sellQuantity,
          feeRate,
          turn
        );
        if (result.success && result.trade) {
          currentCash = result.cash;
          currentHoldings = result.holdings;
          actions.push({
            playerName: player.name,
            strategy: 'institution',
            action: 'sell',
            stockCode: stock.code,
            stockName: stock.name,
            quantity: sellQuantity,
            amount: result.trade.totalAmount,
            reason: '리스크 관리를 위해 포지션을 정리합니다. 🏢',
          });
        }
      }
    }
  } else {
    // 조정장: 관망
    if (chance(0.3)) {
      const stock = stocks[randomInt(stocks.length)];
      const maxAffordable = Math.floor(currentCash / (stock.currentPrice * (1 + feeRate)));
      const quantity = Math.min(Math.floor(maxAffordable * 0.05), maxAffordable);
      if (quantity > 0) {
        const result = executeBuy(
          { ...player, cash: currentCash, holdings: currentHoldings },
          stock,
          quantity,
          feeRate,
          turn
        );
        if (result.success && result.trade) {
          currentCash = result.cash;
          currentHoldings = result.holdings;
          actions.push({
            playerName: player.name,
            strategy: 'institution',
            action: 'buy',
            stockCode: stock.code,
            stockName: stock.name,
            quantity,
            amount: result.trade.totalAmount,
            reason: '소규모 테스트 매수합니다. 🏢',
          });
        }
      }
    }
  }

  return {
    updatedPlayer: { ...player, cash: currentCash, holdings: currentHoldings },
    actions,
  };
}

/** 가치투자자: 하락 매수, 상승 분할 매도 */
function valueStrategy(
  player: Player,
  stocks: Stock[],
  phase: MarketPhase,
  feeRate: number,
  turn: number
): { updatedPlayer: Player; actions: AIAction[] } {
  const actions: AIAction[] = [];
  let currentCash = player.cash;
  let currentHoldings = [...player.holdings];

  // 하락한 주식 찾기 (피크 대비 10% 이상 하락)
  const dippedStocks = stocks.filter((s) => getDrawdownFromPeak(s) > 0.1);

  // 매수: 하락한 주식이 있으면 매수 (디퍼)
  if (dippedStocks.length > 0 && chance(0.7)) {
    const target = dippedStocks[randomInt(dippedStocks.length)];
    const drawdown = getDrawdownFromPeak(target);
    // 하락폭이 클수록 더 많이 삼
    const intensity = Math.min(drawdown * 3, 0.4);
    const maxAffordable = Math.floor(currentCash / (target.currentPrice * (1 + feeRate)));
    const quantity = Math.min(
      Math.floor(maxAffordable * intensity),
      maxAffordable
    );
    if (quantity > 0) {
      const result = executeBuy(
        { ...player, cash: currentCash, holdings: currentHoldings },
        target,
        quantity,
        feeRate,
        turn
      );
      if (result.success && result.trade) {
        currentCash = result.cash;
        currentHoldings = result.holdings;
        actions.push({
          playerName: player.name,
          strategy: 'value',
          action: 'buy',
          stockCode: target.code,
          stockName: target.name,
          quantity,
          amount: result.trade.totalAmount,
          reason: `저평가 매수! ${Math.round(drawdown * 100)}% 하락했으니 기회입니다. 🔍`,
        });
      }
    }
  }

  // 매도: 크게 수익난 것만 일부 매도 (수익률 30% 이상)
  const profitableHoldings = currentHoldings
    .map((h) => {
      const stock = stocks.find((s) => s.code === h.stockCode)!;
      return { holding: h, stock, pnl: (stock.currentPrice - h.averagePrice) / h.averagePrice };
    })
    .filter((x) => x.pnl > 0.3);

  for (const { holding, stock } of profitableHoldings) {
    if (!chance(0.4)) continue;
    const sellQuantity = Math.floor(holding.quantity * 0.3);
    if (sellQuantity > 0) {
      const result = executeSell(
        { ...player, cash: currentCash, holdings: currentHoldings },
        stock,
        sellQuantity,
        feeRate,
        turn
      );
      if (result.success && result.trade) {
        currentCash = result.cash;
        currentHoldings = result.holdings;
        actions.push({
          playerName: player.name,
          strategy: 'value',
          action: 'sell',
          stockCode: stock.code,
          stockName: stock.name,
          quantity: sellQuantity,
          amount: result.trade.totalAmount,
          reason: `수익 실현! +${Math.round(((stock.currentPrice - holding.averagePrice) / holding.averagePrice) * 100)}%입니다. 🔍`,
        });
      }
    }
  }

  // 대부분 턴에서는 홀드 (아무 행동 없음)
  if (actions.length === 0) {
    actions.push({
      playerName: player.name,
      strategy: 'value',
      action: 'hold',
      stockCode: null,
      stockName: null,
      quantity: 0,
      amount: 0,
      reason: '가치 투자는 기다림이 핵심입니다. 🔍',
    });
  }

  return {
    updatedPlayer: { ...player, cash: currentCash, holdings: currentHoldings },
    actions,
  };
}

/** 나이스가이: 균형 잡힌 전략 */
function niceguyStrategy(
  player: Player,
  stocks: Stock[],
  phase: MarketPhase,
  feeRate: number,
  turn: number
): { updatedPlayer: Player; actions: AIAction[] } {
  const actions: AIAction[] = [];
  let currentCash = player.cash;
  let currentHoldings = [...player.holdings];

  const isBullish = phase === 'bull' || phase === 'recovery';
  const isBearish = phase === 'bear';

  // 포트폴리오 균형 확인
  const holdingsValue = getHoldingsValue({ ...player, holdings: currentHoldings }, stocks);
  const totalAssets = currentCash + holdingsValue;
  const cashRatio = totalAssets > 0 ? currentCash / totalAssets : 1;
  const holdingsRatio = totalAssets > 0 ? holdingsValue / totalAssets : 0;

  // 현금 비율이 너무 높으면 매수 (60% 이상 현금)
  if (cashRatio > 0.6 && chance(0.7)) {
    // 변동성이 적은 안전한 주식 우선
    const safeStocks = [...stocks].sort((a, b) => a.volatility - b.volatility);
    const target = safeStocks[randomRange(0, Math.min(3, safeStocks.length - 1))];
    const maxAffordable = Math.floor(currentCash / (target.currentPrice * (1 + feeRate)));
    const quantity = Math.min(
      Math.floor(maxAffordable * 0.15),
      maxAffordable
    );
    if (quantity > 0) {
      const result = executeBuy(
        { ...player, cash: currentCash, holdings: currentHoldings },
        target,
        quantity,
        feeRate,
        turn
      );
      if (result.success && result.trade) {
        currentCash = result.cash;
        currentHoldings = result.holdings;
        actions.push({
          playerName: player.name,
          strategy: 'niceguy',
          action: 'buy',
          stockCode: target.code,
          stockName: target.name,
          quantity,
          amount: result.trade.totalAmount,
          reason: '포트폴리오 균형을 맞추기 위해 매수합니다. 😊',
        });
      }
    }
  }

  // 상승장에서는 성장주 추가 매수
  if (isBullish && cashRatio > 0.3 && chance(0.5)) {
    const growthStocks = stocks.filter((s) => s.isHighGrowth);
    if (growthStocks.length > 0) {
      const target = growthStocks[randomInt(growthStocks.length)];
      const maxAffordable = Math.floor(currentCash / (target.currentPrice * (1 + feeRate)));
      const quantity = Math.min(Math.floor(maxAffordable * 0.1), maxAffordable);
      if (quantity > 0) {
        const result = executeBuy(
          { ...player, cash: currentCash, holdings: currentHoldings },
          target,
          quantity,
          feeRate,
          turn
        );
        if (result.success && result.trade) {
          currentCash = result.cash;
          currentHoldings = result.holdings;
          actions.push({
            playerName: player.name,
            strategy: 'niceguy',
            action: 'buy',
            stockCode: target.code,
            stockName: target.name,
            quantity,
            amount: result.trade.totalAmount,
            reason: '시장 상황이 좋아 성장주에 투자합니다. 😊',
          });
        }
      }
    }
  }

  // 하락장에서는 손실이 큰 것 일부 정리
  if (isBearish && holdingsRatio > 0.5 && chance(0.4)) {
    const lossmaking = currentHoldings
      .map((h) => {
        const stock = stocks.find((s) => s.code === h.stockCode)!;
        return { holding: h, stock, pnl: (stock.currentPrice - h.averagePrice) / h.averagePrice };
      })
      .filter((x) => x.pnl < -0.15);

    if (lossmaking.length > 0) {
      const { holding, stock } = lossmaking[randomInt(lossmaking.length)];
      const sellQuantity = Math.floor(holding.quantity * 0.4);
      if (sellQuantity > 0) {
        const result = executeSell(
          { ...player, cash: currentCash, holdings: currentHoldings },
          stock,
          sellQuantity,
          feeRate,
          turn
        );
        if (result.success && result.trade) {
          currentCash = result.cash;
          currentHoldings = result.holdings;
          actions.push({
            playerName: player.name,
            strategy: 'niceguy',
            action: 'sell',
            stockCode: stock.code,
            stockName: stock.name,
            quantity: sellQuantity,
            amount: result.trade.totalAmount,
            reason: '안전을 위해 일부 포지션을 정리합니다. 😊',
          });
        }
      }
    }
  }

  if (actions.length === 0) {
    actions.push({
      playerName: player.name,
      strategy: 'niceguy',
      action: 'hold',
      stockCode: null,
      stockName: null,
      quantity: 0,
      amount: 0,
      reason: '균형 잡힌 포트폴리오, 당분간 유지합니다. 😊',
    });
  }

  return {
    updatedPlayer: { ...player, cash: currentCash, holdings: currentHoldings },
    actions,
  };
}

// ----------------------------------------
// 메인: 모든 AI 플레이어 턴 실행
// ----------------------------------------

export function executeAITurns(
  players: Player[],
  stocks: Stock[],
  phase: MarketPhase,
  feeRate: number,
  turn: number
): { updatedPlayers: Player[]; actions: AIAction[] } {
  const allActions: AIAction[] = [];
  const updatedPlayers = [...players];

  for (let i = 0; i < updatedPlayers.length; i++) {
    const player = updatedPlayers[i];
    if (!player.isAI) continue;

    const strategy = player.strategy as AIStrategy;
    let result: { updatedPlayer: Player; actions: AIAction[] };

    switch (strategy) {
      case 'ant':
        result = antStrategy(player, stocks, phase, feeRate, turn);
        break;
      case 'institution':
        result = institutionStrategy(player, stocks, phase, feeRate, turn);
        break;
      case 'value':
        result = valueStrategy(player, stocks, phase, feeRate, turn);
        break;
      case 'niceguy':
        result = niceguyStrategy(player, stocks, phase, feeRate, turn);
        break;
    }

    updatedPlayers[i] = {
      ...result.updatedPlayer,
      tradeHistory: [...result.updatedPlayer.tradeHistory, ...(result.actions
        .map((a) => {
          if (a.action === 'hold') return undefined;
          return {
            turn,
            stockCode: a.stockCode || '',
            stockName: a.stockName || '',
            action: a.action as 'buy' | 'sell',
            quantity: a.quantity,
            pricePerShare:
              stocks.find((s) => s.code === a.stockCode)?.currentPrice || 0,
            totalAmount: a.amount,
            fee: 0,
          };
        })
        .filter(Boolean) as TradeRecord[])],
    };

    allActions.push(...result.actions);
  }

  return { updatedPlayers, actions: allActions };
}

// ----------------------------------------
// 순위 계산
// ----------------------------------------

export interface RankingEntry {
  name: string;
  isPlayer: boolean;
  totalAssets: number;
  cash: number;
  holdingsValue: number;
  returnRate: number;
  rank: number;
  emoji?: string;
}

export function calculateRankings(
  players: Player[],
  stocks: Stock[]
): RankingEntry[] {
  const rankings = players.map((player) => {
    const holdingsValue = getHoldingsValue(player, stocks);
    const totalAssets = player.cash + holdingsValue;
    const returnRate = ((totalAssets - player.startingCapital) / player.startingCapital) * 100;

    return {
      name: player.name,
      isPlayer: !player.isAI,
      totalAssets,
      cash: player.cash,
      holdingsValue,
      returnRate,
      rank: 0,
      emoji: player.isAI
        ? { ant: '🐜', institution: '🏢', value: '🔍', niceguy: '😊' }[player.strategy!]
        : '👤',
    };
  });

  // 총 자산 기준 정렬
  rankings.sort((a, b) => b.totalAssets - a.totalAssets);

  // 순위 부여 (동순위 처리)
  let currentRank = 1;
  for (let i = 0; i < rankings.length; i++) {
    if (i > 0 && rankings[i].totalAssets < rankings[i - 1].totalAssets) {
      currentRank = i + 1;
    }
    rankings[i].rank = currentRank;
  }

  return rankings;
}
