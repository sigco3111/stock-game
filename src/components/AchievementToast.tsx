'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (achievement && !dismissed) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss(), 400);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, dismissed, onDismiss]);

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    setTimeout(() => onDismiss(), 400);
  }

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-400 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className="bg-gray-900 border border-yellow-600/50 rounded-xl p-4 shadow-2xl shadow-yellow-900/20 min-w-[280px] max-w-[340px]">
        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 text-xs"
        >
          ✕
        </button>

        <div className="flex items-start gap-3">
          {/* 아이콘 */}
          <div className="w-10 h-10 rounded-lg bg-yellow-900/30 flex items-center justify-center flex-shrink-0 animate-bounce">
            <span className="text-xl">{achievement.emoji}</span>
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-yellow-500 tracking-wider uppercase mb-0.5">
              🏆 업적 달성!
            </div>
            <div className="text-sm font-bold text-gray-100 truncate">{achievement.name}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{achievement.description}</div>
          </div>
        </div>

        {/* 반짝이는 효과 */}
        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
          <div className="absolute -top-1 -left-1 w-16 h-16 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-yellow-400/5 rounded-full blur-xl animate-pulse delay-500" />
        </div>
      </div>
    </div>
  );
}
