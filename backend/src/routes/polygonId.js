const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { PolygonIDVerifierABI } = require('../utils/abis');

const RPC_URL = process.env.RPC_URL || process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const VERIFIER_ADDRESS = process.env.POLYGON_ID_VERIFIER_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * GET /api/polygon-id/verify/:userAddress
 * Check if user is verified
 */
router.get('/verify/:userAddress', async (req, res) => {
  try {
    if (!VERIFIER_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'PolygonIDVerifier address not configured'
      });
    }

    const { userAddress } = req.params;
    const verifier = new ethers.Contract(
      VERIFIER_ADDRESS,
      PolygonIDVerifierABI,
      provider
    );
    
    const isVerified = await verifier.isVerified(userAddress);
    
    res.json({
      success: true,
      isVerified,
      userAddress
    });
  } catch (error) {
    console.error('Error checking verification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/polygon-id/verify
 * Verify a user (simplified - in production use Polygon ID SDK)
 */
router.post('/verify', async (req, res) => {
  try {
    // In production, this would:
    // 1. Receive Polygon ID proof from frontend
    // 2. Verify the proof
    // 3. Call the verifier contract
    
    const { userAddress, proofHash, signature } = req.body;
    
    if (!userAddress || !proofHash) {
      return res.status(400).json({
        success: false,
        error: 'userAddress and proofHash are required'
      });
    }
    
    // This is a placeholder - in production, integrate with Polygon ID SDK
    res.json({
      success: true,
      message: 'Verification endpoint - integrate with Polygon ID SDK',
      userAddress,
      proofHash
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

