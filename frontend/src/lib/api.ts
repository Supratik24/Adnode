const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchMarkets() {
  const response = await fetch(`${API_URL}/api/markets`);
  if (!response.ok) throw new Error('Failed to fetch markets');
  return response.json();
}

export async function fetchMarket(address: string) {
  const response = await fetch(`${API_URL}/api/markets/${address}`);
  if (!response.ok) throw new Error('Failed to fetch market');
  return response.json();
}

export async function fetchMarketPrices(address: string) {
  const response = await fetch(`${API_URL}/api/markets/${address}/prices`);
  if (!response.ok) throw new Error('Failed to fetch prices');
  return response.json();
}

export async function fetchUserBalance(marketAddress: string, userAddress: string) {
  const response = await fetch(`${API_URL}/api/markets/${marketAddress}/user/${userAddress}`);
  if (!response.ok) throw new Error('Failed to fetch user balance');
  return response.json();
}

export async function fetchReputation(userAddress: string) {
  const response = await fetch(`${API_URL}/api/reputation/${userAddress}`);
  if (!response.ok) throw new Error('Failed to fetch reputation');
  return response.json();
}

export async function checkVerification(userAddress: string) {
  const response = await fetch(`${API_URL}/api/polygon-id/verify/${userAddress}`);
  if (!response.ok) throw new Error('Failed to check verification');
  return response.json();
}

