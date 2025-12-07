'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { MarketsList } from '@/components/MarketsList';
import { Header } from '@/components/Header';
import { CreateMarketButton } from '@/components/CreateMarketButton';
import { ProfileCreator } from '@/components/ProfileCreator';

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ProfileCreator />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Decentralized Prediction Markets
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Trade on the future with AMM-based pricing on Polygon Amoy
          </p>
          
          {mounted && !isConnected && (
            <div className="flex justify-center mb-8">
              <ConnectButton />
            </div>
          )}
          
          {mounted && isConnected && (
            <div className="flex justify-center gap-4 mb-8">
              <CreateMarketButton />
            </div>
          )}
        </div>

        <MarketsList />
      </div>
    </main>
  );
}
