// Contract ABIs - simplified versions for backend use
const MarketFactoryABI = [
  "event MarketCreated(address indexed market, address indexed creator, string question, uint256 endTime)",
  "function getAllMarkets() external view returns (address[] memory)"
];

const PredictionMarketABI = [
  "event SharesPurchased(address indexed buyer, bool isYes, uint256 investmentAmount, uint256 sharesReceived, uint256 yesPrice, uint256 noPrice)",
  "event MarketResolved(bool outcome, uint256 timestamp)",
  "function marketInfo() external view returns (string memory question, string memory description, uint256 endTime, uint8 state, address creator, bool requiresVerification, uint256 totalVolume, uint256 totalTraders)",
  "function getYesPrice() external view returns (uint256)",
  "function getNoPrice() external view returns (uint256)",
  "function getPoolInfo() external view returns (uint256 yesShares, uint256 noShares, uint256 liquidity)",
  "function getUserBalance(address user) external view returns (uint256 yes, uint256 no)"
];

const OracleABI = [
  "function resolveMarket(address market, bool outcome) external",
  "function submitResolution(address market, bool outcome) external"
];

const ReputationManagerABI = [
  "function getUserReputation(address user) external view returns (uint256 xp, uint8 tier, bool isVerified, uint256 totalPredictions, uint256 correctPredictions, uint256 lastUpdate)",
  "function getAccuracy(address user) external view returns (uint256)"
];

const PolygonIDVerifierABI = [
  "function isVerified(address user) external view returns (bool)"
];

module.exports = {
  MarketFactoryABI,
  PredictionMarketABI,
  OracleABI,
  ReputationManagerABI,
  PolygonIDVerifierABI
};

