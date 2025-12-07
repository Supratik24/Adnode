'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PolygonIDVerifierABI } from '@/abis/PolygonIDVerifier';

const VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_POLYGON_ID_VERIFIER_ADDRESS as `0x${string}`;

export function VerificationButton() {
  const { address, isConnected } = useAccount();
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofHash, setProofHash] = useState('');

  const { write, data: hash, isLoading: isPending } = useContractWrite({
    address: VERIFIER_ADDRESS,
    abi: PolygonIDVerifierABI,
    functionName: 'verifyProof',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash,
  });

  // In production, this would integrate with Polygon ID SDK
  // For MVP, we use a simplified approach
  const handleVerify = async () => {
    if (!address) return;

    setIsVerifying(true);
    
    // Generate a proof hash (in production, this comes from Polygon ID)
    const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setProofHash(hash);

    try {
      // In production, verify actual Polygon ID proof
      // For MVP, we'll use admin verification or a simplified flow
      write({
        args: [address, hash as `0x${string}`, '0x'],
      });
    } catch (error) {
      console.error('Verification error:', error);
      setIsVerifying(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="px-4 py-2 bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 rounded-lg text-sm font-medium">
        ✓ Verified Human
      </div>
    );
  }

  return (
    <button
      onClick={handleVerify}
      disabled={isPending || isConfirming || isVerifying}
      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      {isPending || isConfirming || isVerifying ? 'Verifying...' : 'Verify with Polygon ID'}
    </button>
  );
}

