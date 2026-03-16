'use client';

import { useState } from 'react';
import { BACKTEST_DATA, BacktestEntry } from '../../lib/backtest-data';
import { ASSETS } from '../../lib/assets';
import { cn, getLiquidationColor } from '../../lib/utils';
import { BarChart3, Filter, TrendingUp, AlertTriangle } from 'lucide-react';

type RiskFilter = 'all' | 'conservative' | 'moderate' | 'aggressive';
type Category = 'all' | 'commodity' | 'crypto' | 'realestate';

const RISK_FILTERS: Record<RiskFilter, string> = {
  all: 'All',
  conservative: 'Conservative (< 10% liq)',
  moderate: 'Moderate (10–30%)',
  aggressive: 'Aggressive (> 30%)',
};

function RiskBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value < 10 ? '#22c55e' : value < 30 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color }}>{value.toFixed(1)}%</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [leverageFilter, setLeverageFilter] = useState<number>(0);

  const filtered = BACKTEST_DATA.filter(entry => {
    const asset = ASSETS[entry.assetId];
    if (categoryFilter !== 'all' && asset?.category !== categoryFilter) return false;
    if (leverageFilter > 0 && entry.leverage !== leverageFilter) return false;
    if (riskFilter === 'conservative' && entry.liquidationRisk >= 10) return false;
    if (riskFilter === 'moderate' && (entry.liquidationRisk < 10 || entry.liquidationRisk >= 30)) return false;
    if (riskFilter === 'aggressive' && entry.liquidationRisk < 30) return false;
    return true;
  }).sort((a, b) => b.avgAnnualizedReturn - a.avgAnnualizedReturn);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Backtest Analytics</h1>
          <p className="text-muted-foreground text-sm">Historical performance for all 25 assets × 6 leverage levels (150 combinations)</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          {filtered.length} results
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Risk Tolerance</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(RISK_FILTERS) as [RiskFilter, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setRiskFilter(key)} className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-colors',
                  riskFilter === key ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground hover:bg-accent'
                )}>{label.split(' (')[0]}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Asset Category</label>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'commodity', 'crypto', 'realestate'] as Category[]).map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-colors',
                  categoryFilter === cat ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground hover:bg-accent'
                )}>
                  {cat === 'realestate' ? 'Real Estate' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Leverage</label>
            <div className="flex flex-wrap gap-1.5">
              {[0, 1, 2, 5, 10, 20, 50].map(lev => (
                <button key={lev} onClick={() => setLeverageFilter(lev)} className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-colors',
                  leverageFilter === lev ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground hover:bg-accent'
                )}>{lev === 0 ? 'All' : `${lev}x`}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Asset</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Leverage</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Avg Return</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Liq Risk</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Best Case</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Worst Case</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const asset = ASSETS[entry.assetId];
                return (
                  <tr key={`${entry.assetId}-${entry.leverage}`} className={cn(
                    'border-b border-border/50 hover:bg-accent/50 transition-colors',
                    i % 2 === 0 ? '' : 'bg-muted/20'
                  )}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{asset?.emoji}</span>
                        <div>
                          <p className="font-medium text-xs">{entry.assetName}</p>
                          <p className="text-xs text-muted-foreground">{asset?.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('font-mono text-xs font-bold',
                        entry.leverage >= 20 ? 'text-orange-400' : entry.leverage >= 10 ? 'text-yellow-400' : 'text-foreground'
                      )}>{entry.leverage}x</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="font-mono text-green-400 font-medium">{entry.avgAnnualizedReturn.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <RiskBar value={entry.liquidationRisk} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-green-400">+{entry.bestCase.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{entry.worstCase.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Backtest data is simulated for demonstration purposes. Principal is 100% protected regardless of outcome.
      </p>
    </div>
  );
}
