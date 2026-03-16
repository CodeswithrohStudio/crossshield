'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, VAULT_ABI } from '../lib/contracts';

export function useUserShields() {
  const { address } = useAccount();
  const { data: shieldIds, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.CrossShieldVault,
    abi: VAULT_ABI,
    functionName: 'getUserShields',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { shieldIds: shieldIds ?? [], isLoading, refetch };
}

export function useShield(shieldId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.CrossShieldVault,
    abi: VAULT_ABI,
    functionName: 'getShield',
    args: [shieldId],
    query: { enabled: shieldId > 0n },
  });
  return { shield: data, isLoading, refetch };
}

export function useUnrealizedPnl(shieldId: bigint, isOpen: boolean) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.CrossShieldVault,
    abi: VAULT_ABI,
    functionName: 'unrealizedPnl',
    args: [shieldId],
    query: { enabled: isOpen && shieldId > 0n },
  });
  return { pnl: data ?? 0n, isLoading };
}
