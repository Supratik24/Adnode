const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { getMarketData, getAllMarkets, updateMarketCache } = require('../services/eventListener');
const { MarketFactoryABI, PredictionMarketABI } = require('../utils/abis');

const RPC_URL = process.env.RPC_URL || process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const MARKET_FACTORY_ADDRESS = process.env.MARKET_FACTORY_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * GET /api/markets
 * Get all markets
 */
router.get('/', async (req, res) => {
  try {
    const markets = getAllMarkets();
    res.json({ success: true, markets, count: markets.length });
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/markets/:address
 * Get specific market data
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Update cache first
    await updateMarketCache(address);
    
    const marketData = getMarketData(address);
    
    if (!marketData) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
    
    res.json({ success: true, market: marketData });
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/markets/:address/prices
 * Get current prices for a market
 */
router.get('/:address/prices', async (req, res) => {
  try {
    const { address } = req.params;
    const market = new ethers.Contract(address, PredictionMarketABI, provider);
    
    const [yesPrice, noPrice] = await Promise.all([
      market.getYesPrice(),
      market.getNoPrice()
    ]);
    
    res.json({
      success: true,
      prices: {
        yes: yesPrice.toString(),
        no: noPrice.toString(),
        yesFormatted: ethers.formatUnits(yesPrice, 18),
        noFormatted: ethers.formatUnits(noPrice, 18)
      }
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/markets/:address/pool
 * Get pool information
 */
router.get('/:address/pool', async (req, res) => {
  try {
    const { address } = req.params;
    const market = new ethers.Contract(address, PredictionMarketABI, provider);
    
    const poolInfo = await market.getPoolInfo();
    
    res.json({
      success: true,
      pool: {
        yesShares: poolInfo.yesShares.toString(),
        noShares: poolInfo.noShares.toString(),
        liquidity: poolInfo.liquidity.toString(),
        yesSharesFormatted: ethers.formatUnits(poolInfo.yesShares, 18),
        noSharesFormatted: ethers.formatUnits(poolInfo.noShares, 18),
        liquidityFormatted: ethers.formatUnits(poolInfo.liquidity, 6) // USDC has 6 decimals
      }
    });
  } catch (error) {
    console.error('Error fetching pool info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/markets/:address/user/:userAddress
 * Get user's balance for a market
 */
router.get('/:address/user/:userAddress', async (req, res) => {
  try {
    const { address, userAddress } = req.params;
    const market = new ethers.Contract(address, PredictionMarketABI, provider);
    
    const [yesBalance, noBalance] = await market.getUserBalance(userAddress);
    
    res.json({
      success: true,
      balances: {
        yes: yesBalance.toString(),
        no: noBalance.toString(),
        yesFormatted: ethers.formatUnits(yesBalance, 18),
        noFormatted: ethers.formatUnits(noBalance, 18)
      }
    });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

