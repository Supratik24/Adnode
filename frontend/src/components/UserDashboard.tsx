'use client';

import { useAccount, useContractRead } from 'wagmi';
import { ReputationManagerABI } from '@/abis/ReputationManager';
import { formatUnits } from 'viem';

const REPUTATION_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS as `0x${string}`;

export function UserDashboard() {
  const { address } = useAccount();

  const { data: reputation } = useContractRead({
    address: REPUTATION_MANAGER_ADDRESS,
    abi: ReputationManagerABI,
    functionName: 'getUserReputation',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: accuracy } = useContractRead({
    address: REPUTATION_MANAGER_ADDRESS,
    abi: ReputationManagerABI,
    functionName: 'getAccuracy',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const rep = reputation as any;
  const tierNames = ['Base', 'Bronze', 'Silver', 'Gold', 'Oracle'];
  const tier = rep ? tierNames[rep.tier] : 'Base';
  const xp = rep ? Number(rep.xp) : 0;
  const isVerified = rep ? rep.isVerified : false;
  const accuracyRate = accuracy ? Number(accuracy) : 0;

  return (
    <div className="flex items-center space-x-4">
      {isVerified && (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
          ✓ Verified
        </span>
      )}
      <div className="text-sm">
        <div className="font-semibold text-gray-900 dark:text-white">{tier}</div>
        <div className="text-gray-600 dark:text-gray-400">{xp} XP</div>
      </div>
      {accuracyRate > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {accuracyRate}% accuracy
        </div>
      )}
    </div>
  );
}

