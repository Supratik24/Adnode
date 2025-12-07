const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { ReputationManagerABI } = require('../utils/abis');

const RPC_URL = process.env.RPC_URL || process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const REPUTATION_MANAGER_ADDRESS = process.env.REPUTATION_MANAGER_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * GET /api/reputation/:userAddress
 * Get user reputation data
 */
router.get('/:userAddress', async (req, res) => {
  try {
    if (!REPUTATION_MANAGER_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'ReputationManager address not configured'
      });
    }

    const { userAddress } = req.params;
    const reputationManager = new ethers.Contract(
      REPUTATION_MANAGER_ADDRESS,
      ReputationManagerABI,
      provider
    );
    
    const [reputation, accuracy] = await Promise.all([
      reputationManager.getUserReputation(userAddress),
      reputationManager.getAccuracy(userAddress)
    ]);
    
    const tierNames = ['Base', 'Bronze', 'Silver', 'Gold', 'Oracle'];
    
    res.json({
      success: true,
      reputation: {
        xp: reputation.xp.toString(),
        tier: tierNames[reputation.tier] || 'Base',
        tierNumber: reputation.tier,
        isVerified: reputation.isVerified,
        totalPredictions: reputation.totalPredictions.toString(),
        correctPredictions: reputation.correctPredictions.toString(),
        accuracy: accuracy.toString(),
        lastUpdate: reputation.lastUpdate.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

