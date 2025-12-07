const { ethers } = require('ethers');
const cron = require('node-cron');
const { OracleABI, PredictionMarketABI } = require('../utils/abis');

const RPC_URL = process.env.RPC_URL || process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

let provider;
let wallet;
let oracle;

/**
 * Initialize oracle service
 */
function initializeOracle() {
  if (!ORACLE_ADDRESS || !ORACLE_PRIVATE_KEY) {
    console.log('⚠️  Oracle credentials not set, oracle service disabled');
    return false;
  }

  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
  oracle = new ethers.Contract(ORACLE_ADDRESS, OracleABI, wallet);

  console.log('🔮 Oracle service initialized');
  return true;
}

/**
 * Check markets that need resolution
 */
async function checkMarketsForResolution() {
  if (!oracle) return;

  try {
    // Get all markets from factory (you'd need to track this)
    // For now, we'll check markets that are in the cache
    
    const { getAllMarkets } = require('./eventListener');
    const markets = getAllMarkets();

    for (const marketData of markets) {
      if (marketData.state === 0) { // MarketState.Open
        const endTime = Number(marketData.endTime);
        const now = Math.floor(Date.now() / 1000);
        const resolutionDelay = 3600; // 1 hour

        // Check if market ended and resolution delay has passed
        if (now >= endTime + resolutionDelay) {
          console.log(`⏰ Market ${marketData.address} is ready for resolution`);
          // In production, you'd fetch the actual outcome from an external source
          // For now, this is a placeholder
        }
      }
    }
  } catch (error) {
    console.error('Error checking markets for resolution:', error);
  }
}

/**
 * Resolve a market
 * @param {string} marketAddress - Address of the market
 * @param {boolean} outcome - True if YES won, false if NO won
 */
async function resolveMarket(marketAddress, outcome) {
  if (!oracle) {
    throw new Error('Oracle not initialized');
  }

  try {
    console.log(`🔮 Resolving market ${marketAddress} with outcome: ${outcome ? 'YES' : 'NO'}`);
    
    const tx = await oracle.resolveMarket(marketAddress, outcome);
    console.log(`📝 Resolution transaction: ${tx.hash}`);
    
    await tx.wait();
    console.log(`✅ Market ${marketAddress} resolved successfully`);
    
    return tx.hash;
  } catch (error) {
    console.error(`❌ Error resolving market ${marketAddress}:`, error);
    throw error;
  }
}

/**
 * Submit resolution vote (for multi-sig)
 */
async function submitResolutionVote(marketAddress, outcome) {
  if (!oracle) {
    throw new Error('Oracle not initialized');
  }

  try {
    const tx = await oracle.submitResolution(marketAddress, outcome);
    await tx.wait();
    console.log(`✅ Resolution vote submitted for ${marketAddress}`);
    return tx.hash;
  } catch (error) {
    console.error(`❌ Error submitting vote:`, error);
    throw error;
  }
}

/**
 * Start oracle service
 * Runs periodic checks for markets that need resolution
 */
function startOracleService() {
  try {
    if (!initializeOracle()) {
      console.log('⚠️  Oracle service disabled - ORACLE_ADDRESS or ORACLE_PRIVATE_KEY not set');
      return;
    }

    // Check every 5 minutes for markets that need resolution
    cron.schedule('*/5 * * * *', async () => {
      try {
        await checkMarketsForResolution();
      } catch (error) {
        console.error('Error in oracle cron job:', error);
      }
    });

    console.log('🔮 Oracle service started (checking every 5 minutes)');
  } catch (error) {
    console.error('❌ Error starting oracle service:', error);
    // Don't crash the server, just log the error
  }
}

module.exports = {
  startOracleService,
  resolveMarket,
  submitResolutionVote,
  checkMarketsForResolution
};

