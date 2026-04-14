'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Stock, MarketPhase } from '@/lib/types';

interface PriceChartProps {
  stock: Stock | null;
  marketPhase: MarketPhase;
}

const PHASE_COLORS: Record<MarketPhase, string> = {
  bull: 'rgba(239, 68, 68, 0.06)',
  consolidation: 'rgba(234, 179, 8, 0.04)',
  bear: 'rgba(59, 130, 246, 0.06)',
  recovery: 'rgba(249, 115, 22, 0.05)',
};

const LINE_COLORS: Record<MarketPhase, string> = {
  bull: '#ef4444',
  consolidation: '#eab308',
  bear: '#3b82f6',
  recovery: '#f97316',
};

export default function PriceChart({ stock, marketPhase }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; price: number; turn: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stock) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // 배경
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // 시장 국면 배경
    ctx.fillStyle = PHASE_COLORS[marketPhase];
    ctx.fillRect(padding.left, padding.top, chartW, chartH);

    const history = stock.priceHistory.slice(-20);
    if (history.length < 2) {
      ctx.fillStyle = '#4b5563';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('데이터가 부족합니다', w / 2, h / 2);
      return;
    }

    const min = Math.min(...history) * 0.98;
    const max = Math.max(...history) * 1.02;
    const range = max - min || 1;

    const toX = (i: number) => padding.left + (i / (history.length - 1)) * chartW;
    const toY = (p: number) => padding.top + chartH - ((p - min) / range) * chartH;

    // 그리드 라인
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // 가격 라벨
      const price = max - (i / gridLines) * range;
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₩${Math.round(price).toLocaleString('ko-KR')}`, padding.left - 6, y + 3);
    }

    // 턴 라벨
    ctx.textAlign = 'center';
    const startTurn = Math.max(0, stock.priceHistory.length - 20);
    for (let i = 0; i < history.length; i++) {
      if (i % Math.ceil(history.length / 6) === 0 || i === history.length - 1) {
        const x = toX(i);
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px monospace';
        ctx.fillText(`${startTurn + i + 1}T`, x, h - 8);
      }
    }

    // 그라디언트 필
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    const lineColor = LINE_COLORS[marketPhase];
    gradient.addColorStop(0, lineColor + '40');
    gradient.addColorStop(1, lineColor + '00');

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    for (let i = 1; i < history.length; i++) {
      ctx.lineTo(toX(i), toY(history[i]));
    }
    ctx.lineTo(toX(history.length - 1), h - padding.bottom);
    ctx.lineTo(toX(0), h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 라인
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    for (let i = 1; i < history.length; i++) {
      ctx.lineTo(toX(i), toY(history[i]));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 마지막 점
    const lastX = toX(history.length - 1);
    const lastY = toY(history[history.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
    ctx.strokeStyle = lineColor + '60';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 호버 정보
    if (hoverInfo) {
      const hx = hoverInfo.x;
      const hy = hoverInfo.y;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, padding.top);
      ctx.lineTo(hx, h - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();

      // 툴팁
      const tooltipText = `₩${hoverInfo.price.toLocaleString('ko-KR')} (${hoverInfo.turn}T)`;
      ctx.font = 'bold 11px monospace';
      const tw = ctx.measureText(tooltipText).width + 12;
      const tx = Math.min(hx + 8, w - tw - 8);
      const ty = Math.max(hy - 28, padding.top + 4);

      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, 22, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'left';
      ctx.fillText(tooltipText, tx + 6, ty + 15);
    }
  }, [stock, marketPhase, hoverInfo]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!stock) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const history = stock.priceHistory.slice(-20);
    if (history.length < 2) return;

    const padding = { left: 60, right: 20 };
    const chartW = rect.width - padding.left - padding.right;
    const idx = Math.round(((mx - padding.left) / chartW) * (history.length - 1));
    if (idx < 0 || idx >= history.length) {
      setHoverInfo(null);
      return;
    }

    const min = Math.min(...history) * 0.98;
    const max = Math.max(...history) * 1.02;
    const range = max - min || 1;
    const chartH = rect.height - 50;
    const y = 20 + chartH - ((history[idx] - min) / range) * chartH;

    setHoverInfo({
      x: padding.left + (idx / (history.length - 1)) * chartW,
      y,
      price: history[idx],
      turn: Math.max(0, stock.priceHistory.length - 20) + idx + 1,
    });
  }

  function handleMouseLeave() {
    setHoverInfo(null);
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-300 tracking-wider">📈 가격 차트</h2>
        {stock && (
          <span className="text-xs text-gray-500">
            {stock.name} — ₩{stock.currentPrice.toLocaleString('ko-KR')}
          </span>
        )}
      </div>
      <div className="relative" style={{ height: 220 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
}
