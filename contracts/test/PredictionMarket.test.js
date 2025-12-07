const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  let mockUSDC;
  let oracle;
  let reputationManager;
  let verifier;
  let factory;
  let market;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy ReputationManager
    const ReputationManager = await ethers.getContractFactory("ReputationManager");
    reputationManager = await ReputationManager.deploy(ethers.ZeroAddress);
    await reputationManager.waitForDeployment();

    // Deploy Verifier
    const PolygonIDVerifier = await ethers.getContractFactory("PolygonIDVerifier");
    verifier = await PolygonIDVerifier.deploy(await reputationManager.getAddress());
    await verifier.waitForDeployment();

    // Deploy Oracle
    const Oracle = await ethers.getContractFactory("Oracle");
    oracle = await Oracle.deploy();
    await oracle.waitForDeployment();

    // Deploy Factory
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    factory = await MarketFactory.deploy(
      await mockUSDC.getAddress(),
      await oracle.getAddress(),
      await reputationManager.getAddress(),
      await verifier.getAddress()
    );
    await factory.waitForDeployment();

    // Mint USDC to users
    const usdcAmount = ethers.parseUnits("10000", 6);
    await mockUSDC.mint(owner.address, usdcAmount);
    await mockUSDC.mint(user1.address, usdcAmount);
    await mockUSDC.mint(user2.address, usdcAmount);
  });

  it("Should create a market", async function () {
    const question = "Will ETH be above $4000 next week?";
    const description = "Test market";
    const endTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const initialLiquidity = ethers.parseUnits("100", 6);

    // Approve USDC
    await mockUSDC.approve(await factory.getAddress(), initialLiquidity);

    // Create market
    await expect(
      factory.createMarket(
        question,
        description,
        endTime,
        false,
        initialLiquidity
      )
    ).to.emit(factory, "MarketCreated");

    const markets = await factory.getAllMarkets();
    expect(markets.length).to.equal(1);
  });

  it("Should allow users to buy shares", async function () {
    // Create market first
    const endTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const initialLiquidity = ethers.parseUnits("100", 6);
    await mockUSDC.approve(await factory.getAddress(), initialLiquidity);
    await factory.createMarket(
      "Test Question",
      "Test",
      endTime,
      false,
      initialLiquidity
    );

    const markets = await factory.getAllMarkets();
    const marketAddress = markets[0];
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    market = PredictionMarket.attach(marketAddress);

    // User buys YES shares
    const investmentAmount = ethers.parseUnits("10", 6);
    await mockUSDC.connect(user1).approve(marketAddress, investmentAmount);
    
    await expect(
      market.connect(user1).buyShares(investmentAmount, true)
    ).to.emit(market, "SharesPurchased");

    const [yesBalance, noBalance] = await market.getUserBalance(user1.address);
    expect(yesBalance).to.be.gt(0);
    expect(noBalance).to.equal(0);
  });

  it("Should calculate prices correctly", async function () {
    const endTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const initialLiquidity = ethers.parseUnits("100", 6);
    await mockUSDC.approve(await factory.getAddress(), initialLiquidity);
    await factory.createMarket("Test", "Test", endTime, false, initialLiquidity);

    const markets = await factory.getAllMarkets();
    const marketAddress = markets[0];
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    market = PredictionMarket.attach(marketAddress);

    const yesPrice = await market.getYesPrice();
    const noPrice = await market.getNoPrice();

    // Prices should be between 0 and 1e18
    expect(yesPrice).to.be.gt(0);
    expect(yesPrice).to.be.lte(ethers.parseUnits("1", 18));
    expect(noPrice).to.be.gt(0);
    expect(noPrice).to.be.lte(ethers.parseUnits("1", 18));
  });
});

