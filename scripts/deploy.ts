import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeployedAddresses {
  network: string;
  chainId: number;
  MockUSDC: string;
  RWAOracle: string;
  XCMBridge: string;
  TxInterceptor: string;
  CrossShieldVault: string;
  deployedAt: string;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log(`\nDeploying CrossShield to ${network.name} (chainId: ${chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // ─── Deploy MockUSDC ───────────────────────────────────────────────────────
  console.log("1/5 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  console.log(`  MockUSDC: ${await mockUSDC.getAddress()}`);

  // ─── Deploy RWAOracle ──────────────────────────────────────────────────────
  console.log("2/5 Deploying RWAOracle...");
  const RWAOracle = await ethers.getContractFactory("RWAOracle");
  const oracle = await RWAOracle.deploy();
  await oracle.waitForDeployment();
  console.log(`  RWAOracle: ${await oracle.getAddress()}`);

  // ─── Deploy XCMBridge ─────────────────────────────────────────────────────
  console.log("3/5 Deploying XCMBridge...");
  const XCMBridge = await ethers.getContractFactory("XCMBridge");
  const xcmBridge = await XCMBridge.deploy();
  await xcmBridge.waitForDeployment();
  console.log(`  XCMBridge: ${await xcmBridge.getAddress()}`);

  // ─── Deploy TxInterceptor ─────────────────────────────────────────────────
  console.log("4/5 Deploying TxInterceptor...");
  const TxInterceptor = await ethers.getContractFactory("TxInterceptor");
  const txInterceptor = await TxInterceptor.deploy();
  await txInterceptor.waitForDeployment();
  console.log(`  TxInterceptor: ${await txInterceptor.getAddress()}`);

  // ─── Deploy CrossShieldVault ──────────────────────────────────────────────
  console.log("5/5 Deploying CrossShieldVault...");
  const CrossShieldVault = await ethers.getContractFactory("CrossShieldVault");
  const vault = await CrossShieldVault.deploy(
    await mockUSDC.getAddress(),
    await oracle.getAddress(),
    await xcmBridge.getAddress()
  );
  await vault.waitForDeployment();
  console.log(`  CrossShieldVault: ${await vault.getAddress()}`);

  // ─── Post-deployment setup ────────────────────────────────────────────────
  console.log("\nPost-deployment setup...");

  // Register vault as verified in TxInterceptor
  await txInterceptor.registerVerifiedContract(await vault.getAddress(), "CrossShieldVault");
  console.log("  Registered vault as verified contract");

  // Seed vault with USDC for payouts
  const seedAmount = ethers.parseUnits("1000000", 6); // 1M USDC
  await mockUSDC.mint(await vault.getAddress(), seedAmount);
  console.log(`  Seeded vault with 1,000,000 USDC`);

  // ─── Save addresses ───────────────────────────────────────────────────────
  const addresses: DeployedAddresses = {
    network: network.name,
    chainId: Number(chainId),
    MockUSDC: await mockUSDC.getAddress(),
    RWAOracle: await oracle.getAddress(),
    XCMBridge: await xcmBridge.getAddress(),
    TxInterceptor: await txInterceptor.getAddress(),
    CrossShieldVault: await vault.getAddress(),
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "../frontend/lib");
  fs.mkdirSync(outDir, { recursive: true });

  const addressFile = path.join(outDir, "deployed-addresses.json");
  fs.writeFileSync(addressFile, JSON.stringify(addresses, null, 2));
  console.log(`\nAddresses saved to ${addressFile}`);

  console.log("\n✓ Deployment complete!\n");
  console.log("Contract Addresses:");
  console.log("===================");
  Object.entries(addresses).forEach(([k, v]) => {
    if (k !== "deployedAt" && k !== "network" && k !== "chainId") {
      console.log(`  ${k}: ${v}`);
    }
  });

  return addresses;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
