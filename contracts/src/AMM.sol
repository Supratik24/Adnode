// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AMM
 * @notice Automated Market Maker for prediction markets
 * @dev Uses constant product formula (x * y = k) for pricing
 * Works with native MATIC (18 decimals)
 */
library AMM {
    uint256 public constant MIN_LIQUIDITY = 0.01 ether; // 0.01 MATIC
    
    struct Pool {
        uint256 yesShares;
        uint256 noShares;
        uint256 liquidity; // Total MATIC in pool
    }
    
    /**
     * @notice Initialize a new pool
     * @param initialLiquidity Initial MATIC amount
     * @return pool Initialized pool
     */
    function initializePool(uint256 initialLiquidity) internal pure returns (Pool memory pool) {
        require(initialLiquidity >= MIN_LIQUIDITY * 100, "Insufficient liquidity");
        
        // Split liquidity equally between YES and NO
        uint256 halfLiquidity = initialLiquidity / 2;
        pool.yesShares = halfLiquidity;
        pool.noShares = halfLiquidity;
        pool.liquidity = initialLiquidity;
    }
    
    /**
     * @notice Calculate shares received for investment
     * @param pool Current pool state
     * @param investmentAmount Amount of MATIC to invest
     * @param isYes True to buy YES, false to buy NO
     * @return sharesOut Shares received
     * @return newYesShares New YES shares in pool
     * @return newNoShares New NO shares in pool
     */
    function calculateSharesOut(
        Pool memory pool,
        uint256 investmentAmount,
        bool isYes
    ) internal pure returns (uint256 sharesOut, uint256 newYesShares, uint256 newNoShares) {
        require(investmentAmount > 0, "Invalid amount");
        
        uint256 k = pool.yesShares * pool.noShares; // Constant product
        
        if (isYes) {
            // Buying YES: add to YES pool, remove from NO pool
            newYesShares = pool.yesShares + investmentAmount;
            newNoShares = k / newYesShares; // Maintain constant product
            sharesOut = pool.noShares - newNoShares;
        } else {
            // Buying NO: add to NO pool, remove from YES pool
            newNoShares = pool.noShares + investmentAmount;
            newYesShares = k / newNoShares; // Maintain constant product
            sharesOut = pool.yesShares - newYesShares;
        }
        
        require(sharesOut > 0, "Insufficient liquidity");
    }
    
    /**
     * @notice Calculate payout for redeeming shares
     * @param pool Current pool state
     * @param sharesAmount Amount of shares to redeem
     * @param isYes True if redeeming YES shares
     * @param outcome True if YES won (only used if market resolved)
     * @return payout Amount of MATIC received
     */
    function calculatePayout(
        Pool memory pool,
        uint256 sharesAmount,
        bool isYes,
        bool outcome
    ) internal pure returns (uint256 payout) {
        require(sharesAmount > 0, "Invalid amount");
        
        // If market resolved, winners get 1 MATIC per share
        // Losers get 0
        if (isYes == outcome) {
            // Winner: 1 MATIC per share
            payout = sharesAmount;
        } else {
            // Loser: 0 MATIC
            payout = 0;
        }
    }
    
    /**
     * @notice Get YES price (in MATIC, scaled by 1e18)
     * @param pool Current pool state
     * @return price Price of YES shares
     */
    function getYesPrice(Pool memory pool) internal pure returns (uint256) {
        if (pool.yesShares == 0 || pool.noShares == 0) {
            return 0.5 ether; // Default 50/50
        }
        
        uint256 totalShares = pool.yesShares + pool.noShares;
        // Price = YES shares / Total shares (scaled by 1e18)
        return (pool.yesShares * 1e18) / totalShares;
    }
    
    /**
     * @notice Get NO price (in MATIC, scaled by 1e18)
     * @param pool Current pool state
     * @return price Price of NO shares
     */
    function getNoPrice(Pool memory pool) internal pure returns (uint256) {
        if (pool.yesShares == 0 || pool.noShares == 0) {
            return 0.5 ether; // Default 50/50
        }
        
        uint256 totalShares = pool.yesShares + pool.noShares;
        // Price = NO shares / Total shares (scaled by 1e18)
        return (pool.noShares * 1e18) / totalShares;
    }
}
