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
        className="flex items-center gap-2 bg-foreground text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-colors"
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
        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm"
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-mono text-foreground">{formatAddress(address!)}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-xl p-2 min-w-[200px] z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-gray-100 mb-1">
            Chain: {chainId === 31337 ? 'Localhost' : chainId === 420420421 ? 'Polkadot Hub' : `Unknown (${chainId})`}
          </div>
          <button
            onClick={() => { claimFaucet(); setOpen(false); }}
            disabled={isPending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-yellow-600 hover:bg-yellow-50 transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isPending ? 'Claiming...' : 'Claim 10k USDC'}
          </button>
          <button
            onClick={() => { disconnect(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
