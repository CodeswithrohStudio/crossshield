'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, ORACLE_ABI } from '../lib/contracts';
import { ASSETS } from '../lib/assets';

export function useAssetPrice(assetId: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.RWAOracle,
    abi: ORACLE_ABI,
    functionName: 'getPrice',
    args: [assetId],
  });
  // Fall back to mock price if contract unavailable
  const fallback = ASSETS[assetId]?.mockPrice ?? 0n;
  return { price: data ?? fallback, isLoading, refetch };
}

export function useAllPrices() {
  // Returns mock prices for all assets (used when contract is unavailable)
  return ASSETS.map(asset => ({
    ...asset,
    currentPrice: asset.mockPrice,
  }));
}
