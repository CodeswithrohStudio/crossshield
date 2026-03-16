import Link from 'next/link';
import { Shield, TrendingUp, Lock, Zap, ArrowRight, BarChart3, Globe } from 'lucide-react';

const STATS = [
  { label: 'Gold Shield 5x', value: '5.8%', sub: 'annualized, 10% liq risk', color: 'text-yellow-400' },
  { label: 'SOL Shield 1x', value: '44.6%', sub: 'annualized, 0% liq risk', color: 'text-purple-400' },
  { label: 'Principal Protected', value: '100%', sub: 'always, guaranteed', color: 'text-green-400' },
];

const PERSONAS = [
  {
    icon: '🏦',
    title: 'The Saver',
    subtitle: 'Principal Protection First',
    description: 'You have $5,000 saved and want to beat inflation without risking your nest egg. CrossShield locks your principal in a zero-coupon bond structure — you always get back exactly what you put in.',
    cta: 'Protect My Savings',
    href: '/shield/new?preset=conservative',
    color: 'border-green-400/30 hover:border-green-400/60',
    badge: 'bg-green-400/10 text-green-400',
    badgeText: 'Zero Risk to Principal',
  },
  {
    icon: '📈',
    title: 'The Believer',
    subtitle: 'Yield-Powered Upside',
    description: "You're bullish on gold or real estate long-term. Use CrossShield to deploy your yield as leveraged exposure — if you're right, you win big. If you're wrong, you still keep everything.",
    cta: 'Deploy My Yield',
    href: '/shield/new?preset=moderate',
    color: 'border-blue-400/30 hover:border-blue-400/60',
    badge: 'bg-blue-400/10 text-blue-400',
    badgeText: 'Best Risk/Reward',
  },
  {
    icon: '🎯',
    title: 'The Degen',
    subtitle: 'Full Leverage, Full Send',
    description: '50x leveraged SOL exposure with your yield as margin. If you win, you win HUGE. If you lose, you just lose the yield — your $10,000 principal walks away untouched.',
    cta: 'Max Leverage',
    href: '/shield/new?preset=aggressive',
    color: 'border-purple-400/30 hover:border-purple-400/60',
    badge: 'bg-purple-400/10 text-purple-400',
    badgeText: 'Principal Still Safe',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Deposit USDC', desc: 'Lock your principal in the CrossShield vault. Zero-coupon bond math guarantees 100% return at maturity.' },
  { step: '02', title: 'Yield Accrues', desc: 'Your deposit earns 5% APY from the DeFi protocol. This yield becomes your risk budget.' },
  { step: '03', title: 'Open a Shield', desc: 'Use yield as margin for leveraged positions on gold, crypto, or real estate via XCM to parachains.' },
  { step: '04', title: 'Win or Draw', desc: 'If the trade wins, you get principal + leveraged profit. If it loses, yield absorbs it. You never lose principal.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1.5 rounded-full mb-6">
            <Globe className="w-3.5 h-3.5" />
            Built on Polkadot Hub — EVM + PVM + XCM
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Your savings,</span>
            <br />
            <span className="text-primary">protected.</span>
            <br />
            <span className="text-foreground">Your yield,</span>
            <br />
            <span className="text-blue-400">working.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Principal-protected DeFi vaults with AI risk interception. Deposit USDC, earn leveraged exposure to gold, crypto, and real estate — your original investment is always safe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors glow-green"
            >
              <Shield className="w-5 h-5" />
              Open App
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 bg-card border border-border px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-accent transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              View Backtest Data
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className={`text-4xl font-bold font-mono mb-1 ${stat.color}`}>{stat.value}</p>
              <p className="font-semibold text-sm mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How CrossShield Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Zero-coupon bond math from Goldman Sachs structured notes, democratized for DeFi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-black text-primary/10 mb-3">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal Protection Math */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 text-xs px-3 py-1.5 rounded-full mb-6">
            <Lock className="w-3.5 h-3.5" />
            Zero-Coupon Bond Math
          </div>
          <h2 className="text-3xl font-bold mb-6">How Your Principal Is Protected</h2>
          <div className="bg-card border border-border rounded-2xl p-8 text-left">
            <div className="font-mono text-sm space-y-3">
              <div className="text-muted-foreground">// Example: $1,000 deposited, 1 year, 5% rate</div>
              <div><span className="text-blue-400">PV</span> = <span className="text-green-400">FV</span> / (1 + r)^t</div>
              <div><span className="text-blue-400">PV</span> = <span className="text-green-400">$1,000</span> / (1 + 0.05)^1 = <span className="text-yellow-400">$952.38</span></div>
              <div className="text-muted-foreground">// $952.38 is locked to guarantee $1,000 at maturity</div>
              <div><span className="text-purple-400">Yield available</span> = $1,000 - $952.38 = <span className="text-purple-400">$47.62</span></div>
              <div className="text-muted-foreground">// This $47.62 is your risk budget for leveraged positions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="px-4 py-16 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Who Is CrossShield For?</h2>
          <p className="text-muted-foreground text-center mb-12">Three ways to use the same principal-protected vault</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERSONAS.map(p => (
              <div key={p.title} className={`bg-card border rounded-2xl p-6 transition-all card-hover ${p.color}`}>
                <div className="text-4xl mb-4">{p.icon}</div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.badge}`}>{p.badgeText}</span>
                <h3 className="text-xl font-bold mt-3 mb-1">{p.title}</h3>
                <p className="text-sm text-primary mb-3">{p.subtitle}</p>
                <p className="text-sm text-muted-foreground mb-6">{p.description}</p>
                <Link
                  href={p.href}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Polkadot section */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Built on Polkadot Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'EVM Compatible', desc: 'Solidity contracts deployed directly to Polkadot Asset Hub. MetaMask works natively.', icon: '⚡' },
              { title: 'PVM Risk Engine', desc: 'ink! Rust contract analyzes every transaction on the Polkadot VM for AI-powered risk scoring.', icon: '🛡️' },
              { title: 'XCM Positions', desc: 'Cross-chain messages route leveraged positions to parachains via Polkadot\'s native XCM protocol.', icon: '🌐' },
            ].map(item => (
              <div key={item.title} className="bg-card border border-border rounded-xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to protect your savings?</h2>
          <p className="text-muted-foreground mb-8">Connect your wallet and start earning leveraged yield — your principal never leaves your hands.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Start Shielding
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        CrossShield — Built for the Polkadot Solidity Hackathon 2025 • EVM Track + PVM Track •{' '}
        <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
      </footer>
    </div>
  );
}
