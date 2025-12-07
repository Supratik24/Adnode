const { ethers } = require('ethers');
const { MarketFactoryABI, PredictionMarketABI } = require('../utils/abis');

const RPC_URL = process.env.RPC_URL || process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const MARKET_FACTORY_ADDRESS = process.env.MARKET_FACTORY_ADDRESS;

// In-memory cache for market data
const marketCache = new Map();

let provider;
let marketFactory;

function initializeProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    if (MARKET_FACTORY_ADDRESS) {
      marketFactory = new ethers.Contract(
        MARKET_FACTORY_ADDRESS,
        MarketFactoryABI,
        provider
      );
    }
  }
  return provider;
}

/**
 * Listen for new market creation events
 */
async function listenForNewMarkets() {
  if (!marketFactory) {
    console.log('⚠️  MarketFactory address not set, skipping event listener');
    return;
  }

  try {
    console.log('👂 Listening for new markets...');
    
    // Use once() for each event to avoid filter issues, then poll
    let lastBlock = await provider.getBlockNumber();
    
    setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > lastBlock) {
          const filter = marketFactory.filters.MarketCreated();
          const events = await marketFactory.queryFilter(filter, lastBlock, currentBlock);
          
          for (const event of events) {
            const [marketAddress, creator, question, endTime] = event.args;
            console.log(`📊 New market created: ${marketAddress}`);
            console.log(`   Question: ${question}`);
            console.log(`   Creator: ${creator}`);
            
            await updateMarketCache(marketAddress);
            await setupMarketListener(marketAddress);
            
            broadcastToClients({
              type: 'new_market',
              market: marketAddress,
              question: question,
              creator: creator
            });
          }
          
          lastBlock = currentBlock;
        }
      } catch (error) {
        // Silently handle filter errors - they're expected
        if (!error.message?.includes('filter not found')) {
          console.error('Error polling for new markets:', error.message);
        }
      }
    }, 5000); // Poll every 5 seconds
  } catch (error) {
    console.error('Error setting up market listener:', error);
  }
}

/**
 * Listen for trading events on all markets
 */
async function listenForTrades() {
  if (!marketFactory) return;

  try {
    // Get all existing markets
    const markets = await marketFactory.getAllMarkets();
    console.log(`📈 Found ${markets.length} existing markets, setting up listeners...`);

    for (const marketAddress of markets) {
      await setupMarketListener(marketAddress);
      await updateMarketCache(marketAddress);
    }
  } catch (error) {
    console.error('Error setting up trade listeners:', error);
  }
}

// Track which markets we're already polling
const polledMarkets = new Set();

/**
 * Setup listener for a specific market (using polling instead of events)
 */
async function setupMarketListener(marketAddress) {
  if (polledMarkets.has(marketAddress)) return;
  polledMarkets.add(marketAddress);
  
  try {
    const market = new ethers.Contract(marketAddress, PredictionMarketABI, provider);
    let lastBlock = await provider.getBlockNumber();
    
    setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > lastBlock) {
          // Poll for SharesPurchased events
          const tradeFilter = market.filters.SharesPurchased();
          const tradeEvents = await market.queryFilter(tradeFilter, lastBlock, currentBlock);
          
          for (const event of tradeEvents) {
            const [buyer, isYes, investmentAmount, sharesReceived, yesPrice, noPrice] = event.args;
            console.log(`💰 Trade on ${marketAddress}: ${buyer} bought ${sharesReceived} ${isYes ? 'YES' : 'NO'} shares`);
            
            await updateMarketCache(marketAddress);
            
            broadcastToClients({
              type: 'trade',
              market: marketAddress,
              buyer: buyer,
              isYes: isYes,
              shares: sharesReceived.toString(),
              yesPrice: yesPrice.toString(),
              noPrice: noPrice.toString()
            });
          }
          
          // Poll for MarketResolved events
          const resolveFilter = market.filters.MarketResolved();
          const resolveEvents = await market.queryFilter(resolveFilter, lastBlock, currentBlock);
          
          for (const event of resolveEvents) {
            const [outcome, timestamp] = event.args;
            console.log(`✅ Market resolved: ${marketAddress}, Outcome: ${outcome}`);
            
            await updateMarketCache(marketAddress);
            
            broadcastToClients({
              type: 'market_resolved',
              market: marketAddress,
              outcome: outcome
            });
          }
          
          lastBlock = currentBlock;
        }
      } catch (error) {
        // Silently handle filter errors
        if (!error.message?.includes('filter not found')) {
          console.error(`Error polling market ${marketAddress}:`, error.message);
        }
      }
    }, 5000); // Poll every 5 seconds
  } catch (error) {
    console.error(`Error setting up listener for ${marketAddress}:`, error);
    polledMarkets.delete(marketAddress);
  }
}

/**
 * Update market cache with latest data
 */
async function updateMarketCache(marketAddress) {
  try {
    const market = new ethers.Contract(marketAddress, PredictionMarketABI, provider);
    
    const [marketInfo, yesPrice, noPrice, poolInfo, totalTraders] = await Promise.all([
      market.marketInfo(),
      market.getYesPrice(),
      market.getNoPrice(),
      market.getPoolInfo(),
      market.marketInfo().then(info => info.totalTraders)
    ]);

    marketCache.set(marketAddress, {
      address: marketAddress,
      question: marketInfo.question,
      description: marketInfo.description,
      endTime: marketInfo.endTime.toString(),
      state: marketInfo.state,
      creator: marketInfo.creator,
      requiresVerification: marketInfo.requiresVerification,
      totalVolume: marketInfo.totalVolume.toString(),
      totalTraders: totalTraders.toString(),
      yesPrice: yesPrice.toString(),
      noPrice: noPrice.toString(),
      yesShares: poolInfo.yesShares.toString(),
      noShares: poolInfo.noShares.toString(),
      liquidity: poolInfo.liquidity.toString(),
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error(`Error updating cache for ${marketAddress}:`, error);
  }
}

/**
 * Broadcast message to all WebSocket clients
 */
function broadcastToClients(message) {
  if (global.wsClients) {
    const data = JSON.stringify(message);
    global.wsClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(data);
        } catch (error) {
          console.error('Error sending to client:', error);
        }
      }
    });
  }
}

/**
 * Get cached market data
 */
function getMarketData(marketAddress) {
  return marketCache.get(marketAddress);
}

/**
 * Get all cached markets
 */
function getAllMarkets() {
  return Array.from(marketCache.values());
}

/**
 * Start event listeners
 */
async function startEventListeners() {
  try {
    initializeProvider();
    
    if (!MARKET_FACTORY_ADDRESS) {
      console.log('⚠️  MARKET_FACTORY_ADDRESS not set in .env - event listeners disabled');
      return;
    }

    await listenForNewMarkets();
    await listenForTrades();
    
    // Periodically refresh market cache
    setInterval(async () => {
      try {
        const markets = Array.from(marketCache.keys());
        for (const market of markets) {
          await updateMarketCache(market);
        }
      } catch (error) {
        console.error('Error refreshing market cache:', error);
      }
    }, 30000); // Every 30 seconds
    
    console.log('✅ Event listeners started');
  } catch (error) {
    console.error('❌ Error starting event listeners:', error);
    // Don't crash the server, just log the error
  }
}

module.exports = {
  startEventListeners,
  getMarketData,
  getAllMarkets,
  updateMarketCache,
  setupMarketListener
};

