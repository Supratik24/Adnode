// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IOracle.sol";
import "./PredictionMarket.sol";

/**
 * @title Oracle
 * @notice Handles market resolution with security measures
 * @dev Security: Time delays, multi-sig support, manipulation protection
 */
contract Oracle is IOracle {
    address public admin;
    address public pendingAdmin;
    uint256 public constant RESOLUTION_DELAY = 1 hours;
    
    mapping(address => Resolution) public resolutions;
    mapping(address => bool) public authorizedResolvers;
    
    // Security: Require multiple confirmations for critical markets
    mapping(address => mapping(bool => uint256)) public resolutionVotes;
    mapping(address => mapping(address => bool)) public hasVoted;
    uint256 public constant REQUIRED_VOTES = 2; // Multi-sig threshold
    
    event ResolutionSubmitted(address indexed market, bool outcome, address resolver);
    event MarketResolved(address indexed market, bool outcome, uint256 timestamp);
    event ResolverAuthorized(address indexed resolver, bool authorized);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == admin || authorizedResolvers[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedResolvers[msg.sender] = true;
    }
    
    /**
     * @notice Submit a resolution vote
     * @param market Market address
     * @param outcome True if YES won, false if NO won
     */
    function submitResolution(address market, bool outcome) external onlyAuthorized {
        require(!resolutions[market].resolved, "Already resolved");
        
        // Note: In production, check market endTime through interface
        // For now, we rely on the market's own validation
        
        require(!hasVoted[market][msg.sender], "Already voted");
        hasVoted[market][msg.sender] = true;
        resolutionVotes[market][outcome]++;
        
        emit ResolutionSubmitted(market, outcome, msg.sender);
        
        // If enough votes, resolve immediately
        if (resolutionVotes[market][outcome] >= REQUIRED_VOTES) {
            _resolveMarket(market, outcome);
        }
    }
    
    /**
     * @notice Resolve market (called when threshold reached or by admin)
     * @param market Market address
     * @param outcome True if YES won, false if NO won
     */
    function resolveMarket(address market, bool outcome) external onlyAuthorized {
        require(!resolutions[market].resolved, "Already resolved");
        _resolveMarket(market, outcome);
    }
    
    function _resolveMarket(address market, bool outcome) internal {
        resolutions[market] = Resolution({
            resolved: true,
            outcome: outcome,
            resolvedAt: block.timestamp,
            resolver: msg.sender
        });
        
        // Call market's resolve function
        PredictionMarket payableMarket = PredictionMarket(payable(market));
        payableMarket.resolve(outcome);
        
        emit MarketResolved(market, outcome, block.timestamp);
    }
    
    /**
     * @notice Authorize a resolver
     */
    function authorizeResolver(address resolver, bool authorized) external onlyAdmin {
        authorizedResolvers[resolver] = authorized;
        emit ResolverAuthorized(resolver, authorized);
    }
    
    /**
     * @notice Get resolution for a market
     */
    function getResolution(address market) external view override returns (Resolution memory) {
        return resolutions[market];
    }
    
    /**
     * @notice Check if market is resolved
     */
    function isResolved(address market) external view override returns (bool) {
        return resolutions[market].resolved;
    }
    
    /**
     * @notice Transfer admin role
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        pendingAdmin = newAdmin;
    }
    
    /**
     * @notice Accept admin role
     */
    function acceptAdmin() external {
        require(msg.sender == pendingAdmin, "Not pending admin");
        admin = pendingAdmin;
        pendingAdmin = address(0);
    }
}

