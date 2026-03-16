'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, LogOut, ChevronDown, Zap } from 'lucide-react';
import { formatAddress } from '../lib/utils';
import { useState } from 'react';
import { useFaucet } from '../hooks/useVault';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { claimFaucet, isPending } = useFaucet();
  const [open, setOpen] = useState(false);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-accent border border-border px-3 py-2 rounded-lg text-sm hover:bg-accent/80 transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="font-mono">{formatAddress(address!)}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-2xl p-2 min-w-[200px] z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1">
            Chain: {chainId === 31337 ? 'Localhost' : chainId === 420420421 ? 'Polkadot Hub' : `Unknown (${chainId})`}
          </div>
          <button
            onClick={() => { claimFaucet(); setOpen(false); }}
            disabled={isPending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-yellow-400 hover:bg-yellow-400/10 transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isPending ? 'Claiming...' : 'Claim 10k USDC'}
          </button>
          <button
            onClick={() => { disconnect(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
