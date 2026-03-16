export interface BacktestEntry {
  assetId: number;
  assetName: string;
  leverage: number;
  avgAnnualizedReturn: number;
  liquidationRisk: number;
  bestCase: number;
  worstCase: number;
}

// Seeded plausible backtest data for all 25 assets × [1,2,5,10,20,50]x
// Constraints: Gold 5x = 5.8%, 10% liq risk | SOL 1x = 44.6%, 0% liq risk
// Higher leverage → higher return AND higher liquidation risk
const LEVERAGE_LEVELS = [1, 2, 5, 10, 20, 50];

interface AssetBaseline {
  assetId: number;
  assetName: string;
  baseReturn: number;      // 1x annualized return %
  baseLiqRisk: number;     // 1x liquidation risk %
  volatility: 'low' | 'medium' | 'high';
}

const ASSET_BASELINES: AssetBaseline[] = [
  { assetId: 0,  assetName: 'Gold',             baseReturn: 1.6,  baseLiqRisk: 2,  volatility: 'low' },
  { assetId: 1,  assetName: 'Silver',           baseReturn: 2.1,  baseLiqRisk: 3,  volatility: 'medium' },
  { assetId: 2,  assetName: 'Crude Oil',        baseReturn: 3.4,  baseLiqRisk: 5,  volatility: 'medium' },
  { assetId: 3,  assetName: 'Natural Gas',      baseReturn: 4.2,  baseLiqRisk: 7,  volatility: 'medium' },
  { assetId: 4,  assetName: 'Bitcoin',          baseReturn: 62,   baseLiqRisk: 0,  volatility: 'high' },
  { assetId: 5,  assetName: 'Ethereum',         baseReturn: 48,   baseLiqRisk: 0,  volatility: 'high' },
  { assetId: 6,  assetName: 'Solana',           baseReturn: 44.6, baseLiqRisk: 0,  volatility: 'high' },
  { assetId: 7,  assetName: 'XRP',              baseReturn: 28,   baseLiqRisk: 0,  volatility: 'high' },
  { assetId: 8,  assetName: 'Miami RE',         baseReturn: 7.2,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 9,  assetName: 'Austin RE',        baseReturn: 8.4,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 10, assetName: 'NYC RE',           baseReturn: 4.8,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 11, assetName: 'LA RE',            baseReturn: 5.6,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 12, assetName: 'Chicago RE',       baseReturn: 3.9,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 13, assetName: 'Phoenix RE',       baseReturn: 9.1,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 14, assetName: 'Denver RE',        baseReturn: 6.8,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 15, assetName: 'Seattle RE',       baseReturn: 7.4,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 16, assetName: 'Portland RE',      baseReturn: 5.2,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 17, assetName: 'Nashville RE',     baseReturn: 10.2, baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 18, assetName: 'Charlotte RE',     baseReturn: 8.8,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 19, assetName: 'Atlanta RE',       baseReturn: 7.6,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 20, assetName: 'Dallas RE',        baseReturn: 6.4,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 21, assetName: 'Houston RE',       baseReturn: 5.9,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 22, assetName: 'Boston RE',        baseReturn: 6.1,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 23, assetName: 'San Francisco RE', baseReturn: 3.8,  baseLiqRisk: 1,  volatility: 'low' },
  { assetId: 24, assetName: 'Las Vegas RE',     baseReturn: 8.3,  baseLiqRisk: 1,  volatility: 'low' },
];

function liqRiskMultiplier(volatility: string, leverage: number): number {
  const base = volatility === 'low' ? 1.5 : volatility === 'medium' ? 2.2 : 3.5;
  return Math.pow(base, Math.log2(leverage));
}

export const BACKTEST_DATA: BacktestEntry[] = ASSET_BASELINES.flatMap(asset =>
  LEVERAGE_LEVELS.map(leverage => {
    // Gold 5x pinned to spec: 5.8% return, 10% liq risk
    if (asset.assetId === 0 && leverage === 5) {
      return { assetId: 0, assetName: 'Gold', leverage: 5, avgAnnualizedReturn: 5.8, liquidationRisk: 10, bestCase: 24.1, worstCase: -5.9 };
    }
    // SOL 1x pinned to spec
    if (asset.assetId === 6 && leverage === 1) {
      return { assetId: 6, assetName: 'Solana', leverage: 1, avgAnnualizedReturn: 44.6, liquidationRisk: 0, bestCase: 312, worstCase: -68 };
    }

    const ret = Math.round(asset.baseReturn * leverage * (1 - (leverage - 1) * 0.02) * 10) / 10;
    const liqRisk = Math.min(95, Math.round(asset.baseLiqRisk * liqRiskMultiplier(asset.volatility, leverage) * 10) / 10);
    const best = Math.round(ret * (2 + leverage * 0.1) * 10) / 10;
    const worst = Math.round(-ret * (0.5 + leverage * 0.05) * 10) / 10;

    return {
      assetId: asset.assetId,
      assetName: asset.assetName,
      leverage,
      avgAnnualizedReturn: ret,
      liquidationRisk: liqRisk,
      bestCase: best,
      worstCase: worst,
    };
  })
);

export function getBacktestEntry(assetId: number, leverage: number): BacktestEntry | undefined {
  return BACKTEST_DATA.find(e => e.assetId === assetId && e.leverage === leverage);
}

export function getAssetBacktest(assetId: number): BacktestEntry[] {
  return BACKTEST_DATA.filter(e => e.assetId === assetId);
}
