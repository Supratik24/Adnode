// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOracle
 * @notice Interface for market resolution oracle
 * @dev Security: Prevents oracle manipulation through time delays and multi-sig
 */
interface IOracle {
    struct Resolution {
        bool resolved;
        bool outcome; // true = YES won, false = NO won
        uint256 resolvedAt;
        address resolver;
    }
    
    function resolveMarket(address market, bool outcome) external;
    function getResolution(address market) external view returns (Resolution memory);
    function isResolved(address market) external view returns (bool);
}

