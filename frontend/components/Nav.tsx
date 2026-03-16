'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BarChart3, MessageSquare, LayoutDashboard, TrendingUp } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shield/new', label: 'New Shield', icon: Shield },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">CrossShield</span>
            <span className="hidden sm:block text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Westend</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname === href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
