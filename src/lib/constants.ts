// ========================================
// Stock Game - Constants
// ========================================

import type {
  DifficultyConfig,
  AIPlayerConfig,
  QuizQuestion,
  SeasonEvent,
  MarketPhase,
} from './types';

// ----------------------------------------
// 난이도 설정
// ----------------------------------------
export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  normal: {
    label: '일반',
    emoji: '😊',
    startingCapital: 100_000_000,
    feeRate: 0.00015,
    volatilityMultiplier: 1.0,
  },
  hard: {
    label: '어려움',
    emoji: '😰',
    startingCapital: 50_000_000,
    feeRate: 0.003,
    volatilityMultiplier: 1.0,
  },
  expert: {
    label: '전문가',
    emoji: '🔥',
    startingCapital: 30_000_000,
    feeRate: 0.005,
    volatilityMultiplier: 1.2,
  },
};

// ----------------------------------------
// 주식 종목 기본 데이터
// ----------------------------------------
export const STOCK_DEFS: Array<{
  code: string;
  name: string;
  sector: string;
  basePrice: number;
  volatility: number;
  isCyclical: boolean;
  isDefensive: boolean;
  isHighGrowth: boolean;
}> = [
  {
    code: 'SSCAR',
    name: '싱싱자동차',
    sector: '자동차',
    basePrice: 85_000,
    volatility: 0.7,
    isCyclical: true,
    isDefensive: false,
    isHighGrowth: false,
  },
  {
    code: 'ENK',
    name: '에너지K',
    sector: '배터리/에너지',
    basePrice: 400_000,
    volatility: 0.85,
    isCyclical: false,
    isDefensive: false,
    isHighGrowth: true,
  },
  {
    code: 'SMSE',
    name: '삼스전자',
    sector: '전자/반도체',
    basePrice: 70_000,
    volatility: 0.45,
    isCyclical: true,
    isDefensive: false,
    isHighGrowth: false,
  },
  {
    code: 'KKOT',
    name: '카카오트',
    sector: 'IT/플랫폼',
    basePrice: 45_000,
    volatility: 0.6,
    isCyclical: false,
    isDefensive: false,
    isHighGrowth: true,
  },
  {
    code: 'NVS',
    name: '네이버스',
    sector: 'IT/콘텐츠',
    basePrice: 180_000,
    volatility: 0.55,
    isCyclical: false,
    isDefensive: false,
    isHighGrowth: true,
  },
  {
    code: 'SKHX',
    name: 'SK하이닉스',
    sector: '반도체',
    basePrice: 150_000,
    volatility: 0.8,
    isCyclical: true,
    isDefensive: false,
    isHighGrowth: true,
  },
  {
    code: 'CELL',
    name: '셀트리온',
    sector: '바이오',
    basePrice: 190_000,
    volatility: 0.9,
    isCyclical: false,
    isDefensive: false,
    isHighGrowth: true,
  },
  {
    code: 'KBFG',
    name: 'KB금융',
    sector: '금융',
    basePrice: 55_000,
    volatility: 0.35,
    isCyclical: true,
    isDefensive: true,
    isHighGrowth: false,
  },
];

// ----------------------------------------
// 시장 국면 설정
// ----------------------------------------
export const MARKET_PHASE_CONFIG: Record<MarketPhase, {
  name: string;
  emoji: string;
  minTurns: number;
  maxTurns: number;
  volatilityMod: number;
  trendBias: number;
  positiveNewsWeight: number;
  negativeNewsWeight: number;
}> = {
  bull: {
    name: '상승장',
    emoji: '📈',
    minTurns: 8,
    maxTurns: 12,
    volatilityMod: 0.8,
    trendBias: 0.6,
    positiveNewsWeight: 0.65,
    negativeNewsWeight: 0.15,
  },
  consolidation: {
    name: '조정장',
    emoji: '➡️',
    minTurns: 8,
    maxTurns: 12,
    volatilityMod: 0.5,
    trendBias: 0.0,
    positiveNewsWeight: 0.35,
    negativeNewsWeight: 0.35,
  },
  bear: {
    name: '하락장',
    emoji: '📉',
    minTurns: 8,
    maxTurns: 12,
    volatilityMod: 1.0,
    trendBias: -0.6,
    positiveNewsWeight: 0.15,
    negativeNewsWeight: 0.65,
  },
  recovery: {
    name: '반등장',
    emoji: '🔄',
    minTurns: 8,
    maxTurns: 12,
    volatilityMod: 0.9,
    trendBias: 0.3,
    positiveNewsWeight: 0.5,
    negativeNewsWeight: 0.25,
  },
};

