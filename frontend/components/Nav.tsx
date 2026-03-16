'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';
import { LogoMark } from './Logo';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/shield/new', label: 'New Shield' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/chat', label: 'AI Chat' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-bold text-base text-foreground tracking-tight">CrossShield</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors',
                  pathname === href
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-muted-foreground/60">→</span>
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
