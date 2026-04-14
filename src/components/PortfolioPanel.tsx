'use client';

import { Holding, Stock } from '@/lib/types';

interface PortfolioPanelProps {
  holdings: Holding[];
  stocks: Stock[];
  cash: number;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR');
}

function formatReturn(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
}

export default function PortfolioPanel({ holdings, stocks, cash }: PortfolioPanelProps) {
  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const stock = stocks.find((s) => s.code === h.stockCode);
    return sum + (stock ? stock.currentPrice * h.quantity : 0);
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalPnL = totalHoldingsValue - totalCost;
  const totalReturn = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const totalAssets = cash + totalHoldingsValue;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-bold text-gray-300 tracking-wider">💼 포트폴리오</h2>
      </div>

      {/* 요약 */}
      <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-800/50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">총 자산</span>
            <div className="text-sm font-bold text-gray-100 font-mono">₩{formatPrice(totalAssets)}</div>
          </div>
          <div>
            <span className="text-gray-500">보유현금</span>
            <div className="text-sm font-bold text-yellow-400 font-mono">₩{formatPrice(cash)}</div>
          </div>
          <div>
            <span className="text-gray-500">평가손익</span>
            <div className={`text-sm font-bold font-mono ${totalPnL >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {totalPnL >= 0 ? '+' : ''}₩{formatPrice(Math.abs(totalPnL))}
            </div>
          </div>
          <div>
            <span className="text-gray-500">수익률</span>
            <div className={`text-sm font-bold font-mono ${totalReturn >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {formatReturn(totalReturn)}
            </div>
          </div>
        </div>
      </div>

      {/* 보유 종목 */}
      <div className="divide-y divide-gray-800/50 max-h-[300px] overflow-y-auto">
        {holdings.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-600">보유한 종목이 없습니다</div>
        ) : (
          holdings.map((holding) => {
            const stock = stocks.find((s) => s.code === holding.stockCode);
            if (!stock) return null;

            const currentValue = stock.currentPrice * holding.quantity;
            const pnl = currentValue - holding.totalCost;
            const returnRate = holding.totalCost > 0 ? (pnl / holding.totalCost) * 100 : 0;

            return (
              <div key={holding.stockCode} className="px-4 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-bold text-gray-200">{holding.stockName}</span>
                    <span className="text-[10px] text-gray-500 ml-1.5">{holding.quantity}주</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-gray-200">₩{formatPrice(currentValue)}</div>
                    <div
                      className={`text-[10px] font-mono font-bold ${
                        returnRate >= 0 ? 'text-red-400' : 'text-blue-400'
                      }`}
                    >
                      {formatReturn(returnRate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>평균단가 ₩{formatPrice(holding.averagePrice)}</span>
                  <span>현재가 ₩{formatPrice(stock.currentPrice)}</span>
                </div>
                {/* 미니 진행바 */}
                <div className="mt-1 w-full bg-gray-800 rounded-full h-0.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      returnRate >= 0 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(2, 50 + returnRate))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
