export const ReputationManagerABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserReputation',
    outputs: [
      { internalType: 'uint256', name: 'xp', type: 'uint256' },
      { internalType: 'uint8', name: 'tier', type: 'uint8' },
      { internalType: 'bool', name: 'isVerified', type: 'bool' },
      { internalType: 'uint256', name: 'totalPredictions', type: 'uint256' },
      { internalType: 'uint256', name: 'correctPredictions', type: 'uint256' },
      { internalType: 'uint256', name: 'lastUpdate', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getAccuracy',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

