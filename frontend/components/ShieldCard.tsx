'use client';

import { TrendingUp, TrendingDown, Shield, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAsset, formatPrice } from '../lib/assets';
import Link from 'next/link';

interface ShieldCardProps {
  shieldId: bigint;
  assetId: number;
  leverage: number;
  entryPrice: bigint;
  currentPrice?: bigint;
  marginUsed: bigint;
  openedAt: bigint;
  isOpen: boolean;
  realizedPnl?: bigint;
  onClose?: () => void;
}

export function ShieldCard({
  shieldId,
  assetId,
  leverage,
  entryPrice,
  currentPrice,
  marginUsed,
  openedAt,
  isOpen,
  realizedPnl,
  onClose,
}: ShieldCardProps) {
  const asset = getAsset(assetId);
  const price = currentPrice ?? entryPrice;

  const pnlBps = entryPrice > 0n
    ? Number((price - entryPrice) * 10000n / entryPrice) * leverage
    : 0;

  const pnlUsd = Number(marginUsed) * pnlBps / 10000 / 1e6;
  const isProfit = pnlBps >= 0;

  const elapsed = Math.floor((Date.now() / 1000) - Number(openedAt));
  const days = Math.floor(elapsed / 86400);
  const hours = Math.floor((elapsed % 86400) / 3600);

  return (
    <div className={cn(
      'bg-card border rounded-xl p-4 card-hover',
      isOpen ? 'border-border' : 'border-border/50 opacity-75'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{asset?.emoji ?? '?'}</span>
          <div>
            <p className="font-semibold text-sm">{asset?.name ?? `Asset ${assetId}`}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{leverage}x</span>
              {isOpen ? (
                <span className="text-xs bg-green-400/10 text-green-400 px-1.5 py-0.5 rounded">OPEN</span>
              ) : (
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">CLOSED</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={cn('flex items-center gap-1 font-bold text-sm', isProfit ? 'text-green-400' : 'text-red-400')}>
            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isProfit ? '+' : ''}{pnlUsd.toFixed(2)} USDC
          </div>
          <p className="text-xs text-muted-foreground">
            {isProfit ? '+' : ''}{(pnlBps / 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-muted-foreground">Entry</p>
          <p className="font-mono">{formatPrice(entryPrice)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Current</p>
          <p className="font-mono">{formatPrice(price)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Margin</p>
          <p className="font-mono">${(Number(marginUsed) / 1e6).toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{days > 0 ? `${days}d ` : ''}{hours}h</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <Shield className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs text-green-400">Principal 100% protected</span>
      </div>

      {isOpen && onClose && (
        <button
          onClick={onClose}
          className="w-full py-1.5 bg-muted hover:bg-accent text-sm rounded-lg transition-colors"
        >
          Close Position
        </button>
      )}

      {!isOpen && realizedPnl !== undefined && (
        <div className={cn('text-center text-xs font-medium py-1.5 rounded-lg',
          Number(realizedPnl) >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
        )}>
          Realized: {Number(realizedPnl) >= 0 ? '+' : ''}${(Number(realizedPnl) / 1e6).toFixed(2)} USDC
        </div>
      )}
    </div>
  );
}