export const PHASE_ORDER: MarketPhase[] = ['bull', 'consolidation', 'bear', 'recovery'];

// ----------------------------------------
// 뉴스 이벤트 풀
// ----------------------------------------
export const NEWS_POOL: Array<{
  headline: string;
  description: string;
  effect: 'positive' | 'negative' | 'neutral';
  affectedStocks: string[];
  impactStrength: number;
  category: string;
  phases: MarketPhase[];
}> = [
  // 상승장 뉴스
  {
    headline: '정부, 반도체 산업 10조원 투자 발표',
    description: '정부가 차세대 반도체 R&D에 10조원을 투자하겠다고 발표했습니다.',
    effect: 'positive',
    affectedStocks: ['SMSE', 'SKHX'],
    impactStrength: 0.8,
    category: '정부정책',
    phases: ['bull', 'recovery'],
  },
  {
    headline: '전기차 수출 사상 최대 기록 달성',
    description: '싱싱자동차의 전기차 수출이 분기 사상 최대를 기록했습니다.',
    effect: 'positive',
    affectedStocks: ['SSCAR'],
    impactStrength: 0.7,
    category: '기업실적',
    phases: ['bull', 'recovery'],
  },
  {
    headline: '배터리 수주 급증, 에너지K 주가 상승',
    description: '에너지K가 글로벌 전기차 업체와 대규모 배터리 공급 계약을 체결했습니다.',
    effect: 'positive',
    affectedStocks: ['ENK'],
    impactStrength: 0.75,
    category: '기업실적',
    phases: ['bull', 'recovery'],
  },
  {
    headline: 'IT 플랫폼 사용자 1억명 돌파',
    description: '카카오트의 월간 활성 사용자가 처음으로 1억명을 돌파했습니다.',
    effect: 'positive',
    affectedStocks: ['KKOT'],
    impactStrength: 0.6,
    category: '기업실적',
    phases: ['bull', 'recovery'],
  },
  {
    headline: '네이버스 AI 기술 글로벌 1위',
    description: '네이버스의 자체 AI 모델이 글로벌 벤치마크에서 1위를 차지했습니다.',
    effect: 'positive',
    affectedStocks: ['NVS'],
    impactStrength: 0.7,
    category: '기술',
    phases: ['bull', 'recovery'],
  },
  {
    headline: '셀트리온 신약 FDA 승인',
    description: '셀트리온의 새로운 바이오의약품이 미국 FDA 승인을 받았습니다.',
    effect: 'positive',
    affectedStocks: ['CELL'],
    impactStrength: 0.85,
    category: '바이오',
    phases: ['bull', 'recovery'],
  },
  {
    headline: '코스피 3,000pt 돌파, 금융주 강세',
    description: '코스피가 3,000포인트를 돌파하며 금융주가 강하게 상승했습니다.',
    effect: 'positive',
    affectedStocks: ['KBFG'],
    impactStrength: 0.5,
    category: '시장동향',
    phases: ['bull'],
  },
  // 하락장 뉴스
  {
    headline: '미국 금리 인상, 글로벌 주가 하락',
    description: '미국 연준이 기준금리를 0.5%p 인상하며 글로벌 주식시장이 하락했습니다.',
    effect: 'negative',
    affectedStocks: [],
    impactStrength: 0.8,
    category: '금리',
    phases: ['bear', 'consolidation'],
  },
  {
    headline: '전기차 보조금 축소 발표',
    description: '정부가 전기차 구매 보조금을 30% 축소하겠다고 발표했습니다.',
    effect: 'negative',
    affectedStocks: ['SSCAR', 'ENK'],
    impactStrength: 0.65,
    category: '정부정책',
    phases: ['bear', 'consolidation'],
  },
  {
    headline: '반도체 가격 급락, 업계 우려',
    description: 'D램 가격이 전주 대비 15% 하락하며 반도체 업계에 우려가 커지고 있습니다.',
    effect: 'negative',
    affectedStocks: ['SMSE', 'SKHX'],
    impactStrength: 0.75,
    category: '시장동향',
    phases: ['bear', 'consolidation'],
  },
  {
    headline: '바이오 신약 임상 3상 실패',
    description: '셀트리온의 핵심 신약이 임상 3상에서 예상과 다른 결과를 보였습니다.',
    effect: 'negative',
    affectedStocks: ['CELL'],
    impactStrength: 0.9,
    category: '바이오',
    phases: ['bear', 'consolidation'],
  },
  {
    headline: 'IT 업계 규제 강화 예고',
    description: '정부가 플랫폼 IT 기업에 대한 규제 강화 방안을 발표했습니다.',
    effect: 'negative',
    affectedStocks: ['KKOT', 'NVS'],
    impactStrength: 0.55,
    category: '정부정책',
    phases: ['bear', 'consolidation'],
  },
  {
    headline: '원화 약세 지속, 수입물가 상승',
    description: '달러/원 환율이 1,400원을 돌파하며 수입물가 상승 우려가 커지고 있습니다.',
    effect: 'negative',
    affectedStocks: [],
    impactStrength: 0.5,
    category: '환율',
    phases: ['bear', 'consolidation'],
  },
  {
    headline: '은행 대출 부실 증가',
    description: '주택담보대출 연체율이 상승하며 금융권에 부담이 가중되고 있습니다.',
    effect: 'negative',
    affectedStocks: ['KBFG'],
    impactStrength: 0.5,
    category: '금융',
    phases: ['bear', 'consolidation'],
  },
  // 중립 뉴스
  {
    headline: '기업 실적 발표 시즌 시작',
    description: '다음 주부터 주요 기업들의 분기 실적 발표가 시작됩니다.',
    effect: 'neutral',
    affectedStocks: [],
    impactStrength: 0.3,
    category: '시장동향',
    phases: ['consolidation', 'bull', 'bear', 'recovery'],
  },
  {
    headline: '해외 기관 투자자 순매수 전환',
    description: '최근 외국인 투자자가 코스피 시장에서 순매수로 전환했습니다.',
    effect: 'neutral',
    affectedStocks: [],
    impactStrength: 0.35,
    category: '시장동향',
    phases: ['consolidation', 'recovery', 'bull'],
  },
  {
    headline: '신규 상장주 IPO 호조',
    description: '이번 달 예정된 IPO들이 높은 청약 경쟁률을 기록하고 있습니다.',
    effect: 'neutral',
    affectedStocks: [],
    impactStrength: 0.2,
    category: '시장동향',
    phases: ['bull', 'consolidation'],
  },
  // 반등장 뉴스
  {
    headline: '중앙은행 경기 부양책 시사',
    description: '한국은행 총재가 "필요시 추가 부양책을 검토하겠다"고 밝혔습니다.',
    effect: 'positive',
    affectedStocks: [],
    impactStrength: 0.6,
    category: '금리',
    phases: ['recovery'],
  },
  {
    headline: '기관투자자 대규모 매수 세력 등장',
    description: '연기금을 중심으로 대규모 매수가 이루어지며 시장 반등이 가속화되고 있습니다.',
    effect: 'positive',
    affectedStocks: [],
    impactStrength: 0.55,
    category: '시장동향',
    phases: ['recovery'],
  },
  {
    headline: '수출 데이터 3개월 만에 플러스 전환',
    description: '수출액이 전년 동월 대비 플러스 성장으로 전환되었습니다.',
    effect: 'positive',
    affectedStocks: ['SMSE', 'SKHX', 'SSCAR'],
    impactStrength: 0.6,
    category: '경제지표',
    phases: ['recovery', 'bull'],
  },
  {
    headline: '가계부채 관리 대책 발표',
    description: '정부가 가계부채 안정화를 위한 종합 대책을 발표했습니다.',
    effect: 'neutral',
    affectedStocks: ['KBFG'],
    impactStrength: 0.3,
    category: '정부정책',
    phases: ['consolidation', 'recovery'],
  },
  {
    headline: '글로벌 경기 회복 전망 상향',
    description: 'IMF가 한국 경제성장률 전망치를 기존보다 0.3%p 상향 조정했습니다.',
    effect: 'positive',
    affectedStocks: [],
    impactStrength: 0.5,
    category: '경제지표',
    phases: ['recovery', 'bull'],
  },
  {
    headline: '배당금 확대 기업 늘어나',
    description: '상장사들의 배당성향이 높아지며 배당투자 매력도가 높아지고 있습니다.',
    effect: 'positive',
    affectedStocks: ['KBFG', 'SMSE'],
    impactStrength: 0.4,
    category: '시장동향',
    phases: ['recovery', 'consolidation'],
  },
];

