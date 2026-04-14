// ========================================
// Stock Game - TypeScript Types
// ========================================

/** 주식 종목 */
export interface Stock {
  code: string;          // 종목코드
  name: string;          // 종목명
  sector: string;        // 섹터
  basePrice: number;     // 시작가
  currentPrice: number;  // 현재가
  previousPrice: number; // 직전가
  priceHistory: number[];// 가격 히스토리
  volatility: number;    // 변동성 (0~1)
  trend: number;         // 현재 추세 (-1~1)
  isCyclical: boolean;   // 경기주 여부
  isDefensive: boolean;  // 방어주 여부
  isHighGrowth: boolean; // 성장주 여부
}

/** 거래 기록 */
export interface TradeRecord {
  turn: number;
  stockCode: string;
  stockName: string;
  action: 'buy' | 'sell';
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  fee: number;
}

/** 포트폴리오 보유 종목 */
export interface Holding {
  stockCode: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
  totalCost: number;
}

/** 플레이어 */
export interface Player {
  name: string;
  cash: number;
  holdings: Holding[];
  tradeHistory: TradeRecord[];
  startingCapital: number;
  isAI: boolean;
  // AI 전략
  strategy?: AIStrategy;
  // 통계
  quizCorrect: number;
  quizTotal: number;
  consecutiveTopRank: number;
}

/** AI 전략 종류 */
export type AIStrategy = 'ant' | 'institution' | 'value' | 'niceguy';

/** AI 플레이어 설정 */
export interface AIPlayerConfig {
  name: string;
  strategy: AIStrategy;
  emoji: string;
  description: string;
}

/** 시장 국면 */
export type MarketPhase = 'bull' | 'consolidation' | 'bear' | 'recovery';

/** 시장 국면 정보 */
export interface MarketPhaseInfo {
  phase: MarketPhase;
  name: string;
  emoji: string;
  turnsRemaining: number;
  turnsInPhase: number;
  totalPhaseTurns: number;
}

/** 뉴스 이벤트 */
export interface NewsEvent {
  headline: string;
  description: string;
  effect: 'positive' | 'negative' | 'neutral';
  affectedStocks: string[];   // 종목코드 배열 (빈배열 = 전체)
  impactStrength: number;     // 0~1
  category: string;
}

/** 퀴즈 질문 */
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;       // 정답 인덱스 (0~3)
  explanation: string;
  difficulty: number;   // 1~3
  category: string;
}

/** 퀴즈 보너스 금액 (난이도별) */
export const QUIZ_BONUS: Record<number, number> = {
  1: 30_000,
  2: 50_000,
  3: 80_000,
};

/** 난이도 설정 */
export type Difficulty = 'normal' | 'hard' | 'expert';

export interface DifficultyConfig {
  label: string;
  emoji: string;
  startingCapital: number;
  feeRate: number;
  volatilityMultiplier: number;
}

/** 시즌 이벤트 */
export interface SeasonEvent {
  name: string;
  description: string;
  effect: string;       // 'volatility_up' | 'fee_discount' | 'bonus_cash' 등
  value: number;
}

/** 성과 등급 */
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

/** 시즌 결과 리포트 */
export interface SeasonReport {
  grade: Grade;
  totalAssets: number;
  returnRate: number;
  totalTrades: number;
  profitTrades: number;
  lossTrades: number;
  maxDrawdown: number;
  styleAnalysis: string;
  highlights: string[];
}

/** 업적 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (game: GameState) => boolean;
  unlocked: boolean;
}

/** 게임 상태 (전체) */
export interface GameState {
  difficulty: Difficulty;
  stocks: Stock[];
  players: Player[];
  currentPlayerIndex: number; // 실제 플레이어 인덱스
  marketPhase: MarketPhaseInfo;
  turn: number;
  season: number;
  seasonTurn: number;
  turnsPerSeason: number;
  currentNews: NewsEvent | null;
  currentQuiz: QuizQuestion | null;
  quizAnswered: boolean;
  quizCorrect: boolean;
  seasonEvents: SeasonEvent[];
  achievements: Achievement[];
  isGameOver: boolean;
  rankHistory: number[][];     // 매 턴별 순위 기록
}

/** 턴 결과 */
export interface TurnResult {
  news: NewsEvent | null;
  quiz: QuizQuestion | null;
  priceChanges: Record<string, number>; // stockCode -> 변동률
  aiActions: AIAction[];
  rankings: RankingEntry[];
}

/** AI 행동 기록 */
export interface AIAction {
  playerName: string;
  strategy: AIStrategy;
  action: 'buy' | 'sell' | 'hold';
  stockCode: string | null;
  stockName: string | null;
  quantity: number;
  amount: number;
  reason: string;
}

/** 순위 정보 */
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

/** 매매 결과 */
export interface TradeResult {
  success: boolean;
  message: string;
  trade?: TradeRecord;
  newCash: number;
  newHolding?: Holding;
}

/** 차트 데이터 포인트 */
export interface ChartDataPoint {
  turn: number;
  prices: Record<string, number>;
}
