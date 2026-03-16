import Link from 'next/link';
import { Shield, TrendingUp, Lock, Zap, ArrowRight, BarChart3, Globe, Cpu, Layers } from 'lucide-react';
import { LogoMark } from '../components/Logo';

const FEATURES = [
  {
    icon: Lock,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'Principal Protected',
    description: 'Your original deposit is locked using zero-coupon bond math — guaranteed to return 100% of your principal at maturity, always.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    title: 'Leveraged Yield',
    description: 'Your yield becomes risk capital for leveraged positions on gold, crypto, and real estate. Win big on upside, lose nothing on the downside.',
  },
  {
    icon: Zap,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    title: 'AI Risk Interception',
    description: 'Every transaction is analyzed by an on-chain ink! smart contract on PVM. The AI flags dangerous positions before they execute.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Deposit USDC', desc: 'Lock your principal in the CrossShield vault. Zero-coupon bond math guarantees 100% return at maturity.' },
  { step: '02', title: 'Yield Accrues', desc: 'Your deposit earns 5% APY from the DeFi protocol. This yield becomes your risk budget.' },
  { step: '03', title: 'Open a Shield', desc: 'Use yield as margin for leveraged positions on gold, crypto, or real estate via XCM to parachains.' },
  { step: '04', title: 'Win or Draw', desc: 'If the trade wins, you get principal + leveraged profit. If it loses, yield absorbs it — you never lose principal.' },
];

