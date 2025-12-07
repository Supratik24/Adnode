'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction, useBalance } from 'wagmi';
import { MarketFactoryABI } from '@/abis/MarketFactory';
import { formatEther, parseEther } from 'viem';

const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as `0x${string}`;

export function CreateMarketButton() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [endTime, setEndTime] = useState('');
  const [liquidity, setLiquidity] = useState('0.05'); // MATIC amount (minimum 0.05)
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [step, setStep] = useState<'form' | 'creating'>('form');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check native MATIC balance
  const { data: balance } = useBalance({
    address: address,
  });

  const { write: writeCreate, data: createHash, isLoading: isCreating, isError: isCreateError, error: createError } = useContractWrite({
    address: MARKET_FACTORY_ADDRESS,
    abi: MarketFactoryABI,
    functionName: 'createMarket',
  });

  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess, isError: isTxError, error: txError } = useWaitForTransaction({
    hash: createHash,
  });

  useEffect(() => {
    if (isCreateSuccess) {
      setTimeout(() => {
        setIsOpen(false);
        setStep('form');
        setQuestion('');
        setDescription('');
        setEndTime('');
        setLiquidity('0.05');
        setRequiresVerification(false);
        setErrorMsg(null);
        window.location.reload();
      }, 2000);
    }
  }, [isCreateSuccess]);

  useEffect(() => {
    if (isCreateError && createError) {
      const msg = String(createError.message || createError.toString());
      let friendly = msg;
      if (msg.includes('Invalid question')) friendly = 'Question is invalid or too long.';
      else if (msg.includes('Description too long')) friendly = 'Description exceeds 1000 characters.';
      else if (msg.includes('End time too soon')) friendly = 'End time must be at least 1 day from now.';
      else if (msg.includes('End time too far')) friendly = 'End time must be within 1 year from now.';
      else if (msg.includes('Insufficient liquidity')) friendly = 'Liquidity must be at least 0.05 MATIC.';
      else if (msg.includes('Excessive liquidity')) friendly = 'Liquidity is too large.';
      else if (msg.includes('Insufficient reputation')) friendly = 'Your reputation is insufficient to create a market.';
      else if (msg.includes('Not verified')) friendly = 'You must be verified to create a verified-only market.';
      setErrorMsg(friendly);
      setStep('form');
    } else if (isTxError && txError) {
      const msg = String(txError.message || txError.toString());
      setErrorMsg(msg);
      setStep('form');
    }
  }, [isCreateError, createError, isTxError, txError]);

  const handleCreate = async () => {
    if (!question || !endTime || !liquidity || !isConnected) return;
    if (!MARKET_FACTORY_ADDRESS || MARKET_FACTORY_ADDRESS.length !== 42) {
      setErrorMsg('MarketFactory address is not configured. Update frontend .env.local.');
      return;
    }

    const liquidityAmount = parseEther(liquidity); // Convert to wei (18 decimals for MATIC)
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
    
    setStep('creating');
    setErrorMsg(null);
    writeCreate({
      args: [question, description, BigInt(endTimestamp), requiresVerification],
      value: liquidityAmount, // Send native MATIC
    });
  };

  const balanceFormatted = balance ? Number(formatEther(balance.value)).toFixed(4) : '0';
  const liquidityNum = Number(liquidity) || 0;
  const hasEnoughBalance = balance ? Number(formatEther(balance.value)) >= liquidityNum + 0.001 : false; // +0.001 for gas
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-2xl transition-all shadow-lg hover:scale-105 transform"
      >
        + Create Market
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-3xl w-full shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Market
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setStep('form');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {step === 'form' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Balance:</strong> {balanceFormatted} MATIC
                    {!hasEnoughBalance && liquidityNum > 0 && (
                      <span className="ml-2 text-red-600 dark:text-red-400">(Insufficient balance)</span>
                    )}
                  </p>
                </div>

                {(!MARKET_FACTORY_ADDRESS || MARKET_FACTORY_ADDRESS.length !== 42) && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                    Contract address is missing. Set `NEXT_PUBLIC_MARKET_FACTORY_ADDRESS` in `.env.local`.
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Market Question *
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Will ETH reach $5,000 by end of month?"
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{question.length}/200 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional context, sources, or details about this market..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description.length}/1000 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      min={minDate}
                      max={maxDate}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Between 1 day and 1 year from now</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Initial Liquidity (MATIC) *
                    </label>
                    <input
                      type="number"
                      value={liquidity}
                      onChange={(e) => setLiquidity(e.target.value)}
                      min="0.05"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-all"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum: 0.05 MATIC</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <input
                    type="checkbox"
                    id="verification"
                    checked={requiresVerification}
                    onChange={(e) => setRequiresVerification(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <label htmlFor="verification" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    <strong>Require human verification</strong> - Only verified users can trade on this market (recommended for high-stakes markets)
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setStep('form');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!question || !endTime || !liquidity || !hasEnoughBalance || liquidityNum < 0.05 || isCreating || isCreateConfirming || !MARKET_FACTORY_ADDRESS || MARKET_FACTORY_ADDRESS.length !== 42}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    {isCreating || isCreateConfirming ? 'Creating...' : 'Create Market'}
                  </button>
                </div>
              </div>
            )}

            {step === 'creating' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Creating Market</h3>
                <p className="text-gray-600 dark:text-gray-400">Your market is being created on-chain...</p>
                {(isCreating || isCreateConfirming) && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">Waiting for confirmation...</p>
                )}
              </div>
            )}

            {isCreateSuccess && (
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl text-center">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">Market Created Successfully!</h3>
                <p className="text-green-600 dark:text-green-400">Your market is now live and ready for trading.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
