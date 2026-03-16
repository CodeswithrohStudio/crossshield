import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Nav } from '../components/Nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CrossShield — Principal-Protected DeFi Vaults',
  description: 'Your savings, protected. Your yield, working. Zero-loss structured vaults on Polkadot Hub.',
  keywords: ['DeFi', 'Polkadot', 'yield', 'principal protection', 'structured products'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} gradient-shield min-h-screen`}>
        <Providers>
          <Nav />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
