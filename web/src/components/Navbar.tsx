'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AdnodeLogo from './AdnodeLogo';

export default function Navbar() {
  const pathname = usePathname();
  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
    }`;

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <AdnodeLogo href="/" size="md" />

          <div className="hidden sm:flex sm:items-center gap-1">
            <Link href="/advertiser" className={linkClass('/advertiser')}>
              Advertisers
            </Link>
            <Link href="/host" className={linkClass('/host')}>
              Hosts
            </Link>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
          </div>

          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}