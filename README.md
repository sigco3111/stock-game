<div align="center">

# 📈📉 오르락 내리락

**한국 주식 시뮬레이션 웹 게임**

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://stock-game-three.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[**🎮 게임 플레이하기**](https://stock-game-three.vercel.app)

</div>

---

## 📖 소개

**오르락 내리락**은 한국 주식 시장을 시뮬레이션한 웹 기반 주식 게임입니다. 한국 거래소(KRX)에서 운영하는 어린이 주식 교육 게임에서 영감을 받아, 더 깊이 있고 전략적인 게임 경험을 제공합니다.

AI 투자자들과 경쟁하며 순위표를 올려가고, 주식 퀴즈를 풀어 보너스를 획득하세요!

## 🎮 게임 특징

### 📊 시장 사이클 시스템
- **상승장** 📈 — 호재 70%, 주가 상승폭이 큼
- **조정장** ⚖️ — 호악재 50:50, 변동폭이 작음
- **하락장** 📉 — 악재 70%, 주가 하락폭이 큼
- **반등장** 🔄 — 호재 60%, 일부 종목 급등

### 🏢 8개 파로디 기업

| 종목 | 모델 | 섹터 | 특징 |
|------|------|------|------|
| 싱싱자동차 | Tesla | 자동차 | 경기 민감형 |
| 에너지K | LG에너지솔루션 | 2차전지 | 높은 변동성 |
| 삼스전자 | 삼성전자 | 대형주 | 안정적 |
| 카카오트 | 카카오 | IT | 중간 변동성 |
| 네이버스 | NAVER | IT | 성장주 |
| SK하이닉스 | SK하이닉스 | 반도체 | 높은 변동성 |
| 셀트리온 | 셀트리온 | 바이오 | 높은 변동성 |
| KB금융 | KB금융 | 금융 | 방어주 |

### 🧠 퀴즈 모드
- 턴마다 40% 확률로 주식/경제 퀴즈 출제
- 주식 용어 (상장, 매매체결, 배당, 코스피 등)
- 경제 지표 (금리, 환율, GDP 등)
- 투자 심리 (공포 탐욕 지수, 엔젤 투자자 등)
- 정답 시 보너스 자금 (난이도별 ₩30,000 ~ ₩80,000)

### 🤖 AI 투자자 순위표
4명의 AI 투자자와 실시간 경쟁!

| AI | 전략 | 특징 |
|----|------|------|
| 🐜 개미투자자 | 랜덤 | 소액 거래, 감정적 매매 |
| 🏦 기관투자자 | 트렌드 추종 | 대량 거래, 추세 확인 후 진입 |
| 📊 가치투자자 | 가치 투자 | 하락 시 매수, 장기 보유 |
| 😎 나이스가이 | 균형 | 적절한 비율 관리 |

매 턴마다 순위 갱신, 🥇🥈🥉 메달 표시

### 📅 시즌제
- 1시즌 = 30턴 (게임 내 1년)
- 시즌 종료 시 **리포트 카드**: 총 자산, 수익률, 거래 횟수, 최대 낙폭, 투자 스타일 분석, **S/A/B/C/D 등급**
- 자산 누적 이어서 진행

### 🎲 시즌 이벤트
- 🔋 반도체 호황 / 📈 금리 인상 / 💊 바이오 붐
- 🚗 전기차 수요 급증 / 💥 IT 버블 붕괴 / 🏛️ 정부 규제 강화
- 🌍 글로벌 경제 회복 / 🛢️ 원유 가격 급등

### 🎯 난이도

| 난이도 | 초기 자본 | 거래 수수료 | 특수 효과 |
|--------|----------|------------|----------|
| 일반 | ₩1억 | 0.015% | — |
| 어려움 | ₩5천만 | 0.3% | — |
| 전문가 | ₩3천만 | 0.5% | 변동성 +20% |

### 🏆 업적 시스템 (10종)

