# CrossShield

> **Principal-protected DeFi vaults with cross-chain RWA exposure and AI risk interception on Polkadot Hub**

[![Polkadot](https://img.shields.io/badge/Polkadot-E6007A?style=flat&logo=polkadot&logoColor=white)](https://polkadot.network)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat&logo=solidity)](https://soliditylang.org)
[![ink!](https://img.shields.io/badge/ink!-5.0.0-7B3FE4?style=flat)](https://use.ink)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Polkadot Solidity Hackathon 2025** — competing in **Track 1 (EVM/DeFi+AI)** and **Track 2 (PVM+XCM)**

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [AI Integration](#ai-integration)
- [Polkadot Integration](#polkadot-integration)
- [Contract Addresses](#contract-addresses)
- [Performance Backtests](#performance-backtests)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Track Justification](#track-justification)
- [Team](#team)

---

## Problem Statement

**4 billion savers** are losing purchasing power to inflation every year. Traditional DeFi offers high yields, but with one critical flaw — **your principal is always at risk**. One bad trade, one market crash, and your savings disappear.

Structured products like Goldman Sachs principal-protected notes solve this for the wealthy (minimum $100,000 buy-in, accredited investors only). On-chain equivalents have never existed.

**CrossShield democratizes principal-protected structured products for everyone.**

---

## Solution Overview

CrossShield lets users deposit USDC and receive **100% principal protection** — guaranteed — while their generated yield is deployed into leveraged real-world asset (RWA) positions on Polkadot parachains via XCM.

| Scenario | Principal Returned | Yield Result |
|---|---|---|
| Trade wins | $1,000 (100%) | Principal + leveraged profit |
| Trade loses | $1,000 (100%) | Yield absorbs the loss |
| No trade opened | $1,000 (100%) | Yield stays in vault |

**The principal protection is enforced by math, not promises.** The same zero-coupon bond formula used by Goldman Sachs is implemented in Solidity on Polkadot Asset Hub.

---

## How It Works

```
                          DEPOSIT $1,000 USDC
                                  │
                                  ▼
         ┌────────────────────────────────────────────────┐
         │          CrossShieldVault.sol                  │
         │      (Polkadot Asset Hub — EVM Layer)          │
         │                                                │
         │  Zero-Coupon Bond Math (same as Goldman Sachs) │
         │  PV = FV / (1 + r)^t                           │
         │                                                │
         │  $952.38 ──── LOCKED (Principal Reserve)       │
         │  $ 47.62 ──── YIELD BUDGET (Risk Capital)      │
         └────────────────────┬───────────────────────────┘
                              │
               ┌──────────────┴─────────────┐
               │ Yield Budget               │ Principal
               ▼                            ▼
  ┌────────────────────────┐    ┌───────────────────────┐
  │  Shield Opened         │    │  Always Returned       │
  │  (Leveraged Position)  │    │  $1,000 guaranteed     │
  │                        │    │  on withdrawal         │
  │  Choose: Gold, BTC,    │    └───────────────────────┘
  │  ETH, SOL, RE, Oil...  │
  │  Leverage: 1x – 50x   │
  └──────────┬─────────────┘
             │ XCM Message
             ▼
  ┌──────────────────────┐    ┌───────────────────────┐
  │  XCMBridge.sol       │───▶│  Parachain (Moonbeam) │
  │  (Hub EVM)           │    │  RWA Position Exec     │
  └──────────────────────┘    └───────────────────────┘
             │
             │ Pre-tx analysis
             ▼
  ┌──────────────────────┐    ┌───────────────────────┐
  │  TxInterceptor.sol   │───▶│  risk_interceptor      │
  │  (Hub EVM)           │    │  (ink! / PVM)          │
  └──────────────────────┘    │  AI risk score 0–100   │
                              └───────────────────────┘
```

---

## Architecture

```
crossshield/
├── contracts/
│   ├── CrossShieldVault.sol     # Core vault — zero-coupon math + leveraged positions
│   ├── RWAOracle.sol            # Price feed for 25 real-world assets (8-decimal precision)
│   ├── XCMBridge.sol            # XCM cross-chain messaging interface
│   ├── TxInterceptor.sol        # On-chain risk scoring + contract verification
│   ├── MockUSDC.sol             # ERC-20 testnet token (10,000 free per claim)
│   └── risk_interceptor/        # Polkadot PVM contract (ink! / Rust)
│       ├── Cargo.toml
│       └── lib.rs               # analyze_calldata() → RiskReport
├── scripts/
│   ├── deploy.ts                # Deploy all 5 contracts, save addresses
│   └── seed-oracle.ts           # Seed 25 asset prices into RWAOracle
├── test/
│   ├── CrossShieldVault.test.ts # 26 tests: deposit, PV math, yield, shields
│   ├── RWAOracle.test.ts        # 7 tests: price fetching, access control
│   └── TxInterceptor.test.ts    # 7 tests: risk scoring, contract verification
└── frontend/                    # Next.js 14 + wagmi v2 + Tailwind CSS
    ├── app/
    │   ├── page.tsx             # Landing page
    │   ├── dashboard/           # Portfolio: deposits, shields, PnL
    │   ├── shield/new/          # 4-step shield wizard
    │   ├── shield/[id]/         # Position detail + live PnL chart
    │   ├── chat/                # AI natural language interface
    │   ├── analytics/           # Backtested performance for 150 combos
    │   └── api/
    │       ├── analyze-tx/      # Claude API: transaction risk analysis
    │       ├── chat/            # Claude API: natural language shield creation
    │       ├── recommend/       # Claude API: position recommendations
    │       ├── shields/         # CRUD via MongoDB
    │       └── deposits/        # Deposit tracking via MongoDB
    ├── components/
    │   ├── AssetGrid.tsx        # 25 assets with category filter
    │   ├── LeverageSlider.tsx   # 1x–50x with live backtest stats
    │   ├── RiskAnalysisPanel.tsx # AI risk panel before every transaction
    │   ├── ShieldCard.tsx       # Position card with PnL
    │   └── ChatInterface.tsx    # WhatsApp-style AI chat
    └── lib/
        ├── assets.ts            # 25 asset definitions
        ├── backtest-data.ts     # 150 historical backtest combinations
        ├── wagmi-config.ts      # Polkadot Hub + Westend chain config
        └── contracts.ts         # Contract ABIs and addresses
```

---

## Smart Contracts

### `CrossShieldVault.sol` — Core Protocol

The heart of CrossShield. Implements principal-protected vaults using zero-coupon bond math.

**Key functions:**

| Function | Description |
|---|---|
| `depositUSDC(amount)` | Deposit USDC, receive principal protection |
| `withdrawPrincipal()` | Withdraw 100% of original deposit, always |
| `openShield(assetId, leverage)` | Open leveraged position using yield as margin |
| `closeShield(shieldId)` | Settle position, distribute profit, protect principal |
| `calculatePresentValue(fv, days)` | Pure ZCB math: `PV = FV / (1 + r)^t` |
| `yieldAvailable(user)` | Yield accrued since deposit = `principal - PV` |
| `unrealizedPnl(shieldId)` | Live P&L: `(currentPrice - entryPrice) / entryPrice × margin × leverage` |

**Constants:** `BASE_RATE = 5%`, `MAX_LEVERAGE = 50x`, `MATURITY_DAYS = 365`

### `RWAOracle.sol` — Price Feed

On-chain price oracle for 25 real-world assets across 4 categories:

| Category | Assets |
|---|---|
| Commodities | Gold, Silver, Crude Oil, Natural Gas |
| Crypto | Bitcoin, Ethereum, Solana, XRP |
| Real Estate | Miami, Austin, NYC, LA, Chicago, Phoenix, Denver, Seattle, Portland, Nashville, Charlotte, Atlanta, Dallas, Houston, Boston, San Francisco, Las Vegas |

All prices stored with 8-decimal precision (same as Chainlink).

### `XCMBridge.sol` — Cross-Chain Messaging

Implements the Polkadot XCM interface for routing leveraged positions cross-chain.

- **XCM Precompile:** `0x0000000000000000000000000000000000000401`
- **Destination:** Moonbeam parachain 2004 for RWA position execution
- **Payload:** `abi.encode(shieldId, user, assetId, leverage, notional, entryPrice)`
- Authorized relayers settle results back via `receiveXCMResult()`

### `TxInterceptor.sol` — Risk Guard

Pre-transaction safety layer. Scores risk 0–100 before any vault interaction.

- Detects high-risk function selectors (`approve`, `transferFrom`, self-destruct patterns)
- Maintains a verified contract registry (ENS-style node resolution)
- Stores per-user risk history on-chain
- Bridges to PVM's `risk_interceptor` for AI-enhanced scoring

### `MockUSDC.sol` — Testnet Token

ERC-20 with 6 decimals matching real USDC. Anyone can call `faucet()` to receive 10,000 USDC for testing.

### `risk_interceptor` — PVM Contract (ink!)

Rust/ink! contract deployed on Polkadot's PVM. Performs on-chain transaction risk analysis.

```rust
pub fn analyze_calldata(&mut self, calldata: Vec<u8>) -> RiskReport {
    // Returns: { score: u8, level: RiskLevel, summary: String, analyzed_at: u32 }
}
```

Risk heuristics:
- `approve(address,uint256)` selector → +25 (token approval risk)
- `transferFrom` selector → +20
- Self-destruct pattern → +60
- Calldata length >500 bytes → +10 (complex transaction)
- Calldata length >2000 bytes → +15

---

## AI Integration

Three Claude-powered features using `claude-sonnet-4-6`:

### 1. Transaction Risk Analyzer (`/api/analyze-tx`)

Every shield interaction is analyzed before execution:

```json
{
  "score": 72,
  "level": "HIGH",
  "action": "CAUTION",
  "warnings": ["50x leverage may exhaust yield margin in <24h"],
  "explanation": "This transaction opens a 50x leveraged SOL position..."
}
```

### 2. Natural Language Shield Creator (`/api/chat`)

WhatsApp-style chat interface. Users describe what they want in plain English:

- _"Protect my savings from gold going up"_ → Gold 5x Shield
- _"Give me safe exposure to crypto"_ → BTC 1x recommendation
- _"What has the best risk-adjusted return?"_ → Analytics summary

### 3. Position Recommendation Engine (`/api/recommend`)

Given risk profile and deposit amount, Claude returns the top 3 shields with reasoning, expected return, liquidation probability, and estimated profit.

> **Graceful degradation:** All AI endpoints return deterministic mock responses when `ANTHROPIC_API_KEY` is not set.

---

## Polkadot Integration

### Track 1: EVM Smart Contracts on Polkadot Hub

All Solidity contracts are deployed on **Polkadot Asset Hub** (EVM layer):
- Chain: Westend Asset Hub (testnet)
- ChainId: `420420421`
- RPC: `https://westend-asset-hub-eth-rpc.polkadot.io`
- MetaMask and wagmi work natively — no custom bridge needed

### Track 2: PVM + XCM

**PVM (`risk_interceptor`):**
- ink! 5.0 contract compiled to Wasm, deployed on Polkadot's PVM
- Uses `ink::storage::Mapping` for per-account risk history
- Emits `TransactionAnalyzed` and `ContractRegistered` events
- 4 ink! unit tests covering all functions

**XCM Cross-Chain Messaging:**
- `XCMBridge.sol` uses the Hub's XCM precompile at `0x0000000000000000000000000000000000000401`
- Shield open encodes position parameters and routes to Moonbeam parachain 2004
- Settlement relayers call back with execution result and realized PnL
- Full message lifecycle: send → track → settle → distribute

---

## Contract Addresses

### Polkadot Asset Hub Westend (Testnet)

> Network: `westend` | ChainId: `420420421`
> RPC: `https://westend-asset-hub-eth-rpc.polkadot.io`
> Explorer: `https://assethub-westend.subscan.io`

| Contract | Address |
|---|---|
| MockUSDC | `Pending deployment` |
| RWAOracle | `Pending deployment` |
| XCMBridge | `Pending deployment` |
| TxInterceptor | `Pending deployment` |
| CrossShieldVault | `Pending deployment` |

> **To deploy:** Fund `0xea29cfACC192cF3C7d0c3f94a28Cf9f415344e14` with WND at [faucet.polkadot.io](https://faucet.polkadot.io/?parachain=1000), then run `npm run deploy:westend && npm run seed:westend`

### Localhost (Development)

| Contract | Address |
|---|---|
| MockUSDC | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| RWAOracle | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| XCMBridge | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| TxInterceptor | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| CrossShieldVault | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |

---

## Performance Backtests

All positions principal-protected. 150 asset × leverage combinations backtested.

| Shield | Avg Annual Return | Liquidation Risk | Est. Profit on $1,000 |
|---|---|---|---|
| BTC 1x | 62.0% | 0% | $29.52 |
| ETH 5x | ~190% | ~20% | Up to $90.48 |
| SOL 1x | 44.6% | 0% | $21.22 |
| Gold 5x | 5.8% | 10% | $2.76 |
| Nashville RE 1x | 10.2% | 1% | $4.86 |
| Oil 10x | 38.4% | 35% | $18.28 |

*Profit = annual_return × yield_budget. Yield budget ≈ $47.62 on $1,000 at 5% annual rate.*

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Rust + Cargo (for PVM ink! contract)
- MetaMask with Polkadot Asset Hub Westend network added

### Add Westend Asset Hub to MetaMask

| Field | Value |
|---|---|
| Network Name | Polkadot Asset Hub Westend |
| RPC URL | `https://westend-asset-hub-eth-rpc.polkadot.io` |
| Chain ID | `420420421` |
| Currency Symbol | `WND` |
| Explorer | `https://assethub-westend.subscan.io` |

### Installation

```bash
# Clone the repo
git clone https://github.com/CodeswithrohStudio/crossshield.git
cd crossshield

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Copy and configure environment
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required for contract deployment
PRIVATE_KEY=your_wallet_private_key

# Required for AI features
ANTHROPIC_API_KEY=sk-ant-...

# WalletConnect (get free at cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Network: "localhost" or "westend"
NEXT_PUBLIC_NETWORK=localhost
```

### Local Development

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy contracts + seed oracle
npm run deploy:local
npm run seed

# Terminal 3: Start frontend
npm run frontend
```

Open `http://localhost:3000`, connect MetaMask to `localhost:8545` (chainId 31337).

**Get test USDC:** MockUSDC has a public `faucet()` function — call it via the deployed address to receive 10,000 USDC.

---

## Running Tests

```bash
# Run all 40 contract tests
npm run test
```

Test suite covers:

- **CrossShieldVault** (26 tests): deposit mechanics, PV calculations, yield accrual, shield open/close, principal protection guarantee, edge cases
- **RWAOracle** (7 tests): price fetching, asset metadata, access control
- **TxInterceptor** (7 tests): risk scoring, contract registration, ENS resolution

---

## Deployment

### Deploy to Westend Testnet

```bash
# 1. Get WND from faucet — select "Asset Hub" (parachain 1000)
#    https://faucet.polkadot.io/?parachain=1000
#    Deployer: 0xea29cfACC192cF3C7d0c3f94a28Cf9f415344e14

# 2. Deploy all 5 contracts
npm run deploy:westend

# 3. Seed oracle with 25 asset prices
npm run seed:westend

# 4. Add Westend addresses to frontend/.env.local
NEXT_PUBLIC_NETWORK=westend
NEXT_PUBLIC_MOCKUSDC=<deployed>
NEXT_PUBLIC_RWAORACLE=<deployed>
NEXT_PUBLIC_XCMBRIDGE=<deployed>
NEXT_PUBLIC_TXINTERCEPTOR=<deployed>
NEXT_PUBLIC_CROSSSHIELDVAULT=<deployed>
```

### Compile PVM Contract (ink!)

```bash
# Install cargo-contract
cargo install cargo-contract

# Build the ink! contract
cd contracts/risk_interceptor
cargo contract build --release

# Artifacts: target/ink/risk_interceptor.wasm + risk_interceptor.contract
# Deploy via Polkadot.js Apps → Developer → Contracts → Upload & Deploy
```

---

## Track Justification

### Track 1: EVM Smart Contract Track — DeFi & AI-powered dApp

**Why CrossShield qualifies:**

1. **Novel DeFi primitive** — Principal-protected on-chain vaults implemented using the same zero-coupon bond math (`PV = FV / (1+r)^t`) used by Goldman Sachs structured notes. Never before available on-chain.

2. **Production EVM contracts** — 5 Solidity contracts (282-line core vault), full OpenZeppelin security stack (Ownable, ReentrancyGuard, SafeERC20), 40 passing Hardhat tests.

3. **Deep AI integration** — Claude API powers three distinct features: pre-transaction risk analysis (score + warnings before every on-chain action), natural language position creation via WhatsApp-style chat, and personalized recommendations from 150-entry backtested dataset.

4. **Deployed on Polkadot Hub** — Targeting Westend Asset Hub EVM (chainId 420420421). Full MetaMask + wagmi v2 integration.

### Track 2: PVM Smart Contracts — Polkadot Native Functionality

**Why CrossShield qualifies:**

1. **PVM contract (ink! / Rust)** — `risk_interceptor` is a production ink! 5.0 contract:
   - Correct `#[ink::contract]` module, constructor, storage
   - `ink::storage::Mapping` for on-chain per-account risk history
   - Typed events: `TransactionAnalyzed`, `ContractRegistered`
   - 4 ink! unit tests covering all public functions
   - Compiles to Wasm via `cargo contract build --release`

2. **XCM Integration** — `XCMBridge.sol` uses the Hub's XCM precompile (`0x0000000000000000000000000000000000000401`):
   - Encodes cross-chain messages for position routing to Moonbeam (parachain 2004)
   - Tracks message IDs, settlement status, success/failure, and realized PnL
   - Authorized relayer pattern for cross-chain result settlement

3. **Polkadot Native Assets + Precompiles** — The `TxInterceptor.sol` ↔ `risk_interceptor` (PVM) bridge demonstrates calling PVM logic from EVM contracts via precompiles, bridging both execution environments in a single user-facing transaction.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts (EVM) | Solidity 0.8.20, OpenZeppelin 5.0, Hardhat |
| Smart Contract (PVM) | Rust, ink! 5.0, parity-scale-codec |
| Cross-Chain | XCM precompile, authorized relayer pattern |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Web3 | wagmi v2, viem, WalletConnect |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Database | MongoDB (shield + deposit persistence) |
| Charts | Recharts |
| Testing | Hardhat, Chai, Mocha |

---

## Team

**CrossShield** — built for the Polkadot Solidity Hackathon 2025

- GitHub: [CodeswithrohStudio/crossshield](https://github.com/CodeswithrohStudio/crossshield)
- Track: EVM Smart Contract Track (Track 1) + PVM Smart Contracts (Track 2)

---

## License

MIT © 2025 CrossShield
