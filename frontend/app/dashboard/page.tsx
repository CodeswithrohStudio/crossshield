'use client';

import { useAccount } from 'wagmi';
import { Shield, TrendingUp, DollarSign, Activity, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { PrincipalSafetyBadge } from '../../components/PrincipalSafetyBadge';
import { ShieldCard } from '../../components/ShieldCard';
import { useVaultDeposit_Read, useYieldAvailable, useVaultDeposit, useCloseShield } from '../../hooks/useVault';
import { useUserShields, useShield } from '../../hooks/useShields';
import { useState } from 'react';
import { formatUSDC } from '../../lib/utils';

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

function ShieldLoader({ shieldId, onClose }: { shieldId: bigint; onClose: (id: bigint) => void }) {
  const { shield } = useShield(shieldId);
  if (!shield) return null;
  return (
    <ShieldCard
      shieldId={shieldId}
      assetId={shield.assetId}
      leverage={shield.leverage}
      entryPrice={shield.entryPrice}
      marginUsed={shield.marginUsed}
      openedAt={shield.openedAt}
      isOpen={shield.isOpen}
      realizedPnl={shield.realizedPnl}
      onClose={shield.isOpen ? () => onClose(shieldId) : undefined}
    />
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { deposit } = useVaultDeposit_Read();
  const { yield: yieldAmt } = useYieldAvailable();
  const { shieldIds, refetch: refetchShields } = useUserShields();
  const { closeShield } = useCloseShield();
  const [depositAmount, setDepositAmount] = useState('1000');
  const { deposit: doDeposit, isPending } = useVaultDeposit();

  const principalUsd = deposit ? Number(deposit.principal) / 1e6 : 0;
  const yieldUsd = Number(yieldAmt) / 1e6;

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
        <MetricCard icon={Activity} label="Active Shields" value={String(shieldIds.filter(() => true).length)} sub="open positions" color="bg-purple-400/10 text-purple-400" />
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

          {shieldIds.length === 0 ? (
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
              {shieldIds.map((id: bigint) => (
                <ShieldLoader key={id.toString()} shieldId={id} onClose={async (sid) => {
                  await closeShield(sid);
                  refetchShields();
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Deposit panel */}
        <div>
          <h2 className="font-semibold mb-4">Vault</h2>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            {deposit && deposit.principal > BigInt(0) ? (
              <>
                <div className="bg-green-400/5 border border-green-400/20 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Active Deposit</p>
                  <p className="text-2xl font-bold text-green-400 font-mono">{formatUSDC(deposit.principal)}</p>
                  <p className="text-xs text-green-400/70 mt-1">Matures: {new Date(Number(deposit.maturityTime) * 1000).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yield available</span>
                    <span className="font-mono text-blue-400">{formatUSDC(yieldAmt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal locked</span>
                    <span className="font-mono text-green-400">{formatUSDC(deposit.principal)}</span>
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
                <button
                  onClick={() => doDeposit(Number(depositAmount))}
                  disabled={isPending}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Depositing...' : 'Deposit USDC'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
