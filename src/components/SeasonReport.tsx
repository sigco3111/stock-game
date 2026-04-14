'use client';

import { useState, useEffect } from 'react';
import { Grade, SeasonReport as SeasonReportType } from '@/lib/types';

interface SeasonReportProps {
  report: SeasonReportType | null;
  onClose: () => void;
}

const GRADE_STYLES: Record<Grade, { color: string; bg: string; border: string; glow: string; label: string }> = {
  S: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-600', glow: 'shadow-yellow-500/30', label: '투자의 신' },
  A: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-600', glow: 'shadow-red-500/20', label: '숙련된 투자자' },
  B: { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-600', glow: 'shadow-green-500/10', label: '안정적 투자자' },
  C: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-600', glow: 'shadow-blue-500/10', label: '초보 투자자' },
  D: { color: 'text-gray-400', bg: 'bg-gray-800/20', border: 'border-gray-600', glow: 'shadow-gray-500/10', label: '갈 길이 멀다' },
};

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR');
}

export default function SeasonReport({ report, onClose }: SeasonReportProps) {
  const [showGrade, setShowGrade] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (report) {
      setShowGrade(false);
      setShowDetails(false);
      const t1 = setTimeout(() => setShowGrade(true), 500);
      const t2 = setTimeout(() => setShowDetails(true), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [report]);

  if (!report) return null;

  const gradeStyle = GRADE_STYLES[report.grade];
  const winRate = report.totalTrades > 0 ? ((report.profitTrades / report.totalTrades) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-200 mb-1">시즌 리포트</h2>
          <div className="text-xs text-gray-500">이번 시즌의 투자 성과를 분석합니다</div>
        </div>

        {/* 등급 */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-700 ${
              showGrade
                ? `${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.glow} scale-100 opacity-100`
                : 'scale-50 opacity-0'
            }`}
          >
            <div className="text-center">
              <div className={`text-5xl font-black ${gradeStyle.color}`}>{report.grade}</div>
              <div className={`text-[10px] mt-1 ${gradeStyle.color} opacity-80`}>{gradeStyle.label}</div>
            </div>
          </div>
        </div>

        {/* 통계 그리드 */}
        <div
          className={`grid grid-cols-2 gap-3 mb-5 transition-all duration-500 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <StatBox label="총 자산" value={`₩${formatPrice(report.totalAssets)}`} />
          <StatBox
            label="수익률"
            value={`${report.returnRate >= 0 ? '+' : ''}${report.returnRate.toFixed(1)}%`}
            color={report.returnRate >= 0 ? 'text-red-400' : 'text-blue-400'}
          />
          <StatBox label="총 거래" value={`${report.totalTrades}회`} />
          <StatBox label="승률" value={`${winRate}%`} color="text-green-400" />
          <StatBox label="수익 거래" value={`${report.profitTrades}회`} color="text-red-400" />
          <StatBox label="손실 거래" value={`${report.lossTrades}회`} color="text-blue-400" />
          <StatBox
            label="최대 낙폭"
            value={`${report.maxDrawdown.toFixed(1)}%`}
            color="text-orange-400"
          />
        </div>

        {/* 스타일 분석 */}
        <div
          className={`mb-5 transition-all duration-500 delay-200 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs font-bold text-gray-400 mb-2">📋 투자 스타일 분석</div>
            <p className="text-sm text-gray-200 leading-relaxed">{report.styleAnalysis}</p>
          </div>
        </div>

        {/* 하이라이트 */}
        <div
          className={`mb-5 transition-all duration-500 delay-300 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="text-xs font-bold text-gray-400 mb-2">✨ 이번 시즌 하이라이트</div>
          <div className="space-y-1.5">
            {report.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-sm transition-colors"
        >
          다음 시즌으로
        </button>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color = 'text-gray-100',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-800/40 rounded-lg p-3 text-center border border-gray-700/30">
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
