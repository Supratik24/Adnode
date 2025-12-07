// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PredictionMarket.sol";
import "./ReputationManager.sol";
import "./PolygonIDVerifier.sol";

/**
 * @title MarketFactory
 * @notice Factory for creating new prediction markets on Polygon Amoy
 * @dev Security: Validates parameters, checks reputation, prevents abuse
 * Uses native MATIC instead of ERC20 tokens
 */
contract MarketFactory {
    address public immutable oracle;
    ReputationManager public immutable reputationManager;
    PolygonIDVerifier public immutable verifier;
    
    PredictionMarket[] public markets;
    mapping(address => PredictionMarket[]) public userMarkets;
    mapping(address => bool) public isMarket;
    
    uint256 public constant MIN_END_TIME_OFFSET = 1 days;
    uint256 public constant MAX_END_TIME_OFFSET = 365 days;
    uint256 public constant MIN_INITIAL_LIQUIDITY = 0.05 ether; // 0.05 MATIC (18 decimals)
    uint256 public constant MAX_INITIAL_LIQUIDITY = 1000000 ether; // 1M MATIC
    
    event MarketCreated(
        address indexed market,
        address indexed creator,
        string question,
        uint256 endTime,
        uint256 initialLiquidity
    );
    
    constructor(
        address _oracle,
        address _reputationManager,
        address _verifier
    ) {
        oracle = _oracle;
        reputationManager = ReputationManager(_reputationManager);
        verifier = PolygonIDVerifier(_verifier);
    }
    
    /**
     * @notice Create a new prediction market
     * @param question Market question
     * @param description Market description
     * @param endTime Market end timestamp
     * @param requiresVerification Whether market requires human verification
     */
    function createMarket(
        string memory question,
        string memory description,
        uint256 endTime,
        bool requiresVerification
    ) external payable returns (address) {
        uint256 initialLiquidity = msg.value;
        
        // Security: Validate parameters
        require(bytes(question).length > 0 && bytes(question).length <= 200, "Invalid question");
        require(bytes(description).length <= 1000, "Description too long");
        
        require(
            endTime >= block.timestamp + MIN_END_TIME_OFFSET,
            "End time too soon"
        );
        require(
            endTime <= block.timestamp + MAX_END_TIME_OFFSET,
            "End time too far"
        );
        
        require(
            initialLiquidity >= MIN_INITIAL_LIQUIDITY,
            "Insufficient liquidity"
        );
        require(
            initialLiquidity <= MAX_INITIAL_LIQUIDITY,
            "Excessive liquidity"
        );
        
        // Check reputation for market creation
        require(
            reputationManager.canCreateMarket(msg.sender),
            "Insufficient reputation"
        );
        
        // If verification required, check user is verified
        if (requiresVerification) {
            require(verifier.isVerified(msg.sender), "Not verified");
        }
        
        // Deploy new market with native MATIC
        PredictionMarket newMarket = new PredictionMarket{value: initialLiquidity}(
            oracle,
            address(this),
            question,
            description,
            endTime,
            requiresVerification,
            initialLiquidity
        );
        
        address marketAddress = address(newMarket);
        markets.push(newMarket);
        userMarkets[msg.sender].push(newMarket);
        isMarket[marketAddress] = true;
        
        // Award XP for market creation
        reputationManager.awardMarketCreation(msg.sender);
        
        emit MarketCreated(marketAddress, msg.sender, question, endTime, initialLiquidity);
        
        return marketAddress;
    }
    
    /**
     * @notice Get all markets
     */
    function getAllMarkets() external view returns (address[] memory) {
        address[] memory marketAddresses = new address[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            marketAddresses[i] = address(markets[i]);
        }
        return marketAddresses;
    }
    
    /**
     * @notice Get markets created by user
     */
    function getUserMarkets(address user) external view returns (address[] memory) {
        PredictionMarket[] memory userMarketsList = userMarkets[user];
        address[] memory marketAddresses = new address[](userMarketsList.length);
        for (uint256 i = 0; i < userMarketsList.length; i++) {
            marketAddresses[i] = address(userMarketsList[i]);
        }
        return marketAddresses;
    }
    
    /**
     * @notice Get total number of markets
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }
}
