# Decentralized Prediction Market Platform

A fully functional prediction market platform built on Polygon Amoy, featuring AMM-based trading, Polygon ID verification, reputation systems, and a complete backend server.

## 🎯 Features

- **Prediction Markets**: Create and trade on YES/NO prediction markets
- **AMM-Based Trading**: Automated Market Maker pricing for fair market dynamics
- **Polygon ID Integration**: Privacy-preserving human verification
- **Reputation System**: XP and tier-based reputation for traders
- **Real-time Updates**: WebSocket support for live price updates
- **Oracle Service**: Automated market resolution
- **Backend API**: RESTful API for market data and operations
- **Security**: Oracle manipulation protection, parameter validation, reentrancy guards

## 📁 Project Structure

```
.
├── contracts/          # Smart contracts (Solidity)
│   ├── src/           # Contract source files
│   ├── script/         # Deployment scripts
│   └── test/           # Contract tests
├── backend/            # Backend server (Express.js)
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/     # Utilities
├── frontend/           # Next.js frontend
│   └── src/
│       ├── app/        # Next.js app router pages
│       ├── components/ # React components
│       ├── lib/        # API client
│       └── hooks/      # Custom hooks
└── README.md
```

## 🚀 Quick Start

See [SETUP.md](SETUP.md) for complete setup instructions.

### 1. Deploy Contracts

```bash
cd contracts
npm install
cp env.example .env
# Edit .env with your private key
npm run compile
npm run deploy:amoy
```

### 2. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with contract addresses
npm run dev
```

### 3. Start Frontend

```bash
cd frontend
npm install
cp env.example .env.local
# Edit .env.local with contract addresses and API URL
npm run dev
```

## 🔧 Configuration

### Smart Contracts

- **Network**: Polygon Amoy (Chain ID: 80002)
- **RPC**: https://rpc-amoy.polygon.technology
- **Faucet**: https://faucet.polygon.technology/

### Backend Server

- **Port**: 3001 (default)
- **API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001/ws

### Frontend

- **Port**: 3000 (default)
- **URL**: http://localhost:3000

## 📡 API Endpoints

### Markets

- `GET /api/markets` - Get all markets
- `GET /api/markets/:address` - Get market details
- `GET /api/markets/:address/prices` - Get current prices
- `GET /api/markets/:address/pool` - Get pool information
- `GET /api/markets/:address/user/:userAddress` - Get user balance

### Oracle

- `POST /api/oracle/resolve` - Resolve a market
- `POST /api/oracle/vote` - Submit resolution vote

### Reputation

- `GET /api/reputation/:userAddress` - Get user reputation

### Polygon ID

- `GET /api/polygon-id/verify/:userAddress` - Check verification status

## 🛡️ Security Features

- ✅ Reentrancy protection
- ✅ Oracle manipulation prevention (time delays, multi-sig)
- ✅ Market parameter validation
- ✅ Overflow/underflow protection
- ✅ Access control on sensitive functions

## 📚 Documentation

- [SETUP.md](SETUP.md) - Complete setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [backend/README.md](backend/README.md) - Backend documentation

## 🧪 Testing

### Contracts

```bash
cd contracts
npm test
```

### Backend

```bash
cd backend
# Test API endpoints
curl http://localhost:3001/health
```

## 🚢 Production Deployment

1. Deploy contracts to Polygon mainnet
2. Deploy backend to cloud (Heroku, AWS, etc.)
3. Deploy frontend to Vercel/Netlify
4. Update environment variables
5. Enable monitoring and logging

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## ⚠️ Security Notes

- Never commit `.env` files
- Use strong private keys
- Enable HTTPS in production
- Set up rate limiting
- Regular security audits recommended

---

Built with ❤️ on Polygon
