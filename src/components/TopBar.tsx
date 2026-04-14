'use client';

import { Difficulty } from '@/lib/types';
import { DIFFICULTY_CONFIGS } from '@/lib/constants';

interface TopBarProps {
  difficulty: Difficulty;
  season: number;
  seasonTurn: number;
  turnsPerSeason: number;
  cash: number;
  totalAssets: number;
  startingCapital: number;
  achievementCount: number;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR');
}

export default function TopBar({
  difficulty,
  season,
  seasonTurn,
  turnsPerSeason,
  cash,
  totalAssets,
  startingCapital,
  achievementCount,
}: TopBarProps) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const returnRate = startingCapital > 0 ? ((totalAssets - startingCapital) / startingCapital) * 100 : 0;

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* 좌측: 시즌/턴 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">시즌</span>
            <span className="text-sm font-bold text-gray-200">{season}</span>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">턴</span>
            <span className="text-sm font-bold text-gray-200 font-mono">
              {seasonTurn}/{turnsPerSeason}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          {/* 난이도 배지 */}
          <div
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              difficulty === 'normal'
                ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                : difficulty === 'hard'
                ? 'bg-orange-900/30 text-orange-400 border border-orange-800/50'
                : 'bg-red-900/30 text-red-400 border border-red-800/50'
            }`}
          >
            {config.emoji} {config.label}
          </div>
        </div>

        {/* 우측: 자산 정보 */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-gray-500">현금</div>
            <div className="text-xs font-mono font-bold text-yellow-400">₩{formatPrice(cash)}</div>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="text-right">
            <div className="text-[10px] text-gray-500">총 자산</div>
            <div className="text-xs font-mono font-bold text-gray-100">₩{formatPrice(totalAssets)}</div>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="text-right">
            <div className="text-[10px] text-gray-500">수익률</div>
            <div className={`text-xs font-mono font-bold ${returnRate >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {returnRate >= 0 ? '+' : ''}{returnRate.toFixed(1)}%
            </div>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          {/* 업적 배지 */}
          <div className="relative">
            <div className="text-center">
              <div className="text-[10px] text-gray-500">업적</div>
              <div className="text-xs font-mono font-bold text-gray-300">{achievementCount}</div>
            </div>
            {achievementCount > 0 && (
              <div className="absolute -top-1 -right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-gray-900">{achievementCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