// ----------------------------------------
// 퀴즈 질문 풀 (30+개)
// ----------------------------------------
export const QUIZ_POOL: QuizQuestion[] = [
  {
    question: '주식 시장에서 "상장"이란 무엇을 의미하나요?',
    options: [
      '기업이 주식을 처음 발행하는 것',
      '기업의 주식을 거래소에 등록하여 누구나 사고팔 수 있게 하는 것',
      '기업이 다른 기업의 주식을 사는 것',
      '기업이 배당금을 지급하는 것',
    ],
    answer: 1,
    explanation: '상장이란 기업이 발행한 주식을 증권거래소에 등록하여 일반 투자자들이 자유롭게 매매할 수 있도록 하는 것입니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '"매매체결"이란 무엇인가요?',
    options: [
      '주식을 시장가로 사는 것',
      '사고자 하는 가격과 팔고자 하는 가격이 일치하여 거래가 성사되는 것',
      '주식을 장외에서 거래하는 것',
      '거래 수수료를 계산하는 것',
    ],
    answer: 1,
    explanation: '매매체결이란 매수호가와 매도호가가 일치하여 실제 거래가 이루어지는 것을 말합니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '배당금(Dividend)이란 무엇인가요?',
    options: [
      '주식을 살 때 내는 세금',
      '기업이 이익을 주주에게 분배하는 돈',
      '주식 가격 상승분의 10%',
      '거래소에 내는 수수료',
    ],
    answer: 1,
    explanation: '배당금은 기업이 번 이익 중 일부를 주주들에게 분배하는 것으로, 보통 분기별 또는 연간으로 지급됩니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '코스피(KOSPI) 지수는 무엇을 나타내나요?',
    options: [
      '한국의 환율 수준',
      '한국 증권거래소에 상장된 전체 주식의 가격 흐름',
      '외국인의 한국 주식 보유량',
      '한국의 국가 부채 규모',
    ],
    answer: 1,
    explanation: '코스피(Korea Composite Stock Price Index)는 한국거래소에 상장된 모든 보통주의 가격 변동을 종합하여 나타내는 지수입니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '"PBR(주가순자산비율)"이 1 미만인 경우 어떤 의미인가요?',
    options: [
      '기업이 무조건 좋다',
      '시장가치가 장부가치(자산가치)보다 낮아 저평가되었을 가능성이 있다',
      '배당을 안 한다',
      '곧 상장폐지된다',
    ],
    answer: 1,
    explanation: 'PBR이 1 미만이면 시장에서 기업의 가치를 자산가치보다 낮게 평가하고 있다는 뜻으로, 저평가됐을 가능성을 시사합니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: 'PER(주가수익비율)이 높으면 주로 어떤 의미인가요?',
    options: [
      '기업의 이익이 매우 크다',
      '주가가 이익에 비해 높게 평가되어 있어 고평가 우려가 있다',
      '배당률이 높다',
      '반드시 좋은 기업이다',
    ],
    answer: 1,
    explanation: 'PER이 높다는 것은 주가가 1주당 순이익에 비해 높게 거래되고 있다는 뜻으로, 높은 성장 기대치가 반영된 것이거나 고평가일 수 있습니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: '중앙은행이 기준금리를 낮추면 주식시장에는 어떤 영향이 있나요?',
    options: [
      '주식시장이 하락한다',
      '주식시장이 일반적으로 상승한다',
      '환율이 상승한다',
      '물가가 하락한다',
    ],
    answer: 1,
    explanation: '금리 인하는 차입 비용이 줄어 기업 투자가 활발해지고, 예금 금리가 낮아져 자금이 주식시장으로 유입되며 주가가 상승하는 경향이 있습니다.',
    difficulty: 2,
    category: '경제 지표',
  },
  {
    question: '"달러/원 환율"이 상승하면 어떤 효과가 있나요?',
    options: [
      '수출 기업에는 긍정적, 수입 기업에는 부정적',
      '모든 기업에 긍정적',
      '모든 기업에 부정적',
      '주식시장에 영향이 없다',
    ],
    answer: 0,
    explanation: '환율 상승(원화 약세)은 수출 기업의 경쟁력을 높여 긍정적이지만, 수입 원가가 증가해 수입 기업이나 내수 기업에는 부정적입니다.',
    difficulty: 2,
    category: '경제 지표',
  },
  {
    question: 'GDP(국내총생산)가 감소하면 경제는 어떤 상태인가요?',
    options: [
      '경제가 성장하고 있다',
      '경제가 위축되고 있다',
      '물가가 안정되고 있다',
      '실업률이 감소하고 있다',
    ],
    answer: 1,
    explanation: 'GDP 감소는 한 국가에서 일정 기간 생산된 재화와 서비스의 총량이 줄어든 것으로, 경제 위축(경기 침체)을 의미합니다.',
    difficulty: 1,
    category: '경제 지표',
  },
  {
    question: '"손절매"란 무엇인가요?',
    options: [
      '이익이 난 주식을 팔아 수익을 확정하는 것',
      '손실이 나고 있는 주식을 더 이상 손실이 커지지 않게 팔아버리는 것',
      '주식을 분할 매수하는 것',
      '배당을 받기 위해 보유하는 것',
    ],
    answer: 1,
    explanation: '손절매는 손실이 발생한 주식을 보유하다가 더 큰 손실을 막기 위해 팔아버리는 투자 기법입니다.',
    difficulty: 1,
    category: '투자 심리',
  },
  {
    question: '"묻지마 따매"라는 말의 의미는?',
    options: [
      '신중하게 분석 후 매수하는 것',
      '이유 없이 무작정 주식을 사는 행위',
      '기업의 재무제표를 분석하는 것',
      '배당주만 사는 것',
    ],
    answer: 1,
    explanation: '묻지마 따매는 충분한 분석 없이 주변의 소문이나 유행에 따라 무작정 주식을 사는 행위로, 위험한 투자 방식입니다.',
    difficulty: 1,
    category: '투자 심리',
  },
  {
    question: '"FOMO(Fear Of Missing Out)" 현상이란?',
    options: [
      '주가가 올라서 무서워서 파는 것',
      '남들이 수익을 내는 것 같아서 조급하게 따라 사는 심리',
      '손실이 나서 겁이 나서 못 파는 것',
      '주식 시장에서 완전히 떠나는 것',
    ],
    answer: 1,
    explanation: 'FOMO는 "소외되는 것에 대한 두려움"으로, 남들이 다 수익을 내는 것 같아 자신도 뒤처지지 않으려고 조급하게 매수하는 비합리적 심리입니다.',
    difficulty: 2,
    category: '투자 심리',
  },
  {
    question: '"로스 커팅(Loss Cutting)"과 관련된 올바른 설명은?',
    options: [
      '항상 손실을 보면 즉시 팔아야 한다',
      '적절한 손실 한도를 설정하고 그 이상은 인정하고 자르는 전략',
      '배당으로 손실을 메우는 것',
      '주식을 더 사서 평균 단가를 낮추는 것',
    ],
    answer: 1,
    explanation: '로스 커팅은 손실이 일정 수준 이상 커지기 전에 자신의 잘못을 인정하고 손실을 확정하는 전략으로, 자금 관리의 핵심입니다.',
    difficulty: 2,
    category: '투자 심리',
  },
  {
    question: '"상한가"와 "하한가"는 각각 몇 % 인가요?',
    options: [
      '20% / 20%',
      '30% / 30%',
      '15% / 15%',
      '10% / 10%',
    ],
    answer: 1,
    explanation: '코스피 시장에서 주가는 전일 종가 기준으로 ±30%까지만 상승/하락할 수 있습니다. 이를 상한가/하한가라고 합니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '시가총액이 가장 큰 기업이 코스피 지수에 미치는 영향은?',
    options: [
      '거의 영향이 없다',
      '가장 큰 영향을 미친다',
      '모든 기업이 동일한 영향을 미친다',
      '배당을 많이 하는 기업만 영향이 있다',
    ],
    answer: 1,
    explanation: '코스피는 시가총액 가중지수이므로, 시가총액이 큰 기업(삼성전자 등)의 주가 변동이 지수에 더 큰 영향을 미칩니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: '"EPS(주당순이익)"이 높을수록 어떤 의미인가요?',
    options: [
      '주가가 항상 비싸다',
      '주식 1주당 창출한 이익이 많다',
      '배당을 항상 많이 준다',
      '부채가 적다',
    ],
    answer: 1,
    explanation: 'EPS는 순이익을 발행 주식 수로 나눈 값으로, 1주당 얼마의 이익을 창출했는지를 나타냅니다. EPS가 높을수록 기업의 수익성이 좋다는 의미입니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: '"유동성"이 높은 주식의 특징은?',
    options: [
      '거래량이 적고 사고팔기 어렵다',
      '거래량이 많고 원할 때 사고팔기 쉽다',
      '주가가 항상 상승한다',
      '배당률이 높다',
    ],
    answer: 1,
    explanation: '유동성이 높은 주식은 거래량이 많아 원할 때 원하는 가격에 매매할 수 있습니다. 보통 대형 우량주가 유동성이 높습니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '"보유비중"이 과도하게 높을 때의 위험은?',
    options: [
      '세금이 많이 붙는다',
      '특정 종목이 하락하면 전체 포트폴리오에 큰 타격',
      '배당을 못 받는다',
      '거래를 할 수 없다',
    ],
    answer: 1,
    explanation: '한 종목에 투자 비중이 너무 높으면, 해당 종목의 부진이 전체 포트폴리오에 치명적인 손실을 입힐 수 있어 분산투자가 중요합니다.',
    difficulty: 1,
    category: '투자 심리',
  },
  {
    question: '"분할매수"의 장점은?',
    options: [
      '한 번에 큰 수익을 얻을 수 있다',
      '매수 시점을 분산하여 평균 단가를 낮출 수 있다',
      '수수료가 면제된다',
      '세금 혜택이 있다',
    ],
    answer: 1,
    explanation: '분할매수는 전액을 한 번에 투자하지 않고 여러 번에 나누어 매수하는 방법으로, 매수 시점의 리스크를 분산시키고 평균 단가를 안정화할 수 있습니다.',
    difficulty: 2,
    category: '투자 심리',
  },
  {
    question: '"디플레이션"이 발생하면 어떤 일이 일어나나요?',
    options: [
      '물가가 지속적으로 상승한다',
      '물가가 지속적으로 하락한다',
      '주가만 하락한다',
    ],
    answer: 1,
    explanation: '디플레이션은 물가가 지속적으로 하락하는 현상으로, 소비 위축과 기업 수익 감소를 유발해 경제 전체에 부정적인 영향을 미칩니다.',
    difficulty: 2,
    category: '경제 지표',
  },
  {
    question: '"IPO(기업공개)"란 무엇인가요?',
    options: [
      '기업이 주식을 상장하여 처음으로 대중에게 공개하는 것',
      '기업이 주식을 전부 사들이는 것',
      '기업이 파산하는 것',
      '기업이 합병하는 것',
    ],
    answer: 0,
    explanation: 'IPO(Initial Public Offering)는 비상장 기업이 증권거래소에 주식을 상장하여 일반 투자자에게 처음으로 주식을 공개 매도하는 것입니다.',
    difficulty: 1,
    category: '주식 용어',
  },
  {
    question: '"양봉"과 "음봉"의 차이는?',
    options: [
      '양봉은 시가가 종가보다 높고, 음봉은 반대',
      '양봉은 종가가 시가보다 높고(상승), 음봉은 종가가 시가보다 낮음(하락)',
      '양봉은 거래량이 많고, 음봉은 적다',
      '양봉은 외국인이 산 것이고, 음봉은 개인이 산 것이다',
    ],
    answer: 1,
    explanation: '캔들스틱 차트에서 양봉(빨간색)은 종가가 시가보다 높은 상승봉, 음봉(파란색)은 종가가 시가보다 낮은 하락봉을 의미합니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: '"소형주 효과"란 무엇인가요?',
    options: [
      '작은 기업일수록 항상 수익이 난다',
      '시가총액이 작은 소형주가 대형주보다 장기적으로 높은 수익률을 보이는 경향',
      '주식을 조금만 사도 큰 수익이 난다',
      '거래량이 적은 주식이 좋다',
    ],
    answer: 1,
    explanation: '소형주 효과는 시가총액이 작은 기업들이 대형주보다 장기적으로 더 높은 수익률을 보이는 현상으로, 학술적으로도 입증된 투자 전략입니다.',
    difficulty: 3,
    category: '주식 용어',
  },
  {
    question: '"카피트레이딩"이란 무엇인가요?',
    options: [
      '주식을 복사해서 여러 계좌에 넣는 것',
      '성공한 투자자의 매매를 자동으로 따라 하는 것',
      '주식 시세를 복사해서 분석하는 것',
      '다른 사람의 비밀번호로 거래하는 것',
    ],
    answer: 1,
    explanation: '카피트레이딩은 다른 (성공적인) 투자자의 매매 기록을 자동으로 자신의 계좌에 복사하여 따라 거래하는 방식입니다.',
    difficulty: 1,
    category: '투자 심리',
  },
  {
    question: '"마진콜(Margin Call)"이 발생하는 이유는?',
    options: [
      '수익이 너무 커서',
      '신용 거래로 주식을 샀는데 가격이 하락하여 유지비율이 기준 이하로 떨어져서',
      '거래량이 너무 적어서',
      '배당금을 못 받아서',
    ],
    answer: 1,
    explanation: '마진콜은 신용융자로 주식을 매수한 후 주가가 하락해 담보 가치가 부족해지면 증권사가 추가 증거금을 요구하는 것입니다.',
    difficulty: 3,
    category: '주식 용어',
  },
  {
    question: '"베타(Beta) 계수"가 1.5인 주식은?',
    options: [
      '시장보다 50% 더 위험하다',
      '시장이 1% 움직이면 1.5% 움직인다',
      '항상 상승한다',
      '배당률이 1.5%다',
    ],
    answer: 1,
    explanation: '베타 계수는 시장 대비 주식의 민감도를 나타냅니다. 베타 1.5는 시장이 1% 상승하면 1.5% 상승하고, 1% 하락하면 1.5% 하락하는 변동성이 큰 주식입니다.',
    difficulty: 3,
    category: '주식 용어',
  },
  {
    question: '"어닝 서프라이즈"란?',
    options: [
      '기업이 예상보다 적은 이익을 냈을 때',
      '기업이 시장 예상치를 크게 상회하는 실적을 발표했을 때',
      '기업이 배당을 발표했을 때',
      '기업이 신제품을 출시했을 때',
    ],
    answer: 1,
    explanation: '어닝 서프라이즈는 기업이 발표한 실적이 시장 애널리스트들의 예상치를 상회하는 것으로, 주로 주가 상승의 원인이 됩니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: '다음 중 방어주에 해당하지 않는 것은?',
    options: [
      '공공요금 관련 주식',
      '식품/제약 관련 주식',
      '자동차 관련 주식',
      '금융 관련 주식',
    ],
    answer: 2,
    explanation: '방어주는 경기 침체 시에도 수요가 안정적인 업종의 주식입니다. 자동차는 경기에 민감한 경기주(순환주)이므로 방어주가 아닙니다.',
    difficulty: 2,
    category: '주식 용어',
  },
  {
    question: '"동적 자산 배분"이란?',
    options: [
      '항상 같은 비율로 투자하는 것',
      '시장 상황에 따라 주식/채권 등 자산 비율을 조정하는 것',
      '주식만 계속 사는 것',
      '현금만 보유하는 것',
    ],
    answer: 1,
    explanation: '동적 자산 배분은 시장 상황(경기, 금리 등)에 따라 주식, 채권, 현금 등의 투자 비율을 탄력적으로 조정하는 전략입니다.',
    difficulty: 3,
    category: '투자 심리',
  },
  {
    question: '"거시경제 지표"가 아닌 것은?',
    options: [
      'GDP 성장률',
      '소비자물가지수(CPI)',
      '특정 기업의 PER',
      '실업률',
    ],
    answer: 2,
    explanation: 'GDP, CPI, 실업률 등은 국가 전체의 경제 상황을 나타내는 거시경제 지표입니다. 특정 기업의 PER은 해당 기업의 개별 지표입니다.',
    difficulty: 1,
    category: '경제 지표',
  },
];