const PERSONAS = [
  {
    icon: '🏦',
    title: 'The Saver',
    subtitle: 'Zero Risk to Principal',
    description: 'You have $5,000 saved and want to beat inflation without risking your nest egg. CrossShield locks your principal in a zero-coupon bond structure.',
    cta: 'Protect My Savings',
    href: '/shield/new?preset=conservative',
    accent: 'text-green-600',
    badge: 'bg-green-50 text-green-700 border border-green-100',
  },
  {
    icon: '📈',
    title: 'The Believer',
    subtitle: 'Best Risk / Reward',
    description: "You're bullish on gold or real estate long-term. Deploy your yield as leveraged exposure — if you're right, you win big. If wrong, you still keep everything.",
    cta: 'Deploy My Yield',
    href: '/shield/new?preset=moderate',
    accent: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border border-blue-100',
  },
  {
    icon: '🎯',
    title: 'The Degen',
    subtitle: 'Principal Still Safe',
    description: '50x leveraged SOL exposure with your yield as margin. Win HUGE. If you lose, you just lose the yield — your $10,000 principal walks away untouched.',
    cta: 'Max Leverage',
    href: '/shield/new?preset=aggressive',
    accent: 'text-purple-600',
    badge: 'bg-purple-50 text-purple-700 border border-purple-100',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="pt-20 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Logo icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
            <LogoMark size={38} />
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground mb-4 leading-[1.1]">
            Earn leveraged yield
          </h1>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-muted-foreground/40 mb-6 leading-[1.1]">
            never lose your savings
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Principal-protected DeFi vaults with AI risk interception. Deposit USDC, earn leveraged exposure to gold, crypto, and real estate.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors shadow-sm"
            >
              Open App
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 bg-white border border-gray-200 text-foreground px-7 py-3 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              View Backtest Data
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: '5.8%', label: 'Gold Shield 5x', sub: 'annualized, 10% liq risk', color: 'text-yellow-600' },
            { value: '44.6%', label: 'SOL Shield 1x', sub: 'annualized, 0% liq risk', color: 'text-purple-600' },
            { value: '100%', label: 'Principal Protected', sub: 'always, guaranteed', color: 'text-green-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className={`text-4xl font-black font-mono mb-1 ${stat.color}`}>{stat.value}</p>
              <p className="font-semibold text-sm text-foreground mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Features</span>
            <h2 className="text-4xl font-black text-foreground mb-3">Everything you need to stay protected</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Forget risky DeFi. Built for people who want upside without the downside.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 card-hover">
                <div className={`w-14 h-14 ${f.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                  <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + Code */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left: text */}
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">How Your Principal Is Protected</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Zero-coupon bond math from Goldman Sachs structured notes, democratized for DeFi. We lock a discounted amount to guarantee your full principal back at maturity — the surplus is your risk budget.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 inline-block">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-1">The formula</p>
                  <p className="text-sm font-mono text-foreground">PV = FV / (1 + r)^t</p>
                </div>
              </div>

              {/* Right: code block */}
              <div className="code-block p-6 text-sm font-mono leading-relaxed">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-3 text-xs text-gray-400">protection_math.ts</span>
                </div>
                <div className="space-y-1.5 text-gray-400">
                  <div className="text-gray-500">{'// Example: $1,000 deposited, 5% rate'}</div>
                  <div><span className="text-blue-400">const</span> <span className="text-green-300">PV</span> = FV / (1 + r)^t</div>
                  <div className="text-gray-500">{'// $952.38 locked → guarantees $1,000'}</div>
                  <div><span className="text-blue-400">const</span> <span className="text-purple-300">locked</span> = <span className="text-yellow-300">952.38</span></div>
                  <div><span className="text-blue-400">const</span> <span className="text-orange-300">budget</span> = <span className="text-yellow-300">47.62</span> <span className="text-gray-500">// your yield</span></div>
                  <div className="mt-3 text-gray-500">{'// Open leveraged positions with budget'}</div>
                  <div><span className="text-blue-400">await</span> vault.<span className="text-green-300">openShield</span>{'({'}</div>
                  <div className="ml-4">margin: budget,</div>
                  <div className="ml-4">leverage: <span className="text-yellow-300">5</span>,</div>
                  <div className="ml-4">asset: <span className="text-orange-300">&apos;GOLD&apos;</span></div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-foreground mb-3">How CrossShield Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Four steps, zero principal risk.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-hover">
                <div className="text-5xl font-black text-gray-100 mb-3 leading-none">{item.step}</div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-foreground mb-3">Who Is CrossShield For?</h2>
            <p className="text-muted-foreground">Three ways to use the same principal-protected vault.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PERSONAS.map(p => (
              <div key={p.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 card-hover flex flex-col">
                <div className="text-4xl mb-5">{p.icon}</div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-block w-fit mb-4 ${p.badge}`}>
                  {p.subtitle}
                </span>
                <h3 className="text-xl font-black text-foreground mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{p.description}</p>
                <Link
                  href={p.href}
                  className={`flex items-center gap-1.5 text-sm font-semibold ${p.accent} hover:gap-2.5 transition-all`}
                >
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built on Polkadot */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-foreground mb-3">Built on Polkadot Hub</h2>
            <p className="text-muted-foreground">EVM + PVM + XCM — the best of all chains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500', title: 'EVM Compatible', desc: 'Solidity contracts on Polkadot Asset Hub. MetaMask works natively.' },
              { icon: Cpu, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', title: 'PVM Risk Engine', desc: 'ink! Rust contract analyzes every transaction on Polkadot VM for AI-powered risk scoring.' },
              { icon: Globe, iconBg: 'bg-purple-50', iconColor: 'text-purple-500', title: 'XCM Positions', desc: "Cross-chain messages route leveraged positions to parachains via Polkadot's native XCM." },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 card-hover">
                <div className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto bg-foreground rounded-3xl p-14 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to protect your savings?</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">Connect your wallet and start earning leveraged yield — your principal never leaves your hands.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-foreground px-8 py-3.5 rounded-xl font-bold text-base hover:bg-gray-100 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Start Shielding
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="text-sm font-semibold text-foreground">CrossShield</span>
            <span className="text-xs text-muted-foreground">— Polkadot Solidity Hackathon 2025</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
            <Link href="/analytics" className="hover:text-foreground transition-colors">Backtest Data</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
