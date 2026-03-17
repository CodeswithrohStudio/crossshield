/**
 * Direct ethers.js deployment for Polkadot Asset Hub Westend.
 * Bypasses Hardhat's eth_estimateGas (which fails on Frontier EVM)
 * by explicitly setting gasLimit on every deployment transaction.
 */
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

const RPC = "https://westend-asset-hub-eth-rpc.polkadot.io";
const CHAIN_ID = 420420421;
const GAS_LIMIT = 8_000_000n;
const GAS_PRICE = ethers.parseUnits("1", "gwei");

function loadArtifact(name: string) {
  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${name}.sol/${name}.json`
  );
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

async function deployContract(
  wallet: ethers.Wallet,
  name: string,
  args: unknown[] = []
): Promise<string> {
  const artifact = loadArtifact(name);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log(`  Deploying ${name}...`);
  const deployTx = await factory.getDeployTransaction(...args);

  const tx = await wallet.sendTransaction({
    data: deployTx.data,
    gasLimit: GAS_LIMIT,
    gasPrice: GAS_PRICE,
    chainId: CHAIN_ID,
    type: 0,  // legacy tx — Frontier EVM doesn't support EIP-1559
  });

  console.log(`    tx: ${tx.hash}`);
  const receipt = await tx.wait();

  if (!receipt?.contractAddress) {
    throw new Error(`${name} deployment failed — no contractAddress in receipt`);
  }

  console.log(`    address: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

async function sendTx(
  wallet: ethers.Wallet,
  contract: ethers.Contract,
  method: string,
  args: unknown[]
) {
  const data = contract.interface.encodeFunctionData(method, args);
  const tx = await wallet.sendTransaction({
    to: await contract.getAddress(),
    data,
    gasLimit: GAS_LIMIT,
    gasPrice: GAS_PRICE,
    chainId: CHAIN_ID,
    type: 0,
  });
  await tx.wait();
}

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not set in .env.local");

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(pk, provider);
  const balance = await provider.getBalance(wallet.address);

  console.log(`\nDeploying CrossShield to Westend Asset Hub (chainId: ${CHAIN_ID})`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} WND\n`);

  // 1. MockUSDC
  const mockUSDCAddr = await deployContract(wallet, "MockUSDC");

  // 2. RWAOracle
  const rwaOracleAddr = await deployContract(wallet, "RWAOracle");

  // 3. XCMBridge
  const xcmBridgeAddr = await deployContract(wallet, "XCMBridge");

  // 4. TxInterceptor
  const txInterceptorAddr = await deployContract(wallet, "TxInterceptor");

  // 5. CrossShieldVault (needs mockUSDC, oracle, xcmBridge addresses)
  const vaultAddr = await deployContract(wallet, "CrossShieldVault", [
    mockUSDCAddr,
    rwaOracleAddr,
    xcmBridgeAddr,
  ]);

  // Post-deployment: register vault + seed USDC
  console.log("\nPost-deployment setup...");

  const txInterceptorArtifact = loadArtifact("TxInterceptor");
  const txInterceptor = new ethers.Contract(txInterceptorAddr, txInterceptorArtifact.abi, wallet);
  await sendTx(wallet, txInterceptor, "registerVerifiedContract", [vaultAddr, "CrossShieldVault"]);
  console.log("  Registered vault as verified contract");

  const mockUSDCArtifact = loadArtifact("MockUSDC");
  const mockUSDC = new ethers.Contract(mockUSDCAddr, mockUSDCArtifact.abi, wallet);
  const seedAmount = ethers.parseUnits("1000000", 6); // 1M USDC
  await sendTx(wallet, mockUSDC, "mint", [vaultAddr, seedAmount]);
  console.log("  Seeded vault with 1,000,000 USDC");

  // Save addresses
  const addresses = {
    network: "westend",
    chainId: CHAIN_ID,
    MockUSDC: mockUSDCAddr,
    RWAOracle: rwaOracleAddr,
    XCMBridge: xcmBridgeAddr,
    TxInterceptor: txInterceptorAddr,
    CrossShieldVault: vaultAddr,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "../frontend/lib");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "deployed-addresses.json"), JSON.stringify(addresses, null, 2));

  console.log("\n✓ Deployment complete!\n");
  console.log("Contract Addresses (Westend Asset Hub):");
  console.log("=========================================");
  console.log(`  MockUSDC:         ${mockUSDCAddr}`);
  console.log(`  RWAOracle:        ${rwaOracleAddr}`);
  console.log(`  XCMBridge:        ${xcmBridgeAddr}`);
  console.log(`  TxInterceptor:    ${txInterceptorAddr}`);
  console.log(`  CrossShieldVault: ${vaultAddr}`);

  return addresses;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
