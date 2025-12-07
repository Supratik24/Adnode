'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction, useContractRead, useBalance } from 'wagmi';
import { PredictionMarketABI } from '@/abis/PredictionMarket';
import { formatUnits, formatEther, parseEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface TradingInterfaceProps {
  marketAddress: `0x${string}`;
}

export function TradingInterface({ marketAddress }: TradingInterfaceProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [isYes, setIsYes] = useState(true);

  // Check native MATIC balance
  const { data: balance } = useBalance({
    address: address,
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

  const { data: userBalance } = useContractRead({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'getUserBalance',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { write: writeBuy, data: hash, isLoading: isPending } = useContractWrite({
    address: marketAddress,
    abi: PredictionMarketABI,
    functionName: 'buyShares',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash,
  });

  const handleBuy = async () => {
    if (!amount || !isConnected) return;

    const amountWei = parseEther(amount); // Convert to wei (18 decimals)

    try {
      writeBuy({
        args: [isYes],
        value: amountWei, // Send native MATIC
      });
      setAmount('');
    } catch (error) {
      console.error('Error buying shares:', error);
    }
  };

  const balanceFormatted = balance ? Number(formatEther(balance.value)).toFixed(4) : '0';
  const amountNum = Number(amount) || 0;
  const hasEnoughBalance = balance ? Number(formatEther(balance.value)) >= amountNum + 0.001 : false;

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trading Interface</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to start trading</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trading Interface</h3>
      
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Balance:</strong> {balanceFormatted} MATIC
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (MATIC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0.001"
            step="0.001"
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prediction
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsYes(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                isYes
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setIsYes(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                !isYes
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        <button
          onClick={handleBuy}
          disabled={!amount || isPending || isConfirming || !hasEnoughBalance || amountNum < 0.001}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {isPending || isConfirming ? 'Processing...' : `Buy ${isYes ? 'YES' : 'NO'}`}
        </button>

        {isSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
            Transaction successful!
          </div>
        )}
      </div>
    </div>
  );
}
