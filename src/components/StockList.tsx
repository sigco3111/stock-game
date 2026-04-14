'use client';

import { Stock } from '@/lib/types';

interface StockListProps {
  stocks: Stock[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

function formatPercent(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function MiniSparkline({ history, isUp }: { history: number[]; isUp: boolean }) {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const points = history
    .slice(-20)
    .map((p, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  const color = isUp ? '#ef4444' : '#3b82f6';

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StockList({ stocks, selectedCode, onSelect }: StockListProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-bold text-gray-300 tracking-wider">📊 종목 목록</h2>
      </div>
      <div className="divide-y divide-gray-800/50 max-h-[480px] overflow-y-auto">
        {stocks.map((stock) => {
          const change =
            stock.previousPrice > 0
              ? ((stock.currentPrice - stock.previousPrice) / stock.previousPrice) * 100
              : 0;
          const isUp = change >= 0;
          const isSelected = selectedCode === stock.code;

          return (
            <button
              key={stock.code}
              onClick={() => onSelect(stock.code)}
              className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-gray-800/60 ${
                isSelected
                  ? 'bg-gray-800 border-l-2 border-yellow-500'
                  : 'border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-100 truncate">{stock.name}</span>
                    <span className="text-xs text-gray-500">{stock.code}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-500">{stock.sector}</span>
                    {stock.isHighGrowth && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-purple-900/50 text-purple-300">
                        성장
                      </span>
                    )}
                    {stock.isDefensive && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-green-900/50 text-green-300">
                        방어
                      </span>
                    )}
                    {stock.isCyclical && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-orange-900/50 text-orange-300">
                        경기
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-mono font-bold text-gray-100">
                    ₩{formatPrice(stock.currentPrice)}
                  </div>
                  <div className={`text-xs font-mono font-bold ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
                    {formatPercent(change)}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <MiniSparkline history={stock.priceHistory} isUp={isUp} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
