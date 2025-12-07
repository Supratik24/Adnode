# Prediction Market Backend Server

Backend server for the decentralized prediction market platform.

## Features

- 📡 **Event Listening**: Real-time blockchain event monitoring
- 🔮 **Oracle Service**: Automated market resolution
- 🔐 **Polygon ID Integration**: User verification endpoints
- 📊 **Market Data API**: RESTful API for market information
- ⚡ **WebSocket Support**: Real-time updates for frontend
- 🏆 **Reputation API**: User reputation and XP tracking

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with:
- Contract addresses (after deployment)
- Oracle private key (for market resolution)
- RPC URL

### 3. Run Server

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Markets

- `GET /api/markets` - Get all markets
- `GET /api/markets/:address` - Get specific market data
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
- `POST /api/polygon-id/verify` - Verify user (placeholder)

### WebSocket

- `WS /ws` - Real-time updates

## WebSocket Events

Subscribe to markets:
```json
{
  "type": "subscribe",
  "markets": ["0x...", "0x..."]
}
```

Received events:
- `new_market` - New market created
- `trade` - Trade executed
- `market_resolved` - Market resolved

## Oracle Service

The oracle service automatically:
- Checks markets that need resolution (every 5 minutes)
- Resolves markets after end time + 1 hour delay
- Supports multi-sig voting for critical markets

## Security Notes

- Never commit `.env` file
- Keep oracle private key secure
- Use environment-specific configurations
- Consider rate limiting for production

