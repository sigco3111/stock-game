'use client';

import { useState, useMemo } from 'react';
import { Stock, Holding, Difficulty } from '@/lib/types';
import { DIFFICULTY_CONFIGS } from '@/lib/constants';

interface TradingPanelProps {
  stocks: Stock[];
  cash: number;
  holdings: Holding[];
  difficulty: Difficulty;
  selectedStockCode: string | null;
  onTrade: (stockCode: string, action: 'buy' | 'sell', quantity: number) => void;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR');
}

export default function TradingPanel({
  stocks,
  cash,
  holdings,
  difficulty,
  selectedStockCode,
  onTrade,
}: TradingPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [selectedCode, setSelectedCode] = useState(selectedStockCode || '');
  const [quantity, setQuantity] = useState<number>(0);

  const config = DIFFICULTY_CONFIGS[difficulty];

  const selectedStock = useMemo(
    () => stocks.find((s) => s.code === selectedCode),
    [stocks, selectedCode]
  );

  const holding = useMemo(
    () => holdings.find((h) => h.stockCode === selectedCode),
    [holdings, selectedCode]
  );

  const feeRate = config.feeRate;

  const tradeAmount = selectedStock ? selectedStock.currentPrice * quantity : 0;
  const fee = Math.floor(tradeAmount * feeRate);
  const totalBuy = tradeAmount + fee;
  const totalSell = tradeAmount - fee;
  const cashAfterBuy = cash - totalBuy;
  const maxBuyQty = selectedStock ? Math.floor(cash / (selectedStock.currentPrice * (1 + feeRate))) : 0;

  function openModal(act: 'buy' | 'sell') {
    setAction(act);
    setSelectedCode(selectedStockCode || (stocks.length > 0 ? stocks[0].code : ''));
    setQuantity(0);
    setModalOpen(true);
  }

  function setQuickQty(pct: number) {
    if (action === 'buy' && selectedStock) {
      setQuantity(Math.floor(maxBuyQty * pct));
    } else if (action === 'sell' && holding) {
      setQuantity(Math.floor(holding.quantity * pct));
    }
  }

  function setFixedQty(qty: number) {
    if (action === 'buy') {
      setQuantity(Math.min(qty, maxBuyQty));
    } else if (action === 'sell' && holding) {
      setQuantity(Math.min(qty, holding.quantity));
    }
  }

  function handleConfirm() {
    if (quantity <= 0 || !selectedCode) return;
    onTrade(selectedCode, action, quantity);
    setModalOpen(false);
    setQuantity(0);
  }

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="text-sm font-bold text-gray-300 tracking-wider mb-3">💰 거래</h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => openModal('buy')}
            className="py-3 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm transition-all duration-150 shadow-lg shadow-red-900/30"
          >
            매수
          </button>
          <button
            onClick={() => openModal('sell')}
            className="py-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm transition-all duration-150 shadow-lg shadow-blue-900/30"
          >
            매도
          </button>
          <button
            onClick={() => {}}
            className="py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold text-sm transition-all duration-150"
          >
            홀드
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          보유현금: <span className="text-yellow-400 font-mono">₩{formatPrice(cash)}</span>
        </div>
      </div>

      {/* 거래 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${action === 'buy' ? 'text-red-400' : 'text-blue-400'}`}>
                {action === 'buy' ? '🔴 매수하기' : '🔵 매도하기'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-300 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* 종목 선택 */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">종목 선택</label>
              <select
                value={selectedCode}
                onChange={(e) => {
                  setSelectedCode(e.target.value);
                  setQuantity(0);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-yellow-500"
              >
                {stocks.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code}) - ₩{formatPrice(s.currentPrice)}
                  </option>
                ))}
              </select>
            </div>

            {/* 수량 버튼 */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">
                수량 {action === 'sell' && holding ? `(보유: ${holding.quantity}주)` : ''}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {action === 'buy' ? (
                  <>
                    <QuickBtn label="전량" onClick={() => setQuickQty(1)} />
                    <QuickBtn label="50%" onClick={() => setQuickQty(0.5)} />
                    <QuickBtn label="25%" onClick={() => setQuickQty(0.25)} />
                    <QuickBtn label="10%" onClick={() => setQuickQty(0.1)} />
                    <QuickBtn label="5%" onClick={() => setQuickQty(0.05)} />
                    <QuickBtn label="10주" onClick={() => setFixedQty(10)} />
                    <QuickBtn label="50주" onClick={() => setFixedQty(50)} />
                    <QuickBtn label="100주" onClick={() => setFixedQty(100)} />
                  </>
                ) : (
                  <>
                    <QuickBtn label="전량" onClick={() => setQuickQty(1)} />
                    <QuickBtn label="50%" onClick={() => setQuickQty(0.5)} />
                    <QuickBtn label="25%" onClick={() => setQuickQty(0.25)} />
                    <QuickBtn label="10%" onClick={() => setQuickQty(0.1)} />
                    <QuickBtn label="1주" onClick={() => setFixedQty(1)} />
                    <QuickBtn label="10주" onClick={() => setFixedQty(10)} />
                    <QuickBtn label="50주" onClick={() => setFixedQty(50)} />
                  </>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="직접 입력"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* 거래 요약 */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>단가</span>
                <span className="text-gray-200 font-mono">
                  ₩{selectedStock ? formatPrice(selectedStock.currentPrice) : '0'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>수량</span>
                <span className="text-gray-200 font-mono">{quantity}주</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>금액</span>
                <span className="text-gray-200 font-mono">₩{formatPrice(tradeAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>수수료 ({(feeRate * 100).toFixed(2)}%)</span>
                <span className="text-gray-200 font-mono">₩{formatPrice(fee)}</span>
              </div>
              <div className="border-t border-gray-700 pt-1.5 flex justify-between font-bold">
                <span className={action === 'buy' ? 'text-red-400' : 'text-blue-400'}>
                  {action === 'buy' ? '총 지불' : '총 수령'}
                </span>
                <span className="text-gray-100 font-mono">
                  ₩{formatPrice(action === 'buy' ? totalBuy : totalSell)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>거래 후 현금</span>
                <span
                  className={`font-mono ${
                    action === 'buy'
                      ? cashAfterBuy < 0
                        ? 'text-red-400'
                        : 'text-gray-200'
                      : 'text-gray-200'
                  }`}
                >
                  ₩{formatPrice(action === 'buy' ? cashAfterBuy : cash + totalSell)}
                </span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium text-sm transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={quantity <= 0 || (action === 'buy' && cashAfterBuy < 0) || (action === 'sell' && (!holding || quantity > holding.quantity))}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  action === 'buy'
                    ? 'bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white'
                }`}
              >
                {action === 'buy' ? '매수 확인' : '매도 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      {label}
    </button>
  );
}
