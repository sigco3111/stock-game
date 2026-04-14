'use client';

import { useState, useEffect } from 'react';
import { NewsEvent, Stock } from '@/lib/types';

interface NewsCardProps {
  news: NewsEvent | null;
  stocks: Stock[];
}

function getStockName(code: string, stocks: Stock[]): string {
  return stocks.find((s) => s.code === code)?.name || code;
}

export default function NewsCard({ news, stocks }: NewsCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (news) {
      setFlipped(false);
      const timer = setTimeout(() => setFlipped(true), 600);
      return () => clearTimeout(timer);
    }
  }, [news]);

  if (!news) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[180px]">
        <div className="text-3xl mb-2 opacity-30">📰</div>
        <p className="text-sm text-gray-600">새로운 뉴스를 기다리는 중...</p>
      </div>
    );
  }

  const effectConfig = {
    positive: { label: '긍정적', color: 'text-red-400', glow: 'shadow-red-500/20', bg: 'bg-red-950/30', border: 'border-red-800/50', icon: '📈' },
    negative: { label: '부정적', color: 'text-blue-400', glow: 'shadow-blue-500/20', bg: 'bg-blue-950/30', border: 'border-blue-800/50', icon: '📉' },
    neutral: { label: '중립', color: 'text-gray-400', glow: 'shadow-gray-500/10', bg: 'bg-gray-800/30', border: 'border-gray-700/50', icon: '➡️' },
  };

  const cfg = effectConfig[news.effect];

  return (
    <div
      className={`relative bg-gray-900 rounded-xl border ${cfg.border} overflow-hidden shadow-lg ${cfg.glow} transition-all duration-500`}
    >
      {/* 상단 효과 뱃지 */}
      <div className={`px-4 py-2 ${cfg.bg} border-b ${cfg.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{cfg.icon}</span>
            <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-gray-800">{news.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">영향도</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-3 rounded-full ${
                    i <= Math.round(news.impactStrength * 5)
                      ? news.effect === 'positive'
                        ? 'bg-red-400'
                        : news.effect === 'negative'
                        ? 'bg-blue-400'
                        : 'bg-gray-500'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 뉴스 내용 (플립 애니메이션) */}
      <div className="p-4">
        <div
          className={`transition-all duration-500 ${
            flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h3 className="text-sm font-bold text-gray-100 mb-2 leading-snug">{news.headline}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{news.description}</p>
        </div>

        {/* 영향받는 종목 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {news.affectedStocks.length === 0 ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              전 종목 영향
            </span>
          ) : (
            news.affectedStocks.map((code) => (
              <span
                key={code}
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  news.effect === 'positive'
                    ? 'bg-red-900/30 text-red-300'
                    : news.effect === 'negative'
                    ? 'bg-blue-900/30 text-blue-300'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {getStockName(code, stocks)}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
