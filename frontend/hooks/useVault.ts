'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import { CONTRACT_ADDRESSES, VAULT_ABI, ERC20_ABI } from '../lib/contracts';

export function useVaultDeposit() {
  const { address } = useAccount();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function deposit(amountUsdc: number) {
    const amount = parseUnits(amountUsdc.toString(), 6);
    // First approve
    await writeContractAsync({
      address: CONTRACT_ADDRESSES.MockUSDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.CrossShieldVault, maxUint256],
    });
    // Then deposit
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.CrossShieldVault,
      abi: VAULT_ABI,
      functionName: 'depositUSDC',
      args: [amount],
    });
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
  const { data: hash } = useWriteContract();

  async function openShield(assetId: number, leverage: number) {
    return writeContractAsync({
      address: CONTRACT_ADDRESSES.CrossShieldVault,
      abi: VAULT_ABI,
      functionName: 'openShield',
      args: [assetId, leverage],
    });
  }

  return { openShield, isPending };
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
