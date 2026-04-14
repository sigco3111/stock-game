'use client';

import { MarketPhaseInfo, MarketPhase } from '@/lib/types';

interface MarketPhaseBannerProps {
  phaseInfo: MarketPhaseInfo;
}

const PHASE_STYLES: Record<MarketPhase, { bg: string; border: string; text: string; bar: string; barBg: string }> = {
  bull: {
    bg: 'bg-gradient-to-r from-red-950/40 to-gray-900',
    border: 'border-red-800/50',
    text: 'text-red-400',
    bar: 'bg-red-500',
    barBg: 'bg-red-900/30',
  },
  consolidation: {
    bg: 'bg-gradient-to-r from-yellow-950/30 to-gray-900',
    border: 'border-yellow-800/40',
    text: 'text-yellow-400',
    bar: 'bg-yellow-500',
    barBg: 'bg-yellow-900/30',
  },
  bear: {
    bg: 'bg-gradient-to-r from-blue-950/40 to-gray-900',
    border: 'border-blue-800/50',
    text: 'text-blue-400',
    bar: 'bg-blue-500',
    barBg: 'bg-blue-900/30',
  },
  recovery: {
    bg: 'bg-gradient-to-r from-orange-950/30 to-gray-900',
    border: 'border-orange-800/40',
    text: 'text-orange-400',
    bar: 'bg-orange-500',
    barBg: 'bg-orange-900/30',
  },
};

export default function MarketPhaseBanner({ phaseInfo }: MarketPhaseBannerProps) {
  const style = PHASE_STYLES[phaseInfo.phase];
  const progress = phaseInfo.totalPhaseTurns > 0
    ? ((phaseInfo.totalPhaseTurns - phaseInfo.turnsRemaining) / phaseInfo.totalPhaseTurns) * 100
    : 0;

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-xl px-4 py-3 transition-all duration-700`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">{phaseInfo.emoji}</span>
          <div>
            <span className={`text-sm font-bold ${style.text}`}>{phaseInfo.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {phaseInfo.turnsInPhase}/{phaseInfo.totalPhaseTurns} 턴
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">잔여</span>
          <span className={`text-sm font-bold font-mono ${style.text}`}>
            {phaseInfo.turnsRemaining}턴
          </span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className={`w-full ${style.barBg} rounded-full h-1.5 overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${style.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
