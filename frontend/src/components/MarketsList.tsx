'use client';

import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { MarketFactoryABI } from '@/abis/MarketFactory';
import { MarketCard } from './MarketCard';
import { fetchMarkets } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';

const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as `0x${string}`;

export function MarketsList() {
  const [marketAddresses, setMarketAddresses] = useState<`0x${string}`[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);

  // Fallback to on-chain if backend not available
  const { data: marketCount } = useContractRead({
    address: MARKET_FACTORY_ADDRESS,
    abi: MarketFactoryABI,
    functionName: 'getMarketCount',
  });

  const { data: allMarkets } = useContractRead({
    address: MARKET_FACTORY_ADDRESS,
    abi: MarketFactoryABI,
    functionName: 'getAllMarkets',
    enabled: !!marketCount && Number(marketCount) > 0,
  });

  // Try to fetch from backend API first
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const response = await fetchMarkets();
        if (response.success && response.markets) {
          setMarkets(response.markets);
          setMarketAddresses(response.markets.map((m: any) => m.address));
        }
      } catch (error) {
        console.log('Backend not available, using on-chain data');
        // Fallback to on-chain
        if (allMarkets) {
          setMarketAddresses(allMarkets as `0x${string}`[]);
        }
      }
    };
    
    loadMarkets();
    const interval = setInterval(loadMarkets, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [allMarkets]);

  // Listen for WebSocket updates
  const { lastMessage } = useWebSocket(marketAddresses);
  
  useEffect(() => {
    if (lastMessage?.type === 'new_market') {
      // Refresh markets list
      fetchMarkets().then(response => {
        if (response.success) {
          setMarkets(response.markets);
          setMarketAddresses(response.markets.map((m: any) => m.address));
        }
      });
    }
  }, [lastMessage]);

  if (marketAddresses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
          No markets yet. Be the first to create one!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {marketAddresses.map((address) => (
        <MarketCard key={address} marketAddress={address} />
      ))}
    </div>
  );
}

