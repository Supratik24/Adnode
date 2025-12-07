# Environment Variables Configuration Guide

This document explains all environment variables needed for the prediction market platform. Fill in the addresses after deploying contracts.

---

## 📁 1. Contracts Directory (`contracts/.env`)

### Required for Contract Deployment

#### `PRIVATE_KEY`
- **Description**: Your wallet's private key used to deploy contracts
- **Format**: `0x...` (64 hex characters)
- **Example**: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- **⚠️ SECURITY**: NEVER commit this file! Keep it secret.
- **Where to get**: Export from MetaMask or your wallet

#### `AMOY_RPC_URL`
- **Description**: RPC endpoint for Polygon Amoy testnet
- **Default**: `https://rpc-amoy.polygon.technology`
- **Purpose**: Used to connect to blockchain for deployment
- **Alternative**: You can use other RPC providers like Alchemy, Infura

#### `POLYGON_RPC_URL`
- **Description**: RPC endpoint for Polygon mainnet (for production)
- **Default**: `https://polygon-rpc.com`
- **Purpose**: Used when deploying to mainnet

#### `POLYGONSCAN_API_KEY`
- **Description**: API key for verifying contracts on PolygonScan
- **Format**: String
- **Purpose**: Automatically verify contracts after deployment
- **Where to get**: https://polygonscan.com/apis
- **Optional**: Not required, but recommended

---

### Contract Addresses (Fill After Deployment)

After running `npm run deploy:amoy`, you'll get addresses like:
```
MockUSDC deployed to: 0x...
ReputationManager deployed to: 0x...
PolygonIDVerifier deployed to: 0x...
Oracle deployed to: 0x...
MarketFactory deployed to: 0x...
```

#### `MOCK_USDC_ADDRESS`
- **Description**: Address of the MockUSDC token contract
- **Format**: `0x...` (42 characters)
- **Purpose**: Test token for trading (replace with real USDC in production)
- **Example**: `0x5239865182CaEa66b49132f28E3ebcDFef461EeF`

#### `REPUTATION_MANAGER_ADDRESS`
- **Description**: Address of the ReputationManager contract
- **Format**: `0x...` (42 characters)
- **Purpose**: Manages user XP, tiers, and verification status
- **Example**: `0xeD30C04E7D9e6e80f4605fbb98f1709BBbCf3212`

#### `POLYGON_ID_VERIFIER_ADDRESS`
- **Description**: Address of the PolygonIDVerifier contract
- **Format**: `0x...` (42 characters)
- **Purpose**: Verifies Polygon ID proofs for human verification
- **Example**: `0xaF7e553221006d9C57866a629DeF0247Bf49085c`

#### `ORACLE_ADDRESS`
- **Description**: Address of the Oracle contract
- **Format**: `0x...` (42 characters)
- **Purpose**: Resolves markets after they end
- **Example**: `0x3699A2Af8F42d5Ff99b2f844Aa1aa4D602ba17dd`

#### `MARKET_FACTORY_ADDRESS`
- **Description**: Address of the MarketFactory contract
- **Format**: `0x...` (42 characters)
- **Purpose**: Creates new prediction markets
- **Example**: `0x2D5447e91ee859f11f6C1ae67BA418e4E746bdB1`

---

## 📁 2. Backend Directory (`backend/.env`)

### Server Configuration

#### `PORT`
- **Description**: Port number for the backend server
- **Default**: `3001`
- **Purpose**: Where the API server will run
- **Example**: `3001`

#### `RPC_URL` or `AMOY_RPC_URL`
- **Description**: RPC endpoint for connecting to Polygon Amoy
- **Default**: `https://rpc-amoy.polygon.technology`
- **Purpose**: Backend needs this to listen to blockchain events
- **Same as**: Contracts RPC URL

### Contract Addresses (Copy from Contracts)

Copy all contract addresses from `contracts/.env`:

#### `MARKET_FACTORY_ADDRESS`
- **Description**: Same as contracts - address of MarketFactory
- **Purpose**: Backend listens to events from this contract
- **Copy from**: `contracts/.env`

#### `REPUTATION_MANAGER_ADDRESS`
- **Description**: Same as contracts - address of ReputationManager
- **Purpose**: Backend reads reputation data
- **Copy from**: `contracts/.env`

#### `POLYGON_ID_VERIFIER_ADDRESS`
- **Description**: Same as contracts - address of PolygonIDVerifier
- **Purpose**: Backend checks verification status
- **Copy from**: `contracts/.env`

#### `ORACLE_ADDRESS`
- **Description**: Same as contracts - address of Oracle
- **Purpose**: Backend uses this to resolve markets
- **Copy from**: `contracts/.env`

### Oracle Service

#### `ORACLE_PRIVATE_KEY`
- **Description**: Private key of the oracle account
- **Format**: `0x...` (64 hex characters)
- **Purpose**: Used to sign resolution transactions
- **⚠️ SECURITY**: Keep this secret! This account should have MATIC for gas
- **Note**: Can be same as deployer or different account

### Optional Configuration

#### `CORS_ORIGIN`
- **Description**: Allowed origin for CORS (Cross-Origin Resource Sharing)
- **Default**: `http://localhost:3000`
- **Purpose**: Allows frontend to call backend API
- **Example**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)

#### `POLYGON_ID_ISSUER_URL`
- **Description**: URL of Polygon ID issuer service
- **Purpose**: For full Polygon ID integration
- **Optional**: Can be left empty for MVP

---

## 📁 3. Frontend Directory (`frontend/.env.local`)

### Contract Addresses (Copy from Contracts)

All addresses should start with `NEXT_PUBLIC_` prefix:

