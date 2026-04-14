'use client';

import { RankingEntry } from '@/lib/types';

interface RankingBoardProps {
  rankings: RankingEntry[];
  previousRanks?: Record<string, number>;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR');
}

function formatReturn(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingBoard({ rankings, previousRanks }: RankingBoardProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-bold text-gray-300 tracking-wider">🏆 순위</h2>
      </div>
      <div className="divide-y divide-gray-800/50">
        {sorted.map((entry) => {
          const isPlayer = entry.isPlayer;
          const prevRank = previousRanks?.[entry.name];
          const rankChange = prevRank !== undefined ? prevRank - entry.rank : 0;

          return (
            <div
              key={entry.name}
              className={`px-4 py-2.5 transition-all duration-300 ${
                isPlayer
                  ? 'bg-yellow-900/15 border-l-2 border-yellow-500'
                  : 'border-l-2 border-transparent hover:bg-gray-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* 순위 */}
                <div className="w-8 text-center flex-shrink-0">
                  {entry.rank <= 3 ? (
                    <span className="text-lg">{MEDALS[entry.rank - 1]}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-500">{entry.rank}</span>
                  )}
                </div>

                {/* 순위 변동 */}
                <div className="w-5 text-center flex-shrink-0">
                  {rankChange > 0 && <span className="text-xs text-red-400">↑{rankChange}</span>}
                  {rankChange < 0 && <span className="text-xs text-blue-400">↓{Math.abs(rankChange)}</span>}
                  {rankChange === 0 && <span className="text-xs text-gray-600">-</span>}
                </div>

                {/* 이모지 + 이름 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{entry.emoji || '👤'}</span>
                    <span className={`text-xs font-bold truncate ${isPlayer ? 'text-yellow-400' : 'text-gray-200'}`}>
                      {entry.name}
                      {isPlayer && <span className="text-[10px] ml-1 text-yellow-500">(나)</span>}
                    </span>
                  </div>
                </div>

                {/* 총자산 */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono font-bold text-gray-200">
                    ₩{formatPrice(entry.totalAssets)}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold ${
                      entry.returnRate >= 0 ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {formatReturn(entry.returnRate)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
