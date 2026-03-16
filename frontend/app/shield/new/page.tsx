'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, ChevronRight, Check } from 'lucide-react';
import { AssetGrid } from '../../../components/AssetGrid';
import { LeverageSlider } from '../../../components/LeverageSlider';
import { RiskAnalysisPanel } from '../../../components/RiskAnalysisPanel';
import { Asset, ASSETS } from '../../../lib/assets';
import { useOpenShield } from '../../../hooks/useVault';
import { useAccount } from 'wagmi';
import { cn } from '../../../lib/utils';

const STEPS = ['Choose Asset', 'Set Leverage', 'Risk Analysis', 'Confirm'];

function NewShieldContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const initialAssetId = Number(params.get('assetId') ?? 0);
  const initialLeverage = Number(params.get('leverage') ?? 1);

  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[initialAssetId] ?? ASSETS[0]);
  const [leverage, setLeverage] = useState(initialLeverage || 1);
  const [txError, setTxError] = useState('');
  const { openShield, isPending, isConfirming, isSuccess } = useOpenShield();

  // Redirect once TX is confirmed on-chain
  useEffect(() => {
    if (isSuccess) {
      router.push('/dashboard');
    }
  }, [isSuccess, router]);

  async function handleOpen() {
    setTxError('');
    try {
      await openShield(selectedAsset.id, leverage, address ? {
        walletAddress: address,
        assetName: selectedAsset.name,
        assetEmoji: selectedAsset.emoji,
      } : undefined);
      // Router push is handled by the isSuccess effect above
    } catch (e: any) {
      console.error('Failed to open shield:', e);
      setTxError(e?.shortMessage ?? e?.message ?? 'Transaction failed');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Open a Shield</h1>
        <p className="text-muted-foreground text-sm">Use your yield as margin for leveraged exposure. Principal always protected.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                step === i + 1 ? 'bg-primary/20 text-primary' : step > i + 1 ? 'text-green-400' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                step === i + 1 ? 'bg-primary text-primary-foreground' :
                step > i + 1 ? 'bg-green-400 text-black' : 'bg-muted text-muted-foreground'
              )}>
                {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 1: Asset */}
      {step === 1 && (
        <div className="space-y-6">
          <AssetGrid selectedId={selectedAsset.id} onSelect={asset => {
            setSelectedAsset(asset);
            setStep(2);
          }} />
        </div>
      )}

      {/* Step 2: Leverage */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedAsset.emoji}</span>
              <div>
                <p className="font-semibold">{selectedAsset.name}</p>
                <p className="text-xs text-muted-foreground">{selectedAsset.description}</p>
              </div>
            </div>
            <LeverageSlider assetId={selectedAsset.id} value={leverage} onChange={setLeverage} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl text-sm hover:bg-accent transition-colors">Back</button>
            <button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Risk Analysis */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedAsset.emoji}</span>
              <div>
                <p className="font-semibold">{selectedAsset.name} {leverage}x Shield</p>
                <p className="text-xs text-muted-foreground">Position will use your accrued yield as margin</p>
              </div>
            </div>
          </div>
          <RiskAnalysisPanel
            assetName={selectedAsset.name}
            leverage={leverage}
            amount={1000}
            onProceed={() => setStep(4)}
            onCancel={() => setStep(2)}
          />
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Confirm Position</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Asset</span>
                <div className="flex items-center gap-2">
                  <span>{selectedAsset.emoji}</span>
                  <span className="font-medium">{selectedAsset.name}</span>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Leverage</span>
                <span className={cn('font-bold font-mono', leverage >= 20 ? 'text-orange-400' : leverage >= 10 ? 'text-yellow-400' : 'text-green-400')}>{leverage}x</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Margin</span>
                <span className="text-blue-400">Your accrued yield</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Principal risk</span>
                <span className="text-green-400 font-semibold">$0 (100% protected)</span>
              </div>
            </div>
            <div className="bg-green-400/5 border border-green-400/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <p className="text-xs text-green-400">Your principal deposit is always 100% protected regardless of outcome.</p>
              </div>
            </div>
          </div>
          {txError && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
              <p className="text-xs text-red-400">{txError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} disabled={isPending || isConfirming} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl text-sm hover:bg-accent transition-colors disabled:opacity-50">Back</button>
            <button
              onClick={handleOpen}
              disabled={isPending || isConfirming}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isConfirming ? 'Confirming…' : isPending ? 'Opening…' : 'Open Shield'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewShieldPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <NewShieldContent />
    </Suspense>
  );
}