#### `NEXT_PUBLIC_MOCK_USDC_ADDRESS`
- **Description**: MockUSDC contract address
- **Copy from**: `contracts/.env` → `MOCK_USDC_ADDRESS`
- **Example**: `0x5239865182CaEa66b49132f28E3ebcDFef461EeF`

#### `NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS`
- **Description**: ReputationManager contract address
- **Copy from**: `contracts/.env` → `REPUTATION_MANAGER_ADDRESS`
- **Example**: `0xeD30C04E7D9e6e80f4605fbb98f1709BBbCf3212`

#### `NEXT_PUBLIC_POLYGON_ID_VERIFIER_ADDRESS`
- **Description**: PolygonIDVerifier contract address
- **Copy from**: `contracts/.env` → `POLYGON_ID_VERIFIER_ADDRESS`
- **Example**: `0xaF7e553221006d9C57866a629DeF0247Bf49085c`

#### `NEXT_PUBLIC_ORACLE_ADDRESS`
- **Description**: Oracle contract address
- **Copy from**: `contracts/.env` → `ORACLE_ADDRESS`
- **Example**: `0x3699A2Af8F42d5Ff99b2f844Aa1aa4D602ba17dd`

#### `NEXT_PUBLIC_MARKET_FACTORY_ADDRESS`
- **Description**: MarketFactory contract address
- **Copy from**: `contracts/.env` → `MARKET_FACTORY_ADDRESS`
- **Example**: `0x2D5447e91ee859f11f6C1ae67BA418e4E746bdB1`

### Network Configuration

#### `NEXT_PUBLIC_CHAIN_ID`
- **Description**: Polygon Amoy testnet chain ID
- **Value**: `80002`
- **Purpose**: Frontend connects to this network
- **Note**: Use `137` for Polygon mainnet

#### `NEXT_PUBLIC_RPC_URL`
- **Description**: RPC endpoint for frontend
- **Default**: `https://rpc-amoy.polygon.technology`
- **Purpose**: Frontend uses this to read blockchain data
- **Same as**: Contracts and Backend RPC URL

### Backend API Configuration

#### `NEXT_PUBLIC_API_URL`
- **Description**: Backend API server URL
- **Default**: `http://localhost:3001`
- **Purpose**: Frontend calls this for market data
- **Production**: Change to your deployed backend URL

#### `NEXT_PUBLIC_WS_URL`
- **Description**: WebSocket URL for real-time updates
- **Default**: `ws://localhost:3001/ws`
- **Purpose**: Real-time price updates
- **Production**: Change to `wss://yourdomain.com/ws` (secure WebSocket)

### Optional Configuration

#### `NEXT_PUBLIC_APP_NAME`
- **Description**: Name of your application
- **Default**: `Prediction Market`
- **Purpose**: Displayed in UI

#### `NEXT_PUBLIC_APP_URL`
- **Description**: Your app's URL
- **Default**: `http://localhost:3000`
- **Purpose**: Used for sharing/links

#### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Description**: WalletConnect project ID
- **Purpose**: For WalletConnect integration
- **Where to get**: https://cloud.walletconnect.com
- **Optional**: Can be left empty

#### `NEXT_PUBLIC_POLYGON_ID_ISSUER_URL`
- **Description**: Polygon ID issuer URL
- **Purpose**: For Polygon ID verification
- **Optional**: Can be left empty for MVP

---

## 📝 Quick Setup Checklist

### Step 1: Deploy Contracts
1. Go to `contracts/` directory
2. Copy `env.example` to `.env`
3. Fill in `PRIVATE_KEY` and `AMOY_RPC_URL`
4. Run `npm run deploy:amoy`
5. **Copy all contract addresses** from deployment output

### Step 2: Configure Backend
1. Go to `backend/` directory
2. Create `.env` file
3. Copy contract addresses from Step 1
4. Add `ORACLE_PRIVATE_KEY` (can be same as deployer)
5. Set `PORT=3001` (or your preferred port)

### Step 3: Configure Frontend
1. Go to `frontend/` directory
2. Copy `env.example` to `.env.local`
3. Copy all contract addresses (add `NEXT_PUBLIC_` prefix)
4. Set `NEXT_PUBLIC_CHAIN_ID=80002`
5. Set `NEXT_PUBLIC_API_URL=http://localhost:3001`

---

## 🔒 Security Notes

1. **Never commit `.env` files** - They contain private keys
2. **Use different accounts** - Deployer and Oracle can be different
3. **Keep private keys secure** - Store them safely
4. **Use environment-specific configs** - Different for testnet/mainnet
5. **Rotate keys regularly** - Especially in production

---

## ✅ Verification

After filling all addresses, verify:

1. **Contracts**: Run `npm run compile` - should succeed
2. **Backend**: Run `npm run dev` - should connect to blockchain
3. **Frontend**: Run `npm run dev` - should load markets

If you see errors, double-check:
- All addresses are correct (42 characters, start with `0x`)
- RPC URLs are correct
- Network is Polygon Amoy (Chain ID: 80002)
- Backend is running before starting frontend

---

## 🆘 Troubleshooting

**"Contract not found"**
- Check address is correct (copy-paste, no spaces)
- Verify contract was deployed successfully
- Check you're on correct network (Amoy)

**"Cannot connect to RPC"**
- Verify RPC URL is correct
- Check internet connection
- Try alternative RPC: `https://rpc.ankr.com/polygon_amoy`

**"Backend can't find contracts"**
- Verify all addresses in `backend/.env`
- Check backend logs for errors
- Ensure RPC URL is correct

**"Frontend shows errors"**
- Check all `NEXT_PUBLIC_*` addresses
- Verify backend is running
- Check browser console for specific errors

---

Need help? Check the deployment output or contract verification on PolygonScan!