| 업적 | 조건 |
|------|------|
| 🤝 첫 거래 | 첫 매수/매도 완료 |
| 💰 백만장자 | 총 자산 ₩2억 달성 |
| 💀 파산 | 총 자산 ₩1천만 이하 |
| ⚡ 단기 수익왕 | 단일 거래 50% 이상 수익 |
| 📦 가치 투자자 | 한 종목 20턴 이상 보유 |
| 🎰 모험가 | 1턴에 전재산 매수 |
| 🥇 시즌 S등급 | 시즌 S등급 달성 |
| 🏅 10시즌 생존 | 10시즌 완주 |
| 🧠 퀴즈 달인 | 퀴즈 10문제 정답 |
| 👑 AI 이기기 | 5연속 1위 달성 |

### 🖥️ UI/UX
- 🌙 **다크 모드** 기본
- 🔴 빨간불 = 상승 / 🔵 파란불 = 하락 (한국 주식 컨벤션)
- 📱 모바일 반응형 지원
- 📊 Canvas 기반 실시간 주가 차트
- ⚡ 빠른 매수/매도 (전량, 50%, 25%, 10%, 고정 수량)
- 💾 localStorage 자동 저장

---

## 💡 아이디어 출처

이 게임은 **[황비홍비](https://www.youtube.com/@황비홍비)** 님의 유튜브 영상에서 영감을 받았습니다.

> 📺 [주식 버튜버가 어린이용 주식 게임을 해 본다면? 오르락 내리락 주식 게임](https://youtu.be/4YDwclrb2JQ)

황비홍비 님이 한국 거래소(KRX) 어린이용 주식 교육 게임 "오르락 내리락"을 플레이하는 영상을 보고, 이를 심화된 전략 웹 게임으로 발전시켰습니다.

**원본 게임:** [한국거래소 어린이 금융교육](https://www.krx.co.kr)

---

## 🛠️ 기술 스택

| 기술 | 용도 |
|------|------|
| **Next.js 14** (App Router) | React 프레임워크 |
| **TypeScript** | 타입 안전성 |
| **Tailwind CSS** | 스타일링 |
| **Canvas API** | 주가 차트 |
| **localStorage** | 게임 상태 저장 |
| **Vercel** | 배포 |

## 🚀 배포

👉 **[게임 플레이하기](https://stock-game-three.vercel.app)**

## 📁 프로젝트 구조

```
stock-game/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 메인 게임 페이지
│   │   └── globals.css       # 글로벌 스타일
│   ├── components/
│   │   ├── GameBoard.tsx     # 메인 게임 레이아웃
│   │   ├── TopBar.tsx        # 상단 정보바
│   │   ├── StockList.tsx     # 종목 목록
│   │   ├── TradingPanel.tsx  # 매수/매도 패널
│   │   ├── NewsCard.tsx      # 뉴스 카드
│   │   ├── QuizModal.tsx     # 퀴즈 모달
│   │   ├── RankingBoard.tsx  # AI 순위표
│   │   ├── PriceChart.tsx    # 주가 차트
│   │   ├── PortfolioPanel.tsx # 포트폴리오
│   │   ├── SeasonReport.tsx  # 시즌 리포트
│   │   ├── MarketPhaseBanner.tsx # 시장 국면 배너
│   │   └── AchievementToast.tsx  # 업적 알림
│   └── lib/
│       ├── types.ts          # TypeScript 타입
│       ├── constants.ts      # 게임 상수
│       ├── game-engine.ts    # 게임 엔진
│       ├── ai-players.ts     # AI 플레이어 로직
│       └── storage.ts        # 저장/로드
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 📜 라이선스

MIT License

---

<div align="center">

**주식 투자를 가볍게 배워보고 싶다면 지금 바로 시작하세요!** 🚀

[🎮 게임 플레이하기](https://stock-game-three.vercel.app)

</div>
