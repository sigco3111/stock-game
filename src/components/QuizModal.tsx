'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion } from '@/lib/types';
import { QUIZ_BONUS } from '@/lib/types';

interface QuizModalProps {
  quiz: QuizQuestion | null;
  answered: boolean;
  isCorrect: boolean | null;
  onAnswer: (optionIndex: number) => void;
  timeLimit?: number;
}

export default function QuizModal({
  quiz,
  answered,
  isCorrect,
  onAnswer,
  timeLimit = 15,
}: QuizModalProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!quiz || answered) {
      setTimeLeft(timeLimit);
      setSelectedIndex(null);
      return;
    }
    setTimeLeft(timeLimit);
    setSelectedIndex(null);
  }, [quiz, answered, timeLimit]);

  useEffect(() => {
    if (!quiz || answered || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, answered, timeLeft]);

  const handleSelect = useCallback(
    (idx: number) => {
      if (answered || animating) return;
      setSelectedIndex(idx);
      setAnimating(true);
      setTimeout(() => {
        onAnswer(idx);
        setAnimating(false);
      }, 300);
    },
    [answered, animating, onAnswer]
  );

  // 타임아웃 시 자동 오답 처리
  useEffect(() => {
    if (timeLeft === 0 && quiz && !answered) {
      handleSelect(-1);
    }
  }, [timeLeft, quiz, answered, handleSelect]);

  if (!quiz) return null;

  const timerPercent = (timeLeft / timeLimit) * 100;
  const timerColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500';
  const bonus = QUIZ_BONUS[quiz.difficulty] || 30000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-bold text-gray-300">투자 퀴즈</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300">
              난이도 {'⭐'.repeat(quiz.difficulty)}
            </span>
          </div>
          <span className="text-[10px] text-gray-500">{quiz.category}</span>
        </div>

        {/* 타이머 */}
        {!answered && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">제한시간</span>
              <span className={`text-sm font-mono font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-gray-200'}`}>
                {timeLeft}초
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 질문 */}
        <p className="text-base font-bold text-gray-100 mb-5 leading-snug">{quiz.question}</p>

        {/* 보기 */}
        <div className="space-y-2 mb-4">
          {quiz.options.map((option, idx) => {
            let btnClass =
              'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ';

            if (answered) {
              if (idx === quiz.answer) {
                btnClass += 'bg-green-900/40 border-green-600 text-green-200';
              } else if (idx === selectedIndex && idx !== quiz.answer) {
                btnClass += 'bg-red-900/40 border-red-600 text-red-200';
              } else {
                btnClass += 'bg-gray-800/30 border-gray-700 text-gray-500';
              }
            } else {
              btnClass +=
                'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750 hover:border-gray-600 active:scale-[0.98]';
              if (selectedIndex === idx) {
                btnClass += ' border-yellow-500 bg-yellow-900/20';
              }
            }

            const optionLabels = ['①', '②', '③', '④'];

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={btnClass}
              >
                <span className="font-bold mr-2">{optionLabels[idx]}</span>
                {option}
                {answered && idx === quiz.answer && (
                  <span className="float-right text-green-400">✓ 정답</span>
                )}
                {answered && idx === selectedIndex && idx !== quiz.answer && (
                  <span className="float-right text-red-400">✗ 오답</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 결과 */}
        {answered && (
          <div
            className={`p-4 rounded-xl mb-4 ${
              isCorrect
                ? 'bg-green-900/20 border border-green-800/50'
                : 'bg-red-900/20 border border-red-800/50'
            } ${isCorrect ? 'animate-[bounce_0.5s_ease-out]' : 'animate-[shake_0.5s_ease-out]'}`}
          >
            {isCorrect && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎉</span>
                <span className="font-bold text-green-400">정답입니다!</span>
                <span className="text-sm font-bold text-yellow-400 animate-[pulse_1s_ease-in-out_infinite]">
                  +₩{bonus.toLocaleString('ko-KR')}
                </span>
              </div>
            )}
            {!isCorrect && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">😢</span>
                <span className="font-bold text-red-400">
                  {timeLeft === 0 ? '시간 초과!' : '틀렸습니다!'}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 leading-relaxed">{quiz.explanation}</p>
          </div>
        )}
      </div>

      {/* shake 애니메이션 */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.03); }
          60% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
