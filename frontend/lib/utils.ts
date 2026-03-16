import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSDC(amount: bigint, decimals = 6): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getRiskColor(score: number): string {
  if (score < 25) return 'text-green-400';
  if (score < 50) return 'text-yellow-400';
  if (score < 75) return 'text-orange-400';
  return 'text-red-400';
}

export function getRiskBg(score: number): string {
  if (score < 25) return 'bg-green-400/10 border-green-400/30';
  if (score < 50) return 'bg-yellow-400/10 border-yellow-400/30';
  if (score < 75) return 'bg-orange-400/10 border-orange-400/30';
  return 'bg-red-400/10 border-red-400/30';
}

export function getLiquidationColor(risk: number): string {
  if (risk < 5) return 'text-green-400';
  if (risk < 20) return 'text-yellow-400';
  if (risk < 50) return 'text-orange-400';
  return 'text-red-400';
}

export function calculatePV(faceValue: number, maturityDays: number, rate = 0.05): number {
  const t = maturityDays / 365;
  return faceValue / (1 + rate * t);
}

export function calculateYield(principal: number, depositedAt: Date, rate = 0.05): number {
  const elapsed = (Date.now() - depositedAt.getTime()) / 1000;
  const days = Math.max(1, elapsed / 86400);
  const pv = calculatePV(principal, days, rate);
  return Math.max(0, principal - pv);
}
