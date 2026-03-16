import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const ASSETS = [
  { id: 0,  name: "Gold",             price: 320000000000n },
  { id: 1,  name: "Silver",           price: 3200000000n },
  { id: 2,  name: "Crude Oil",        price: 7800000000n },
  { id: 3,  name: "Natural Gas",      price: 350000000n },
  { id: 4,  name: "Bitcoin",          price: 8500000000000n },
  { id: 5,  name: "Ethereum",         price: 220000000000n },
  { id: 6,  name: "Solana",           price: 14500000000n },
  { id: 7,  name: "XRP",              price: 55000000n },
  { id: 8,  name: "Miami RE",         price: 48500000000n },
  { id: 9,  name: "Austin RE",        price: 42000000000n },
  { id: 10, name: "NYC RE",           price: 82000000000n },
  { id: 11, name: "LA RE",            price: 72000000000n },
  { id: 12, name: "Chicago RE",       price: 31000000000n },
  { id: 13, name: "Phoenix RE",       price: 38000000000n },
  { id: 14, name: "Denver RE",        price: 49000000000n },
  { id: 15, name: "Seattle RE",       price: 62000000000n },
  { id: 16, name: "Portland RE",      price: 44500000000n },
  { id: 17, name: "Nashville RE",     price: 39000000000n },
  { id: 18, name: "Charlotte RE",     price: 34000000000n },
  { id: 19, name: "Atlanta RE",       price: 36000000000n },
  { id: 20, name: "Dallas RE",        price: 35000000000n },
  { id: 21, name: "Houston RE",       price: 29000000000n },
  { id: 22, name: "Boston RE",        price: 58000000000n },
  { id: 23, name: "San Francisco RE", price: 78000000000n },
  { id: 24, name: "Las Vegas RE",     price: 38000000000n },
];

async function main() {
  const addressFile = path.join(__dirname, "../frontend/lib/deployed-addresses.json");

  if (!fs.existsSync(addressFile)) {
    console.error("deployed-addresses.json not found. Run deploy.ts first.");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressFile, "utf8"));
  const oracle = await ethers.getContractAt("RWAOracle", addresses.RWAOracle);
  const [owner] = await ethers.getSigners();

  console.log(`Seeding oracle at ${addresses.RWAOracle}...`);

  for (const asset of ASSETS) {
    await oracle.updatePrice(asset.id, asset.price);
    console.log(`  Updated ${asset.name}: $${Number(asset.price) / 1e8}`);
  }

  console.log("\nOracle seeding complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
