'use client';

import { ASSETS, Asset, formatPrice } from '../lib/assets';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface Props {
  selectedId?: number;
  onSelect: (asset: Asset) => void;
}

const CATEGORIES = ['all', 'commodity', 'crypto', 'realestate'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All Assets',
  commodity: 'Commodities',
  crypto: 'Crypto',
  realestate: 'Real Estate',
};

export function AssetGrid({ selectedId, onSelect }: Props) {
  const [category, setCategory] = useState<Category>('all');

  const filtered = category === 'all' ? ASSETS : ASSETS.filter(a => a.category === category);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              category === cat
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filtered.map(asset => (
          <button
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={cn(
              'p-3 rounded-xl border text-left transition-all card-hover',
              selectedId === asset.id
                ? 'bg-primary/10 border-primary/50 glow-shield'
                : 'bg-card border-border hover:border-primary/30'
            )}
          >
            <div className="text-2xl mb-1">{asset.emoji}</div>
            <p className="text-xs font-semibold truncate">{asset.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{asset.symbol}</p>
            <p className="text-xs font-mono mt-1 text-foreground/70">{formatPrice(asset.mockPrice)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
