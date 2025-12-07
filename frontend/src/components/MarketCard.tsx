'use client';

import { useContractRead } from 'wagmi';
import { PredictionMarketABI } from '@/abis/PredictionMarket';
import { formatEther, formatUnits } from 'viem';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface MarketCardProps {
  marketAddress: `0x${string}`;
}

export function MarketCard({ marketAddress }: MarketCardProps) {
  const { data: question } = useContractRead({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'marketInfo',
    args: [],
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

  const marketInfo = question as any;
  const yesPriceFormatted = yesPrice ? Number(formatUnits(yesPrice, 18)) : 0;
  const noPriceFormatted = noPrice ? Number(formatUnits(noPrice, 18)) : 0;

  return (
    <Link href={`/market/${marketAddress}`}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-slate-700 cursor-pointer animate-fadeIn">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {marketInfo?.question || 'Loading...'}
          </h3>
          {marketInfo?.requiresVerification && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              🔒 Verified
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">YES</div>
              <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                ${yesPriceFormatted.toFixed(3)}
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">NO</div>
              <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                ${noPriceFormatted.toFixed(3)}
              </div>
            </div>
          </div>

          {marketInfo?.endTime && (
            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ends {formatDistanceToNow(new Date(Number(marketInfo.endTime) * 1000), { addSuffix: true })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

