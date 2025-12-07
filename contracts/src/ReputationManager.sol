// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationManager
 * @notice Manages user reputation, XP, and verification status
 * @dev Security: Sybil-resistant through Polygon ID verification
 */
contract ReputationManager {
    enum Tier { Base, Bronze, Silver, Gold, Oracle }
    
    struct UserReputation {
        uint256 xp;
        Tier tier;
        bool isVerified;
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 lastUpdate;
    }
    
    mapping(address => UserReputation) public reputations;
    mapping(address => bool) public verifiedHumans; // Polygon ID verified
    
    // XP thresholds for tiers
    uint256 public constant BRONZE_XP = 100;
    uint256 public constant SILVER_XP = 500;
    uint256 public constant GOLD_XP = 2000;
    uint256 public constant ORACLE_XP = 10000;
    
    // XP rewards
    uint256 public constant XP_WIN = 20;
    uint256 public constant XP_PARTICIPATION = 2;
    uint256 public constant XP_MARKET_CREATION = 50;
    
    address public polygonIDVerifier; // Changed from immutable to allow setting after deployment
    
    event UserVerified(address indexed user, uint256 timestamp);
    event XPAdded(address indexed user, uint256 amount, string reason);
    event TierUpgraded(address indexed user, Tier newTier);
    event VerifierUpdated(address indexed newVerifier);
    
    modifier onlyVerifier() {
        require(msg.sender == polygonIDVerifier, "Only verifier");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == address(this) || polygonIDVerifier != address(0), "Not authorized");
        _;
    }
    
    constructor(address _polygonIDVerifier) {
        polygonIDVerifier = _polygonIDVerifier;
    }
    
    /**
     * @notice Set verifier address (for deployment flexibility)
     * @dev Can only be called if verifier is zero address (initial state)
     */
    function setVerifier(address _verifier) external {
        require(polygonIDVerifier == address(0), "Verifier already set");
        require(_verifier != address(0), "Invalid verifier");
        polygonIDVerifier = _verifier;
        emit VerifierUpdated(_verifier);
    }
    
    /**
     * @notice Verify a human user via Polygon ID
     * @param user Address to verify
     */
    function verifyHuman(address user) external onlyVerifier {
        require(!verifiedHumans[user], "Already verified");
        verifiedHumans[user] = true;
        reputations[user].isVerified = true;
        
        emit UserVerified(user, block.timestamp);
    }
    
    /**
     * @notice Add XP to user (called by market contracts)
     * @param user User address
     * @param amount XP amount
     * @param reason Reason for XP (e.g., "win", "participation")
     */
    function addXP(address user, uint256 amount, string memory reason) public {
        // Only allow market contracts to call this
        // In production, add access control
        
        UserReputation storage rep = reputations[user];
        Tier oldTier = rep.tier;
        
        rep.xp += amount;
        rep.lastUpdate = block.timestamp;
        
        // Check for tier upgrade
        Tier newTier = calculateTier(rep.xp);
        if (newTier > oldTier) {
            rep.tier = newTier;
            emit TierUpgraded(user, newTier);
        }
        
        emit XPAdded(user, amount, reason);
    }
    
    /**
     * @notice Record a prediction (called by market contracts)
     * @param user User address
     * @param isCorrect Whether prediction was correct
     */
    function recordPrediction(address user, bool isCorrect) external {
        UserReputation storage rep = reputations[user];
        rep.totalPredictions++;
        
        if (isCorrect) {
            rep.correctPredictions++;
            addXP(user, XP_WIN, "win");
        } else {
            addXP(user, XP_PARTICIPATION, "participation");
        }
    }
    
    /**
     * @notice Award XP for market creation
     * @param user User address
     */
    function awardMarketCreation(address user) external {
        addXP(user, XP_MARKET_CREATION, "market_creation");
    }
    
    /**
     * @notice Calculate tier from XP
     */
    function calculateTier(uint256 xp) internal pure returns (Tier) {
        if (xp >= ORACLE_XP) return Tier.Oracle;
        if (xp >= GOLD_XP) return Tier.Gold;
        if (xp >= SILVER_XP) return Tier.Silver;
        if (xp >= BRONZE_XP) return Tier.Bronze;
        return Tier.Base;
    }
    
    /**
     * @notice Check if user can create a market
     * @param user User address
     */
    function canCreateMarket(address user) external view returns (bool) {
        UserReputation storage rep = reputations[user];
        // Base tier can create markets
        return rep.tier >= Tier.Base;
    }
    
    /**
     * @notice Get user reputation
     * @param user User address
     */
    function getUserReputation(address user) external view returns (UserReputation memory) {
        return reputations[user];
    }
    
    /**
     * @notice Get user accuracy percentage
     * @param user User address
     */
    function getAccuracy(address user) external view returns (uint256) {
        UserReputation storage rep = reputations[user];
        if (rep.totalPredictions == 0) return 0;
        return (rep.correctPredictions * 100) / rep.totalPredictions;
    }
}
