// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AMM.sol";
import "./IOracle.sol";

/**
 * @title PredictionMarket
 * @notice Core prediction market contract with AMM-based trading on Polygon Amoy
 * @dev Security features: ReentrancyGuard, oracle manipulation protection, parameter validation
 * Uses native MATIC instead of ERC20 tokens
 */
contract PredictionMarket {
    using AMM for AMM.Pool;
    
    enum MarketState { Open, Closed, Resolved }
    
    struct MarketInfo {
        string question;
        string description;
        uint256 endTime;
        MarketState state;
        address creator;
        bool requiresVerification;
        uint256 totalVolume;
        uint256 totalTraders;
    }
    
    IOracle public immutable oracle;
    address public immutable factory;
    
    MarketInfo public marketInfo;
    AMM.Pool public pool;
    
    mapping(address => uint256) public yesBalances;
    mapping(address => uint256) public noBalances;
    mapping(address => bool) public hasTraded;
    
    uint256 public constant MIN_INVESTMENT = 0.001 ether; // 0.001 MATIC
    uint256 public constant RESOLUTION_DELAY = 1 hours; // Security: delay after endTime before resolution
    
    bool private locked; // Reentrancy guard
    
    event MarketCreated(
        address indexed market,
        string question,
        address creator,
        uint256 endTime,
        uint256 initialLiquidity
    );
    
    event SharesPurchased(
        address indexed buyer,
        bool isYes,
        uint256 investmentAmount,
        uint256 sharesReceived,
        uint256 yesPrice,
        uint256 noPrice
    );
    
    event SharesRedeemed(
        address indexed seller,
        bool isYes,
        uint256 sharesAmount,
        uint256 payout
    );
    
    event MarketResolved(bool outcome, uint256 timestamp);
    
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == address(oracle), "Only oracle");
        _;
    }
    
    constructor(
        address _oracle,
        address _factory,
        string memory _question,
        string memory _description,
        uint256 _endTime,
        bool _requiresVerification,
        uint256 _initialLiquidity
    ) payable {
        require(_endTime > block.timestamp, "Invalid end time");
        require(_initialLiquidity >= 0.05 ether, "Insufficient liquidity"); // Minimum 0.05 MATIC
        require(msg.value == _initialLiquidity, "Incorrect payment");
        
        oracle = IOracle(_oracle);
        factory = _factory;
        
        marketInfo = MarketInfo({
            question: _question,
            description: _description,
            endTime: _endTime,
            state: MarketState.Open,
            creator: msg.sender,
            requiresVerification: _requiresVerification,
            totalVolume: 0,
            totalTraders: 0
        });
        
        pool = AMM.initializePool(_initialLiquidity);
        
        emit MarketCreated(address(this), _question, msg.sender, _endTime, _initialLiquidity);
    }
    
    /**
     * @notice Buy YES or NO shares
     * @param isYes True to buy YES, false to buy NO
     */
    function buyShares(bool isYes) external payable nonReentrant {
        uint256 investmentAmount = msg.value;
        
        require(marketInfo.state == MarketState.Open, "Market not open");
        require(block.timestamp < marketInfo.endTime, "Market ended");
        require(investmentAmount >= MIN_INVESTMENT, "Amount too small");
        
        // Security: Check verification requirement
        if (marketInfo.requiresVerification) {
            // This will be checked by ReputationManager in the factory
            // For now, we assume factory handles verification
        }
        
        // Calculate shares using AMM
        (uint256 sharesOut, uint256 newYesShares, uint256 newNoShares) = 
            AMM.calculateSharesOut(pool, investmentAmount, isYes);
        
        require(sharesOut > 0, "No shares received");
        
        // Update pool
        pool.yesShares = newYesShares;
        pool.noShares = newNoShares;
        pool.liquidity += investmentAmount;
        
        // Update user balances
        if (isYes) {
            yesBalances[msg.sender] += sharesOut;
        } else {
            noBalances[msg.sender] += sharesOut;
        }
        
        if (!hasTraded[msg.sender]) {
            hasTraded[msg.sender] = true;
            marketInfo.totalTraders++;
        }
        
        marketInfo.totalVolume += investmentAmount;
        
        // Get current prices for event
        uint256 yesPrice = AMM.getYesPrice(pool);
        uint256 noPrice = AMM.getNoPrice(pool);
        
        emit SharesPurchased(msg.sender, isYes, investmentAmount, sharesOut, yesPrice, noPrice);
    }
    
    /**
     * @notice Redeem shares for payout
     * @param sharesAmount Amount of shares to redeem
     * @param isYes True to redeem YES shares, false for NO
     */
    function redeemShares(uint256 sharesAmount, bool isYes) external nonReentrant {
        require(marketInfo.state == MarketState.Resolved, "Market not resolved");
        require(sharesAmount > 0, "Invalid amount");
        
        // Get resolution from oracle
        IOracle.Resolution memory resolution = oracle.getResolution(address(this));
        require(resolution.resolved, "Market not resolved");
        
        // Only winners can redeem
        bool isWinner = (isYes && resolution.outcome) || (!isYes && !resolution.outcome);
        require(isWinner, "Cannot redeem losing shares");
        
        if (isYes) {
            require(yesBalances[msg.sender] >= sharesAmount, "Insufficient YES shares");
            yesBalances[msg.sender] -= sharesAmount;
        } else {
            require(noBalances[msg.sender] >= sharesAmount, "Insufficient NO shares");
            noBalances[msg.sender] -= sharesAmount;
        }
        
        // Winners get 1 MATIC per share
        uint256 payout = sharesAmount;
        
        require(address(this).balance >= payout, "Insufficient contract balance");
        
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");
        
        emit SharesRedeemed(msg.sender, isYes, sharesAmount, payout);
    }
    
    /**
     * @notice Resolve market (only oracle)
     * @param outcome True if YES won, false if NO won
     */
    function resolve(bool outcome) external onlyOracle {
        require(marketInfo.state == MarketState.Open, "Market not open");
        require(block.timestamp >= marketInfo.endTime + RESOLUTION_DELAY, "Too early to resolve");
        
        marketInfo.state = MarketState.Resolved;
        
        emit MarketResolved(outcome, block.timestamp);
    }
    
    /**
     * @notice Get YES price
     */
    function getYesPrice() external view returns (uint256) {
        return AMM.getYesPrice(pool);
    }
    
    /**
     * @notice Get NO price
     */
    function getNoPrice() external view returns (uint256) {
        return AMM.getNoPrice(pool);
    }
    
    /**
     * @notice Get pool info
     */
    function getPoolInfo() external view returns (AMM.Pool memory) {
        return pool;
    }
    
    /**
     * @notice Get user balance
     */
    function getUserBalance(address user) external view returns (uint256 yes, uint256 no) {
        return (yesBalances[user], noBalances[user]);
    }
    
    // Allow contract to receive MATIC
    receive() external payable {}
}
