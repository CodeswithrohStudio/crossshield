'use client';

import { cn, getLiquidationColor } from '../lib/utils';
import { getBacktestEntry } from '../lib/backtest-data';
import { AlertTriangle } from 'lucide-react';

interface Props {
  assetId: number;
  value: number;
  onChange: (value: number) => void;
}

const LEVERAGE_MARKS = [1, 2, 5, 10, 20, 50];

export function LeverageSlider({ assetId, value, onChange }: Props) {
  const backtest = getBacktestEntry(assetId, value) ?? getBacktestEntry(0, value);
  const liqRisk = backtest?.liquidationRisk ?? 0;
  const expectedReturn = backtest?.avgAnnualizedReturn ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Leverage</label>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold font-mono', value >= 20 ? 'text-orange-400' : value >= 10 ? 'text-yellow-400' : 'text-green-400')}>
            {value}x
          </span>
        </div>
      </div>

      {/* Custom leverage selector */}
      <div className="flex gap-2">
        {LEVERAGE_MARKS.map(lev => (
          <button
            key={lev}
            onClick={() => onChange(lev)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              value === lev
                ? lev >= 20 ? 'bg-orange-500/20 text-orange-400 border border-orange-400/50'
                  : lev >= 10 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                  : 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-muted text-muted-foreground hover:bg-accent border border-transparent'
            )}
          >
            {lev}x
          </button>
        ))}
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
          <p className={cn('text-lg font-bold', expectedReturn > 0 ? 'text-green-400' : 'text-red-400')}>
            {expectedReturn > 0 ? '+' : ''}{expectedReturn.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">annualized</p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Liquidation Risk</p>
          <p className={cn('text-lg font-bold', getLiquidationColor(liqRisk))}>
            {liqRisk.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">probability</p>
        </div>
      </div>

      {value >= 10 && (
        <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-400/80">
            {value >= 20
              ? `${value}x leverage carries significant liquidation risk. Your yield margin may not be sufficient to absorb large moves.`
              : `${value}x leverage increases both potential returns and liquidation probability. Principal remains 100% protected.`}
          </p>
        </div>
      )}
    </div>
  );
}
