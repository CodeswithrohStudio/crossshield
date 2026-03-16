'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader2, ShieldAlert } from 'lucide-react';
import { cn, getRiskColor, getRiskBg } from '../lib/utils';

interface RiskAnalysis {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  warnings: string[];
  recommendation: 'PROCEED' | 'CAUTION' | 'ABORT';
}

interface Props {
  assetName: string;
  leverage: number;
  amount: number;
  onProceed: () => void;
  onCancel: () => void;
}

export function RiskAnalysisPanel({ assetName, leverage, amount, onProceed, onCancel }: Props) {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyze() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analyze-tx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: '0x0000000000000000000000000000000000000000',
            calldata: '0x',
            value: '0',
            assetName,
            leverage,
            amount,
          }),
        });
        const data = await res.json();
        setAnalysis(data);
      } catch (e) {
        setError('Failed to load risk analysis');
      } finally {
        setLoading(false);
      }
    }
    analyze();
  }, [assetName, leverage, amount]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <div>
          <p className="text-sm font-medium">Analyzing transaction risk...</p>
          <p className="text-xs text-muted-foreground">AI is reviewing your position</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-sm text-muted-foreground">{error ?? 'Analysis unavailable'}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={onProceed} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium">Proceed Anyway</button>
          <button onClick={onCancel} className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  const { riskScore, riskLevel, summary, warnings, recommendation } = analysis;

  return (
    <div className={cn('border rounded-xl p-6 space-y-4', getRiskBg(riskScore))}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className={cn('w-5 h-5', getRiskColor(riskScore))} />
          <h3 className="font-semibold">AI Risk Analysis</h3>
        </div>
        <div className={cn('text-2xl font-bold font-mono', getRiskColor(riskScore))}>
          {riskScore}/100
        </div>
      </div>

      {/* Risk bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${riskScore}%`,
            background: riskScore < 25 ? '#22c55e' : riskScore < 50 ? '#f59e0b' : riskScore < 75 ? '#f97316' : '#ef4444',
          }}
        />
      </div>

      <div className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-bold', getRiskColor(riskScore))}>
        {riskLevel} RISK
      </div>

      <p className="text-sm text-foreground/80">{summary}</p>

      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-yellow-400/80">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {recommendation !== 'ABORT' ? (
          <button
            onClick={onProceed}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
              recommendation === 'PROCEED'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-500/30'
            )}
          >
            <CheckCircle className="w-4 h-4" />
            {recommendation === 'PROCEED' ? 'Proceed' : 'Proceed with Caution'}
          </button>
        ) : (
          <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-400/30 cursor-not-allowed">
            <XCircle className="w-4 h-4" />
            High Risk — Not Recommended
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-lg text-sm hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
