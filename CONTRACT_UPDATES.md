# ✅ Contracts Updated to Use Native MATIC

## All Changes Applied

### 1. MarketFactory.sol - UPDATED ✅
- **Removed**: `paymentToken` parameter (no longer needed)
- **Changed**: `createMarket` is now `payable` - accepts native MATIC via `msg.value`
- **Updated**: `MIN_INITIAL_LIQUIDITY = 0.05 ether` (0.05 MATIC)
- **Updated**: `MAX_INITIAL_LIQUIDITY = 1000000 ether` (1M MATIC)
- **Removed**: `initialLiquidity` parameter from `createMarket` function

### 2. PredictionMarket.sol - UPDATED ✅
- **Removed**: `IERC20 paymentToken` - now uses native MATIC
- **Changed**: Constructor is `payable` - receives MATIC via `msg.value`
- **Changed**: `buyShares` is now `payable` - only takes `isYes` parameter, amount from `msg.value`
- **Updated**: `MIN_INVESTMENT = 0.001 ether` (0.001 MATIC)
- **Updated**: All transfers use native MATIC (`call{value: amount}`)
- **Added**: `receive() external payable {}` to accept MATIC

### 3. AMM.sol - UPDATED ✅
- **Updated**: `MIN_LIQUIDITY = 0.01 ether` (0.01 MATIC)
- **Updated**: All comments to reference MATIC instead of USDC
- **Updated**: Works with 18 decimals (native MATIC)

### 4. Oracle.sol - FIXED ✅
- **Fixed**: Cast to `payable` for PredictionMarket contract

### 5. Frontend - UPDATED ✅
- **CreateMarketButton**: Uses native MATIC, sends via `value` parameter
- **TradingInterface**: Uses native MATIC, sends via `value` parameter
- **ABIs**: Updated to match new contract signatures
- **Minimum liquidity**: 0.05 MATIC

### 6. Deploy Script - UPDATED ✅
- **Removed**: MockUSDC deployment (not needed)
- **Updated**: MarketFactory constructor (no paymentToken)

## Deployment Steps

1. **Compile contracts**:
   ```bash
   cd contracts
   npx hardhat compile
   ```

2. **Deploy to Polygon Amoy**:
   ```bash
   npm run deploy:amoy
   ```

3. **Update .env files** with new contract addresses

## New Contract Signatures

### MarketFactory.createMarket
```solidity
function createMarket(
    string memory question,
    string memory description,
    uint256 endTime,
    bool requiresVerification
) external payable returns (address)
```

### PredictionMarket.buyShares
```solidity
function buyShares(bool isYes) external payable
```

## Status: READY FOR DEPLOYMENT ✅

All contracts now use native MATIC on Polygon Amoy with 0.05 MATIC minimum liquidity!

