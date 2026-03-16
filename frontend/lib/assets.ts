export interface Asset {
  id: number;
  name: string;
  symbol: string;
  category: 'commodity' | 'crypto' | 'realestate';
  mockPrice: bigint;
  emoji: string;
  description: string;
}

export const ASSETS: Asset[] = [
  { id: 0,  name: 'Gold',             symbol: 'XAU', category: 'commodity',   mockPrice: 320000000000n, emoji: '🥇', description: 'Safe-haven precious metal' },
  { id: 1,  name: 'Silver',           symbol: 'XAG', category: 'commodity',   mockPrice: 3200000000n,  emoji: '🥈', description: 'Industrial precious metal' },
  { id: 2,  name: 'Crude Oil',        symbol: 'WTI', category: 'commodity',   mockPrice: 7800000000n,  emoji: '🛢️', description: 'West Texas Intermediate crude' },
  { id: 3,  name: 'Natural Gas',      symbol: 'NG',  category: 'commodity',   mockPrice: 350000000n,   emoji: '⛽', description: 'Energy commodity' },
  { id: 4,  name: 'Bitcoin',          symbol: 'BTC', category: 'crypto',      mockPrice: 8500000000000n, emoji: '₿', description: 'Digital gold' },
  { id: 5,  name: 'Ethereum',         symbol: 'ETH', category: 'crypto',      mockPrice: 220000000000n, emoji: '⟠', description: 'Smart contract platform' },
  { id: 6,  name: 'Solana',           symbol: 'SOL', category: 'crypto',      mockPrice: 14500000000n, emoji: '◎', description: 'High-performance blockchain' },
  { id: 7,  name: 'XRP',              symbol: 'XRP', category: 'crypto',      mockPrice: 55000000n,    emoji: '✕', description: 'Cross-border payments' },
  { id: 8,  name: 'Miami RE',         symbol: 'MIA', category: 'realestate',  mockPrice: 48500000000n, emoji: '🏖️', description: 'Miami real estate index' },
  { id: 9,  name: 'Austin RE',        symbol: 'AUS', category: 'realestate',  mockPrice: 42000000000n, emoji: '🤠', description: 'Austin real estate index' },
  { id: 10, name: 'NYC RE',           symbol: 'NYC', category: 'realestate',  mockPrice: 82000000000n, emoji: '🗽', description: 'New York City real estate index' },
  { id: 11, name: 'LA RE',            symbol: 'LAX', category: 'realestate',  mockPrice: 72000000000n, emoji: '🌴', description: 'Los Angeles real estate index' },
  { id: 12, name: 'Chicago RE',       symbol: 'CHI', category: 'realestate',  mockPrice: 31000000000n, emoji: '🌆', description: 'Chicago real estate index' },
  { id: 13, name: 'Phoenix RE',       symbol: 'PHX', category: 'realestate',  mockPrice: 38000000000n, emoji: '🌵', description: 'Phoenix real estate index' },
  { id: 14, name: 'Denver RE',        symbol: 'DEN', category: 'realestate',  mockPrice: 49000000000n, emoji: '⛰️', description: 'Denver real estate index' },
  { id: 15, name: 'Seattle RE',       symbol: 'SEA', category: 'realestate',  mockPrice: 62000000000n, emoji: '🌧️', description: 'Seattle real estate index' },
  { id: 16, name: 'Portland RE',      symbol: 'PDX', category: 'realestate',  mockPrice: 44500000000n, emoji: '🌹', description: 'Portland real estate index' },
  { id: 17, name: 'Nashville RE',     symbol: 'BNA', category: 'realestate',  mockPrice: 39000000000n, emoji: '🎸', description: 'Nashville real estate index' },
  { id: 18, name: 'Charlotte RE',     symbol: 'CLT', category: 'realestate',  mockPrice: 34000000000n, emoji: '🏈', description: 'Charlotte real estate index' },
  { id: 19, name: 'Atlanta RE',       symbol: 'ATL', category: 'realestate',  mockPrice: 36000000000n, emoji: '🍑', description: 'Atlanta real estate index' },
  { id: 20, name: 'Dallas RE',        symbol: 'DAL', category: 'realestate',  mockPrice: 35000000000n, emoji: '⭐', description: 'Dallas real estate index' },
  { id: 21, name: 'Houston RE',       symbol: 'HOU', category: 'realestate',  mockPrice: 29000000000n, emoji: '🚀', description: 'Houston real estate index' },
  { id: 22, name: 'Boston RE',        symbol: 'BOS', category: 'realestate',  mockPrice: 58000000000n, emoji: '🦞', description: 'Boston real estate index' },
  { id: 23, name: 'San Francisco RE', symbol: 'SFO', category: 'realestate',  mockPrice: 78000000000n, emoji: '🌉', description: 'San Francisco real estate index' },
  { id: 24, name: 'Las Vegas RE',     symbol: 'LAS', category: 'realestate',  mockPrice: 38000000000n, emoji: '🎰', description: 'Las Vegas real estate index' },
];

export function getAsset(id: number): Asset | undefined {
  return ASSETS.find(a => a.id === id);
}

export function formatPrice(price: bigint): string {
  return `$${(Number(price) / 1e8).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getAssetsByCategory(category: Asset['category']): Asset[] {
  return ASSETS.filter(a => a.category === category);
}
