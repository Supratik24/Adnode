const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
require('dotenv').config();

const marketRoutes = require('./routes/markets');
const oracleRoutes = require('./routes/oracle');
const reputationRoutes = require('./routes/reputation');
const polygonIdRoutes = require('./routes/polygonId');
const { startEventListeners } = require('./services/eventListener');
const { startOracleService } = require('./services/oracleService');

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/markets', marketRoutes);
app.use('/api/oracle', oracleRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/polygon-id', polygonIdRoutes);

// Store WebSocket connections for broadcasting
global.wsClients = new Set();

// WebSocket endpoint for real-time updates
app.ws('/ws', (ws, req) => {
  console.log('WebSocket client connected');
  global.wsClients.add(ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        ws.subscribedMarkets = data.markets || [];
        ws.send(JSON.stringify({ type: 'subscribed', markets: ws.subscribedMarkets }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    global.wsClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    global.wsClients.delete(ws);
  });
});

// Start server first
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}/ws`);
  
  // Start services after server is ready
  try {
    startEventListeners();
    startOracleService();
  } catch (error) {
    console.error('Error starting services:', error);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

module.exports = app;