// ----------------------------------------
// AI 플레이어 설정
// ----------------------------------------
export const AI_PLAYER_CONFIGS: AIPlayerConfig[] = [
  {
    name: '개미투자자',
    strategy: 'ant',
    emoji: '🐜',
    description: '감정에 따라 무작위로 매매하는 소액 개인 투자자',
  },
  {
    name: '기관투자자',
    strategy: 'institution',
    emoji: '🏢',
    description: '추세를 따라 대규모로 거래하는 전문 기관',
  },
  {
    name: '가치투자자',
    strategy: 'value',
    emoji: '🔍',
    description: '저평가된 주식을 찾아 장기 투자하는 가치 투자자',
  },
  {
    name: '나이스가이',
    strategy: 'niceguy',
    emoji: '😊',
    description: '균형 잡힌 전략으로 안정적으로 투자하는 투자자',
  },
];

// ----------------------------------------
// 시즌 이벤트 풀
// ----------------------------------------
export const SEASON_EVENT_POOL: SeasonEvent[] = [
  {
    name: '배당락일 시즌',
    description: '이번 시즌은 배당락일이 집중되어 있습니다.',
    effect: 'dividend_season',
    value: 0.05,
  },
  {
    name: '실적 발표 시즌',
    description: '분기 실적 발표가 집중되는 시즌입니다.',
    effect: 'earnings_season',
    value: 0.15,
  },
  {
    name: '해외 경제 위기',
    description: '글로벌 경제 위기 소식으로 변동성이 커졌습니다.',
    effect: 'volatility_up',
    value: 0.25,
  },
  {
    name: '정부 경제 부양책',
    description: '정부의 적극적인 경제 부양책이 시행됩니다.',
    effect: 'fee_discount',
    value: 0.5,
  },
  {
    name: '특별 보너스',
    description: '이벤트 보너스로 현금이 지급됩니다!',
    effect: 'bonus_cash',
    value: 5_000_000,
  },
  {
    name: '거래소 시스템 점검',
    description: '거래소 시스템 점검으로 거래 수수료가 일시 할인됩니다.',
    effect: 'fee_discount',
    value: 0.3,
  },
  {
    name: '신규 테마주 열풍',
    description: '특정 섹터에 투자 열풍이 불고 있습니다.',
    effect: 'theme_boost',
    value: 0.2,
  },
];

