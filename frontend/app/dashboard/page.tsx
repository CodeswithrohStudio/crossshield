'use client';

import { useAccount } from 'wagmi';
import { Shield, TrendingUp, DollarSign, Activity, Plus, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { PrincipalSafetyBadge } from '../../components/PrincipalSafetyBadge';
import { useVaultDeposit, useYieldAvailable } from '../../hooks/useVault';
import { getAsset } from '../../lib/assets';
import { cn } from '../../lib/utils';

interface MongoDeposit {
  _id: string;
  walletAddress: string;
  txHash: string;
  amount: number;
  depositedAt: string;
  maturityTime: string;
}

interface MongoShield {
  _id: string;
  walletAddress: string;
  txHash: string;
  shieldId: string | null;
  assetId: number;
  assetName: string;
  assetEmoji: string;
  leverage: number;
  status: 'open' | 'closed';
  openedAt: string;
}

function MetricCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono mb-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ShieldCard({ shield, onClose }: { shield: MongoShield; onClose: (id: string) => void }) {
  const asset = getAsset(shield.assetId);
  const elapsed = Math.floor((Date.now() - new Date(shield.openedAt).getTime()) / 1000);
  const days = Math.floor(elapsed / 86400);
  const hours = Math.floor((elapsed % 86400) / 3600);

  return (
    <div className={cn(
      'bg-card border rounded-xl p-4',
      shield.status === 'open' ? 'border-border' : 'border-border/50 opacity-75'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{shield.assetEmoji || asset?.emoji || '🛡️'}</span>
          <div>
            <p className="font-semibold text-sm">{shield.assetName || asset?.name || `Asset ${shield.assetId}`}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{shield.leverage}x</span>
              {shield.status === 'open' ? (
                <span className="text-xs bg-green-400/10 text-green-400 px-1.5 py-0.5 rounded">OPEN</span>
              ) : (
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">CLOSED</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 font-bold text-sm text-green-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Active
          </div>
          <p className="text-xs text-muted-foreground">{shield.leverage}x leverage</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-muted-foreground">Asset</p>
          <p className="font-mono">{shield.assetName || `Asset ${shield.assetId}`}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Leverage</p>
          <p className={cn('font-mono font-bold',
            shield.leverage >= 20 ? 'text-orange-400' : shield.leverage >= 10 ? 'text-yellow-400' : 'text-green-400'
          )}>{shield.leverage}x</p>
        </div>
        <div>
          <p className="text-muted-foreground">TX</p>
          <p className="font-mono truncate max-w-[90px]">{shield.txHash.slice(0, 10)}…</p>
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

      {shield.status === 'open' && (
        <button
          onClick={() => onClose(shield._id)}
          className="w-full py-1.5 bg-muted hover:bg-accent text-sm rounded-lg transition-colors"
        >
          Close Position
        </button>
      )}
    </div>
  );
}

function DepositButton({ amount, onSuccess }: { amount: string; onSuccess: () => void }) {
  const [txError, setTxError] = useState('');
  const { deposit: doDeposit, isPending, isConfirming, isSuccess } = useVaultDeposit();

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  async function handleClick() {
    setTxError('');
    try {
      await doDeposit(Number(amount));
    } catch (e: any) {
      setTxError(e?.shortMessage ?? e?.message ?? 'Transaction failed');
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isPending || isConfirming}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isConfirming ? 'Confirming…' : isPending ? 'Depositing…' : 'Deposit USDC'}
      </button>
      {txError && <p className="text-xs text-red-400">{txError}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { yield: yieldAmt } = useYieldAvailable();

  const [deposit, setDeposit] = useState<MongoDeposit | null>(null);
  const [shields, setShields] = useState<MongoShield[]>([]);
  const [loadingShields, setLoadingShields] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');

  const yieldUsd = Number(yieldAmt) / 1e6;

  const fetchDeposit = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/deposits?address=${address}`);
      const data = await res.json();
      setDeposit(data.deposit);
    } catch (e) {
      console.error('Failed to fetch deposit:', e);
    }
  }, [address]);

  const fetchShields = useCallback(async () => {
    if (!address) return;
    setLoadingShields(true);
    try {
      const res = await fetch(`/api/shields?address=${address}`);
      const data = await res.json();
      setShields(data.shields ?? []);
    } catch (e) {
      console.error('Failed to fetch shields:', e);
    } finally {
      setLoadingShields(false);
    }
  }, [address]);

  useEffect(() => {
    fetchDeposit();
    fetchShields();
  }, [fetchDeposit, fetchShields]);

  // Poll every 5s to pick up new records saved after TX confirms
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeposit();
      fetchShields();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDeposit, fetchShields]);

  async function handleCloseShield(mongoId: string) {
    try {
      await fetch(`/api/shields/${mongoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      await fetchShields();
    } catch (e) {
      console.error('Close shield error:', e);
    }
  }

  const principalUsd = deposit?.amount ?? 0;
  const activeCount = shields.filter(s => s.status === 'open').length;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-sm">Connect a wallet to view your CrossShield dashboard and manage your principal-protected positions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your CrossShield portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <PrincipalSafetyBadge principal={principalUsd} />
          <Link href="/shield/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            New Shield
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={DollarSign} label="Principal Safe" value={`$${principalUsd.toLocaleString()}`} sub="100% guaranteed return" color="bg-green-400/10 text-green-400" />
        <MetricCard icon={TrendingUp} label="Yield Earned" value={`$${yieldUsd.toFixed(2)}`} sub="available as margin" color="bg-blue-400/10 text-blue-400" />
        <MetricCard icon={Activity} label="Active Shields" value={String(activeCount)} sub="open positions" color="bg-purple-400/10 text-purple-400" />
        <MetricCard icon={ArrowUpRight} label="Total Deposited" value={`$${principalUsd.toLocaleString()}`} sub="across all vaults" color="bg-yellow-400/10 text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shields */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Active Shields</h2>
            <Link href="/shield/new" className="text-xs text-primary hover:underline flex items-center gap-1">
              Open New <Plus className="w-3 h-3" />
            </Link>
          </div>

          {loadingShields && shields.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              Loading shields…
            </div>
          ) : shields.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">No shields yet</p>
              <p className="text-sm text-muted-foreground mb-4">Deposit USDC and open your first shield to earn leveraged returns.</p>
              <Link href="/shield/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" /> Open First Shield
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shields.map((shield) => (
                <ShieldCard key={shield._id} shield={shield} onClose={handleCloseShield} />
              ))}
            </div>
          )}
        </div>

        {/* Deposit panel */}
        <div>
          <h2 className="font-semibold mb-4">Vault</h2>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            {deposit ? (
              <>
                <div className="bg-green-400/5 border border-green-400/20 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Active Deposit</p>
                  <p className="text-2xl font-bold text-green-400 font-mono">${deposit.amount.toLocaleString()} USDC</p>
                  <p className="text-xs text-green-400/70 mt-1">
                    Matures: {new Date(deposit.maturityTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yield available</span>
                    <span className="font-mono text-blue-400">${yieldUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal locked</span>
                    <span className="font-mono text-green-400">${deposit.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TX</span>
                    <span className="font-mono text-xs text-muted-foreground">{deposit.txHash.slice(0, 12)}…</span>
                  </div>
                </div>
                <PrincipalSafetyBadge principal={principalUsd} size="sm" className="w-full justify-center" />
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Deposit Amount (USDC)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary/50"
                    placeholder="1000"
                    min="1"
                  />
                </div>
                <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal locked</span>
                    <span className="text-green-400 font-mono">${Number(depositAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yield (1yr @ 5%)</span>
                    <span className="text-blue-400 font-mono">${(Number(depositAmount) * 0.0476).toFixed(2)}</span>
                  </div>
                </div>
                <DepositButton amount={depositAmount} onSuccess={fetchDeposit} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
