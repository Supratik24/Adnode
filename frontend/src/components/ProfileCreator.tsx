'use client';

import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ReputationManagerABI } from '@/abis/ReputationManager';

const REPUTATION_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS as `0x${string}`;

export function ProfileCreator() {
  const { address, isConnected } = useAccount();
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if profile exists by checking reputation
  const { data: reputation, refetch } = useContractRead({
    address: REPUTATION_MANAGER_ADDRESS,
    abi: ReputationManagerABI,
    functionName: 'getUserReputation',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  });

  useEffect(() => {
    if (isConnected && address && !profileChecked) {
      // Profile is automatically created on first interaction with ReputationManager
      // Just check if it exists, if not it will be created on first use
      setProfileChecked(true);
      refetch();
    }
  }, [isConnected, address, profileChecked, refetch]);

  return null; // This component works silently in the background
}
