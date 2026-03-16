'use client';

import { ShieldCheck, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  principal: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PrincipalSafetyBadge({ principal, className, size = 'md' }: Props) {
  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium',
      'bg-green-400/10 border border-green-400/30 text-green-400',
      'glow-green',
      sizes[size],
      className
    )}>
      <ShieldCheck className={iconSizes[size]} />
      <span>Principal Safe</span>
      {principal > 0 && (
        <>
          <Lock className={cn(iconSizes[size], 'ml-1 opacity-60')} />
          <span className="font-mono">
            ${principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </>
      )}
    </div>
  );
}