// ----------------------------------------
// 성과 등급 기준
// ----------------------------------------
export const GRADE_THRESHOLDS: Array<{ grade: string; minReturn: number; maxReturn: number; label: string }> = [
  { grade: 'S', minReturn: 30, maxReturn: Infinity, label: '투자의 신' },
  { grade: 'A', minReturn: 15, maxReturn: 30, label: '숙련된 투자자' },
  { grade: 'B', minReturn: 0, maxReturn: 15, label: '안정적 투자자' },
  { grade: 'C', minReturn: -15, maxReturn: 0, label: '초보 투자자' },
  { grade: 'D', minReturn: -Infinity, maxReturn: -15, label: '갈 길이 멀다' },
];

// ----------------------------------------
// 게임 설정 상수
// ----------------------------------------
export const TURNS_PER_SEASON = 30;
export const QUIZ_APPEAR_CHANCE = 0.4;
export const MAX_STOCK_CHANGE_PERCENT = 0.30; // 하한가/상한가 30%
export const PRICE_DECIMAL_PLACES = 0;

// ----------------------------------------
// 스타일 분석 템플릿
// ----------------------------------------
export const STYLE_TEMPLATES: Array<{
  condition: string;
  minTrades: number;
  maxTrades: number;
  style: string;
  description: string;
}> = [
  {
    condition: 'high_frequency',
    minTrades: 30,
    maxTrades: Infinity,
    style: '단기 매매형',
    description: '자주 거래하며 단기 수익을 노리는 적극적인 투자 스타일입니다.',
  },
  {
    condition: 'buy_and_hold',
    minTrades: 0,
    maxTrades: 10,
    style: '장기 보유형',
    description: '적게 거래하며 장기 투자를 선호하는 안정적인 스타일입니다.',
  },
  {
    condition: 'moderate',
    minTrades: 10,
    maxTrades: 30,
    style: '균형 투자형',
    description: '적절한 타이밍에 거래하며 균형 잡힌 투자를 하는 스타일입니다.',
  },
];
