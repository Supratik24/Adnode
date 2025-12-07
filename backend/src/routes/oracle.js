const express = require('express');
const router = express.Router();
const { resolveMarket, submitResolutionVote } = require('../services/oracleService');

/**
 * POST /api/oracle/resolve
 * Resolve a market (admin only)
 */
router.post('/resolve', async (req, res) => {
  try {
    const { marketAddress, outcome } = req.body;
    
    if (!marketAddress || typeof outcome !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'marketAddress and outcome (boolean) are required'
      });
    }
    
    const txHash = await resolveMarket(marketAddress, outcome);
    
    res.json({
      success: true,
      transactionHash: txHash,
      message: `Market ${marketAddress} resolved with outcome: ${outcome ? 'YES' : 'NO'}`
    });
  } catch (error) {
    console.error('Error resolving market:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/oracle/vote
 * Submit a resolution vote (for multi-sig)
 */
router.post('/vote', async (req, res) => {
  try {
    const { marketAddress, outcome } = req.body;
    
    if (!marketAddress || typeof outcome !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'marketAddress and outcome (boolean) are required'
      });
    }
    
    const txHash = await submitResolutionVote(marketAddress, outcome);
    
    res.json({
      success: true,
      transactionHash: txHash,
      message: `Vote submitted for market ${marketAddress}`
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

