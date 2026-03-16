'use client';

import { useParams, useRouter } from 'next/navigation';
import { Shield, TrendingUp, TrendingDown, ArrowLeft, Clock, Zap } from 'lucide-react';
import { useShield } from '../../../hooks/useShields';
import { useCloseShield } from '../../../hooks/useVault';
import { PrincipalSafetyBadge } from '../../../components/PrincipalSafetyBadge';
import { RiskAnalysisPanel } from '../../../components/RiskAnalysisPanel';
import { getAsset, formatPrice } from '../../../lib/assets';
import { cn, formatUSDC } from '../../../lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Generate mock PnL chart data
function generatePnlData(entryPrice: bigint, leverage: number) {
  const entry = Number(entryPrice);
  const points = 30;
  const data = [];
  let currentPrice = entry;

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.45) * 0.02;
    currentPrice = currentPrice * (1 + change);
    const pnlPct = ((currentPrice - entry) / entry) * leverage * 100;
    data.push({
      day: i + 1,
      pnl: Math.round(pnlPct * 100) / 100,
      price: Math.round(currentPrice),
    });
  }
  return data;
}

export default function ShieldDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const shieldId = BigInt(id as string);
  const { shield, isLoading } = useShield(shieldId);
  const { closeShield, isPending } = useCloseShield();
  const [showCloseAnalysis, setShowCloseAnalysis] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading shield...</div>;
  if (!shield) return <div className="p-8 text-center text-muted-foreground">Shield #{id} not found.</div>;

  const asset = getAsset(shield.assetId);
  const pnlData = generatePnlData(shield.entryPrice, shield.leverage);
  const currentPrice = shield.entryPrice; // Would use oracle in production
  const pnlPct = Number(shield.entryPrice) > 0
    ? ((Number(currentPrice) - Number(shield.entryPrice)) / Number(shield.entryPrice)) * shield.leverage * 100
    : 0;
  const isProfit = pnlPct >= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{asset?.emoji ?? '?'}</span>
          <div>
            <h1 className="text-2xl font-bold">{asset?.name} Shield #{id}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{shield.leverage}x</span>
              {shield.isOpen
                ? <span className="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded">OPEN</span>
                : <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">CLOSED</span>}
            </div>
          </div>
        </div>
        <PrincipalSafetyBadge principal={0} size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
          <p className="text-xl font-bold font-mono">{formatPrice(shield.entryPrice)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Current Price</p>
          <p className="text-xl font-bold font-mono">{formatPrice(currentPrice)}</p>
        </div>
        <div className={cn('bg-card border rounded-xl p-4', isProfit ? 'border-green-400/30' : 'border-red-400/30')}>
          <p className="text-xs text-muted-foreground mb-1">Unrealized PnL</p>
          <div className={cn('flex items-center gap-1 text-xl font-bold', isProfit ? 'text-green-400' : 'text-red-400')}>
            {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>{isProfit ? '+' : ''}{pnlPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* PnL Chart */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-4">Simulated PnL History (30 days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={pnlData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
              formatter={(v: number) => [`${v.toFixed(2)}%`, 'PnL']}
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke={pnlData[pnlData.length - 1]?.pnl >= 0 ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Position details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-sm">
          <h3 className="font-semibold">Position Details</h3>
          <div className="flex justify-between"><span className="text-muted-foreground">Margin Used</span><span className="font-mono">{formatUSDC(shield.marginUsed)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Leveraged Exposure</span><span className="font-mono">{formatUSDC(shield.marginUsed * BigInt(shield.leverage))}</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Opened</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(Number(shield.openedAt) * 1000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between"><span className="text-muted-foreground">XCM Message</span><span className="font-mono text-xs truncate max-w-[120px]">{shield.xcmMessageId.slice(0, 10)}...</span></div>
        </div>

        <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-green-400">Principal Protection</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your original deposit is secured by CrossShield's zero-coupon bond vault. No matter what happens to this position, you will receive 100% of your principal back.
          </p>
          <div className="text-xs text-green-400/70">
            PV = FV / (1 + r)^t — Goldman Sachs structured note math
          </div>
        </div>
      </div>

      {/* Close position */}
      {shield.isOpen && (
        <div>
          {!showCloseAnalysis ? (
            <button
              onClick={() => setShowCloseAnalysis(true)}
              className="w-full flex items-center justify-center gap-2 bg-card border border-border py-3 rounded-xl text-sm hover:bg-accent transition-colors"
            >
              <Zap className="w-4 h-4" /> Close Position (AI Analysis First)
            </button>
          ) : (
            <RiskAnalysisPanel
              assetName={asset?.name ?? 'Unknown'}
              leverage={shield.leverage}
              amount={Number(shield.marginUsed) / 1e6}
              onProceed={async () => {
                await closeShield(shieldId);
                router.push('/dashboard');
              }}
              onCancel={() => setShowCloseAnalysis(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
