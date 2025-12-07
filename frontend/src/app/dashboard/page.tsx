'use client';

import { useAccount, useContractRead } from 'wagmi';
import { MarketFactoryABI } from '@/abis/MarketFactory';
import { ReputationManagerABI } from '@/abis/ReputationManager';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { UserDashboard } from '@/components/UserDashboard';
import { MarketCard } from '@/components/MarketCard';
import { MarketsList } from '@/components/MarketsList';
import { ProfileCreator } from '@/components/ProfileCreator';
import { CreateMarketButton } from '@/components/CreateMarketButton';

const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as `0x${string}`;
const REPUTATION_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS as `0x${string}`;

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Get user's markets
  const { data: userMarkets } = useContractRead({
    address: MARKET_FACTORY_ADDRESS,
    abi: MarketFactoryABI,
    functionName: 'getUserMarkets',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Get all markets
  const { data: allMarkets } = useContractRead({
    address: MARKET_FACTORY_ADDRESS,
    abi: MarketFactoryABI,
    functionName: 'getAllMarkets',
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Connect Your Wallet
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Connect your wallet to view your dashboard and start trading
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const markets = (userMarkets as `0x${string}`[]) || [];
  const allMarketsList = (allMarkets as `0x${string}`[]) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ProfileCreator />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <CreateMarketButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Reputation
            </h2>
            <UserDashboard />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Your Markets
            </h2>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {markets.length}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Markets you created</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Markets
            </h2>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {allMarketsList.length}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All active markets</p>
          </div>
        </div>

        {/* User's Markets */}
        {markets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Your Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((marketAddress) => (
                <MarketCard key={marketAddress} marketAddress={marketAddress} />
              ))}
            </div>
          </div>
        )}

        {/* All Markets */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            All Markets
          </h2>
          <MarketsList />
        </div>
      </div>
    </div>
  );
}
