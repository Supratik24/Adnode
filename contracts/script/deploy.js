const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts to Polygon Amoy...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Deploy ReputationManager first with zero address (we'll set verifier after)
  console.log("\n1️⃣ Deploying ReputationManager...");
  const ReputationManager = await hre.ethers.getContractFactory("ReputationManager");
  const reputationManager = await ReputationManager.deploy(hre.ethers.ZeroAddress);
  await reputationManager.waitForDeployment();
  const reputationManagerAddress = await reputationManager.getAddress();
  console.log("✅ ReputationManager deployed to:", reputationManagerAddress);

  // Deploy PolygonIDVerifier (needs ReputationManager address)
  console.log("\n2️⃣ Deploying PolygonIDVerifier...");
  const PolygonIDVerifier = await hre.ethers.getContractFactory("PolygonIDVerifier");
  const verifier = await PolygonIDVerifier.deploy(reputationManagerAddress);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ PolygonIDVerifier deployed to:", verifierAddress);

  // Link ReputationManager to PolygonIDVerifier
  console.log("\n🔗 Linking ReputationManager to PolygonIDVerifier...");
  const setVerifierTx = await reputationManager.setVerifier(verifierAddress);
  await setVerifierTx.wait();
  console.log("✅ ReputationManager linked to PolygonIDVerifier");

  // Deploy Oracle
  console.log("\n3️⃣ Deploying Oracle...");
  const Oracle = await hre.ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("✅ Oracle deployed to:", oracleAddress);

  // Deploy MarketFactory (no payment token needed - uses native MATIC)
  console.log("\n4️⃣ Deploying MarketFactory...");
  const MarketFactory = await hre.ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(
    oracleAddress,
    reputationManagerAddress,
    verifierAddress
  );
  await marketFactory.waitForDeployment();
  const marketFactoryAddress = await marketFactory.getAddress();
  console.log("✅ MarketFactory deployed to:", marketFactoryAddress);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("==========================================");
  console.log("POLYGON_ID_VERIFIER_ADDRESS=" + verifierAddress);
  console.log("REPUTATION_MANAGER_ADDRESS=" + reputationManagerAddress);
  console.log("ORACLE_ADDRESS=" + oracleAddress);
  console.log("MARKET_FACTORY_ADDRESS=" + marketFactoryAddress);
  console.log("==========================================");
  console.log("\n⚠️  Update your .env files with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
