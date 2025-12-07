# Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MetaMask or compatible wallet with Polygon testnet/mainnet access
- Private key with MATIC for gas fees

### 2. Smart Contracts Deployment

#### Install Dependencies

```bash
cd contracts
npm install
```

#### Configure Environment

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

Edit `.env` and add:
- Your private key (NEVER commit this!)
- RPC URLs
- PolygonScan API key (optional, for verification)

#### Compile Contracts

```bash
npm run compile
```

#### Deploy to Polygon Amoy Testnet

```bash
npm run deploy:amoy
```

This will deploy:
1. MockUSDC (for testing)
2. ReputationManager
3. PolygonIDVerifier
4. Oracle
5. MarketFactory

**Save all contract addresses** from the deployment output!

#### Deploy to Polygon Mainnet

⚠️ **Only after thorough testing on testnet!**

```bash
npm run deploy:polygon
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment

Create `.env.local`:

```bash
cp env.example .env.local
```

Add the deployed contract addresses:

```env
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_POLYGON_ID_VERIFIER_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
```

#### Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

#### Build for Production

```bash
npm run build
npm start
```

### 4. Initial Setup Tasks

#### 1. Verify Users (Optional)

For testing, you can use the admin function in PolygonIDVerifier:

```javascript
// In Hardhat console or script
await verifier.adminVerify(userAddress);
```

#### 2. Authorize Oracle Resolvers

```javascript
await oracle.authorizeResolver(resolverAddress, true);
```

#### 3. Mint Test USDC (Testnet Only)

```javascript
await mockUSDC.mint(userAddress, ethers.parseUnits("1000", 6));
```

### 5. Production Checklist

- [ ] All contracts deployed and verified on PolygonScan
- [ ] Environment variables configured
- [ ] Frontend built and tested
- [ ] Oracle resolvers authorized
- [ ] Security audit completed (recommended)
- [ ] Testnet testing completed
- [ ] Documentation updated
- [ ] Monitoring set up

### 6. Troubleshooting

#### Contract Deployment Fails

- Check you have enough MATIC for gas
- Verify RPC URL is correct
- Ensure private key has funds

#### Frontend Can't Connect

- Check contract addresses in `.env.local`
- Verify network is correct (Polygon mainnet/testnet)
- Check browser console for errors

#### Transactions Fail

- Ensure USDC is approved before trading
- Check market is still open
- Verify user has sufficient balance
- Check if market requires verification

### 7. Security Notes

- **Never commit private keys or `.env` files**
- Use environment-specific configurations
- Test thoroughly on testnet before mainnet
- Consider security audit for production
- Monitor contract interactions
- Set up alerts for unusual activity

### 8. Next Steps

After deployment:

1. Create your first market
2. Test trading functionality
3. Verify Polygon ID integration
4. Test market resolution
5. Monitor gas usage and optimize if needed

## Support

For issues, check:
- Contract logs in Hardhat
- Browser console for frontend errors
- PolygonScan for transaction details

