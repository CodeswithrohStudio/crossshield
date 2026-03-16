'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import { useState } from 'react';
import { CONTRACT_ADDRESSES, VAULT_ABI, ERC20_ABI } from '../lib/contracts';

export function useVaultDeposit() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [depositHash, setDepositHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

  async function deposit(amountUsdc: number) {
    const amount = parseUnits(amountUsdc.toString(), 6);

    // Approve first
    await writeContractAsync({
      address: CONTRACT_ADDRESSES.MockUSDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.CrossShieldVault, maxUint256],
    });

    // Then deposit — capture hash
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CrossShieldVault,
      abi: VAULT_ABI,
      functionName: 'depositUSDC',
      args: [amount],
    });
    setDepositHash(hash);

    // Save to MongoDB (fire and forget)
    if (address) {
      fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          txHash: hash,
          amount: amountUsdc,
          maturityDays: 365,
        }),
      }).catch(console.error);
    }

    return hash;
  }

  return { deposit, isPending, isConfirming, isSuccess };
}

export function useVaultDeposit_Read() {
  const { address } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.CrossShieldVault,
    abi: VAULT_ABI,
    functionName: 'getDeposit',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { deposit: data, isLoading, refetch };
}

export function useYieldAvailable() {
  const { address } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.CrossShieldVault,
    abi: VAULT_ABI,
    functionName: 'yieldAvailable',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { yield: data ?? 0n, isLoading, refetch };
}

export function useOpenShield() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [shieldHash, setShieldHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: shieldHash });

  async function openShield(
    assetId: number,
    leverage: number,
    meta?: { walletAddress: string; assetName: string; assetEmoji: string }
  ) {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.CrossShieldVault,
      abi: VAULT_ABI,
      functionName: 'openShield',
      args: [assetId, leverage],
    });
    setShieldHash(hash);

    // Save to MongoDB (fire and forget)
    if (meta) {
      fetch('/api/shields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: meta.walletAddress,
          txHash: hash,
          assetId,
          assetName: meta.assetName,
          assetEmoji: meta.assetEmoji,
          leverage,
          entryPrice: '0',
          marginUsed: '0',
        }),
      }).catch(console.error);
    }

    return hash;
  }

  return { openShield, isPending, isConfirming, isSuccess };
}

export function useCloseShield() {
  const { writeContractAsync, isPending } = useWriteContract();

  async function closeShield(shieldId: bigint) {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.CrossShieldVault,
      abi: VAULT_ABI,
      functionName: 'closeShield',
      args: [shieldId],
    });
  }

  return { closeShield, isPending };
}

export function useWithdrawPrincipal() {
  const { writeContractAsync, isPending } = useWriteContract();

  async function withdrawPrincipal() {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.CrossShieldVault,
      abi: VAULT_ABI,
      functionName: 'withdrawPrincipal',
    });
  }

  return { withdrawPrincipal, isPending };
}

export function useFaucet() {
  const { writeContractAsync, isPending } = useWriteContract();

  async function claimFaucet() {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.MockUSDC,
      abi: ERC20_ABI,
      functionName: 'faucet',
    });
  }

  return { claimFaucet, isPending };
}
