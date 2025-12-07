'use client';

import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { PredictionMarketABI } from '@/abis/PredictionMarket';
import { formatUnits } from 'viem';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketChartProps {
  marketAddress: `0x${string}`;
}

export function MarketChart({ marketAddress }: MarketChartProps) {
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string; yes: number; no: number }>>([]);

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

  useEffect(() => {
    // In production, fetch historical data from events or subgraph
    // For now, we'll simulate with current price
    if (yesPrice && noPrice) {
      const yes = Number(formatUnits(yesPrice, 18));
      const no = Number(formatUnits(noPrice, 18));
      const now = new Date().toLocaleTimeString();

      setPriceHistory((prev) => {
        const newData = [...prev, { time: now, yes, no }];
        // Keep last 20 data points
        return newData.slice(-20);
      });
    }
  }, [yesPrice, noPrice]);

  // If no data, show placeholder
  if (priceHistory.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading chart data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={priceHistory}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" stroke="#6b7280" />
        <YAxis stroke="#6b7280" domain={[0, 1]} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="yes"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          name="YES Price"
        />
        <Line
          type="monotone"
          dataKey="no"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="NO Price"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

