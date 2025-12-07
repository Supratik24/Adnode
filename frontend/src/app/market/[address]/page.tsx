'use client';

import { useParams } from 'next/navigation';
import { useContractRead } from 'wagmi';
import { PredictionMarketABI } from '@/abis/PredictionMarket';
import { TradingInterface } from '@/components/TradingInterface';
import { MarketChart } from '@/components/MarketChart';
import { formatDistanceToNow } from 'date-fns';
import { formatUnits } from 'viem';

export default function MarketPage() {
  const params = useParams();
  const marketAddress = params.address as `0x${string}`;

  const { data: marketInfo } = useContractRead({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'marketInfo',
  });

  const { data: yesPrice } = useContractRead({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'getYesPrice',
  });

  const { data: noPrice } = useContractRead({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'getNoPrice',
  });

  const { data: poolInfo } = useContractRead({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'getPoolInfo',
  });

  const info = marketInfo as any;
  const pool = poolInfo as any;
  const yesPriceFormatted = yesPrice ? Number(formatUnits(yesPrice, 18)) : 0;
  const noPriceFormatted = noPrice ? Number(formatUnits(noPrice, 18)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Market Header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {info?.question || 'Loading...'}
                </h1>
                {info?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {info.description}
                  </p>
                )}
              </div>
              {info?.requiresVerification && (
                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                  🔒 Human-Verified Market
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">YES Price</div>
                <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                  ${yesPriceFormatted.toFixed(3)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">NO Price</div>
                <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                  ${noPriceFormatted.toFixed(3)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Liquidity</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {pool ? Number(formatUnits(pool.liquidity, 6)).toLocaleString() : '0'} USDC
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {info?.endTime
                    ? formatDistanceToNow(new Date(Number(info.endTime) * 1000), { addSuffix: true })
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Price Chart
                </h2>
                <MarketChart marketAddress={marketAddress} />
              </div>
            </div>

            {/* Trading Interface */}
            <div className="lg:col-span-1">
              <TradingInterface marketAddress={marketAddress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

