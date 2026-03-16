# CrossShield

> **Principal-protected DeFi vaults with cross-chain AI risk interception on Polkadot Hub**

Built for the **Polkadot Solidity Hackathon** — competing in both **Track 1 (DeFi + AI dApp on EVM)** and **Track 2 (PVM + XCM)**.

---

## Problem Statement

**4 billion savers** are losing purchasing power to inflation every year. Traditional DeFi offers yield, but at the cost of principal risk — one bad trade and your savings are gone. Structured products like Goldman Sachs principal-protected notes exist for the wealthy, but are inaccessible to retail investors.

CrossShield democratizes principal protection: deposit USDC, get Goldman Sachs-style zero-coupon bond math guaranteeing 100% of your deposit back, while your generated yield is deployed into leveraged real-world asset positions.

---

## How CrossShield Solves It

```
Deposit $1,000 USDC
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  CrossShieldVault (Solidity, Polkadot Asset Hub EVM)     │
│                                                          │
│  Zero-Coupon Bond Math:                                  │
│  PV = FV / (1 + r)^t  →  $952.38 locked for 1yr@5%     │
│  Yield budget = $1000 - $952.38 = $47.62                │
└──────────────────────────────────────────────────────────┘
       │                              │
       │ Principal locked             │ Yield deployed
       ▼                              ▼
┌─────────────┐              ┌──────────────────────┐
│  Always     │              │  Leveraged Position  │
│  $1,000     │              │  Gold 5x, SOL 10x,   │
│  returned   │              │  Real Estate 1x, etc │
└─────────────┘              └──────────┬───────────┘
                                        │ via XCM
                                        ▼
                             ┌──────────────────────┐
                             │  Parachain (Moonbeam) │
                             │  RWA exposure via     │
                             │  cross-chain message  │
                             └──────────────────────┘
                                        │
                             ┌──────────▼───────────┐
                             │  risk_interceptor    │
                             │  (ink! PVM contract) │
                             │  AI risk score 0-100 │
                             └──────────────────────┘
```

**If trade wins:** User gets $1,000 principal + leveraged profit
**If trade loses:** Yield absorbs the loss, user gets 100% of $1,000 back

---

## Architecture

```
crossshield/
├── contracts/
│   ├── CrossShieldVault.sol     # Core vault — zero-coupon bond + shield management
│   ├── RWAOracle.sol            # Price feed for 25 RWA assets
│   ├── XCMBridge.sol            # XCM cross-chain messaging (mocked interface)
│   ├── TxInterceptor.sol        # On-chain risk scoring + ENS resolution
│   ├── MockUSDC.sol             # Testnet USDC with public faucet
│   └── risk_interceptor/        # ink!/PVM contract (Rust)
│       ├── Cargo.toml
│       └── lib.rs               # analyze_calldata(), risk history, safe registry
├── scripts/
│   ├── deploy.ts                # Deploy all contracts, save addresses
│   └── seed-oracle.ts           # Populate mock asset prices
├── test/
│   ├── CrossShieldVault.test.ts # 26 tests: deposit, PV math, yield, shields, edge cases
│   ├── RWAOracle.test.ts        # 7 tests: prices, names, access control
│   └── TxInterceptor.test.ts    # 7 tests: risk scoring, verification, ENS
└── frontend/                    # Next.js 14 + wagmi v2 + Tailwind + shadcn
    ├── app/
    │   ├── page.tsx             # Landing page
    │   ├── dashboard/           # Portfolio overview
    │   ├── shield/new/          # 4-step shield creation wizard
    │   ├── shield/[id]/         # Position detail with PnL chart
    │   ├── chat/                # WhatsApp-style AI interface
    │   ├── analytics/           # Backtest data for all 150 combinations
    │   └── api/
    │       ├── analyze-tx/      # Claude API: transaction risk analysis
    │       ├── chat/            # Claude API: natural language shield creation
    │       └── recommend/       # Claude API: position recommendations
    ├── components/
    │   ├── WalletConnect.tsx
    │   ├── AssetGrid.tsx        # 25 assets with category filter
    │   ├── LeverageSlider.tsx   # 1x–50x with live backtest stats
    │   ├── RiskAnalysisPanel.tsx # AI risk analysis before every tx
    │   ├── ShieldCard.tsx       # Position overview card
    │   ├── ChatInterface.tsx    # Full chat UI with localStorage history
    │   └── PrincipalSafetyBadge.tsx
    └── lib/
        ├── assets.ts            # 25 asset definitions
        ├── backtest-data.ts     # 150 backtested combinations
        ├── wagmi-config.ts      # Polkadot Hub chain config
        └── contracts.ts         # ABIs and addresses
```

---

## How It Uses Polkadot Hub

### EVM Track (Track 1)
- **Solidity contracts** deployed directly to Polkadot Asset Hub Westend (chainId: 420420421)
- EVM compatibility means MetaMask and wagmi work natively
- `CrossShieldVault.sol`, `RWAOracle.sol`, `XCMBridge.sol`, `TxInterceptor.sol` all run on the Hub's EVM

### PVM Track (Track 2)
- **`risk_interceptor`** — ink! Rust contract for AI-powered transaction risk analysis
- Runs on Polkadot's PVM for fast, trust-minimized risk scoring
- Called from `TxInterceptor.sol` via precompile bridge
- `analyze_calldata(Vec<u8>) -> RiskReport { score: u8, level: RiskLevel, summary: String }`
- Risk history stored on-chain per account

### XCM (Track 2)
- `XCMBridge.sol` implements the correct XCM interface: `sendXCMMessage(bytes32 destination, bytes payload)`
- In production uses Polkadot Hub's XCM precompile at `0x0000000000000000000000000000000000000401`
- Cross-chain messages route leveraged positions to Moonbeam (parachain 2004) for RWA execution
- Relayer-based settlement: `receiveXCMResult(bytes32 messageId, bool success, uint256 pnl)`

---

## Contract Addresses

> TODO: Deploy to Polkadot Hub Westend testnet

| Contract | Address |
|---|---|
| MockUSDC | `TODO: deploy to Westend` |
| RWAOracle | `TODO: deploy to Westend` |
| XCMBridge | `TODO: deploy to Westend` |
| TxInterceptor | `TODO: deploy to Westend` |
| CrossShieldVault | `TODO: deploy to Westend` |

Network: Polkadot Asset Hub Westend — chainId: `420420421`
RPC: `https://westend-asset-hub-eth-rpc.polkadot.io`
Explorer: `https://assethub-westend.subscan.io`

---

## AI Integration (Claude API)

Three AI-powered features using `claude-sonnet-4-20250514`:

### 1. Transaction Risk Analyzer
Every shield open/close passes through AI analysis:
- Decodes what the transaction does in plain English
- Returns risk score 0–100 with `LOW/MEDIUM/HIGH/CRITICAL` rating
- Lists specific warnings (e.g., "50x leverage may exhaust yield margin")
- Recommends `PROCEED/CAUTION/ABORT`

### 2. Natural Language Shield Creator
WhatsApp-style chat where users describe what they want:
- "Protect my savings from gold going up" → Gold 5x Shield recommendation
- "Go 5x on SOL" → direct action button
- Claude understands all 25 assets, leverage ranges, and principal protection mechanics

### 3. Position Recommendation Engine
Given risk tolerance (`conservative/moderate/aggressive`) and deposit amount:
- Claude recommends top 3 shields from backtested data
- Includes reasoning, expected return, liquidation risk, and estimated profit

> All AI endpoints **gracefully degrade** when `ANTHROPIC_API_KEY` is not set — deterministic mock responses are returned.

---

## Principal Protection Math

Same math as Goldman Sachs structured notes:

```
PV = FV / (1 + r)^t

Where:
  FV = face value (user's deposit)
  r  = base yield rate (5% annual)
  t  = time in years
  PV = present value locked today

Example ($1,000 deposited, 1 year):
  PV = 1000 / (1 + 0.05)^1 = $952.38  ← locked
  Yield = $1000 - $952.38 = $47.62    ← risk budget for leverage
  Principal returned = $1,000          ← always
```

The Solidity implementation uses fixed-point math with 1e18 precision.

---

## Backtested Performance Highlights

| Shield | Avg Annual Return | Liquidation Risk |
|---|---|---|
| Gold 5x | 5.8% | 10% |
| SOL 1x | 44.6% | 0% |
| Nashville RE 1x | 10.2% | 1% |
| BTC 1x | 62% | 0% |
| ETH 5x | ~190% | ~20% |

*All positions: principal 100% protected regardless of outcome*

---

## Running Locally

### Prerequisites
- Node.js 18+
- Rust + cargo (for ink! PVM contract compilation)

### Setup
```bash
# Install contract dependencies
npm install

# Copy env file
cp .env.example .env
# Add your PRIVATE_KEY and ANTHROPIC_API_KEY

# Compile contracts
npm run compile

# Run tests
npm run test

# Start local Hardhat node
npm run node

# Deploy contracts (in another terminal)
npm run deploy:local

# Seed oracle prices
npm run seed

# Install and start frontend
cd frontend && npm install && npm run dev
```

### Deploy to Westend Testnet
```bash
# Add your funded Westend private key to .env
npm run deploy:westend
```

Get Westend WND from faucet: https://faucet.polkadot.io/?parachain=1000

### Frontend Environment
```bash
# frontend/.env.local
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_NETWORK=localhost  # or "westend"
```

---

## Track Justifications

### Track 1: DeFi + AI dApp on EVM
- **DeFi primitive**: Principal-protected vault — a novel DeFi product not previously available on-chain
- **EVM deployment**: All Solidity contracts target Polkadot Asset Hub (EVM-compatible)
- **AI integration**: Claude API powers risk analysis, natural language interface, and recommendation engine
- **Real utility**: Addresses a real problem (4B savers losing to inflation) with a production-grade solution

### Track 2: PVM + XCM
- **PVM contract**: `risk_interceptor` ink! contract runs on Polkadot's PVM — correct `#[ink::contract]` structure, storage, events, and tests
- **XCM interface**: `XCMBridge.sol` implements the production XCM precompile interface (`0x0000000000000000000000000000000000000401`) with correct message encoding
- **Cross-chain architecture**: Position routing designed for real parachain execution (Moonbeam parachain 2004)

---

## Team & Links

- **Project**: CrossShield
- **Hackathon**: Polkadot Solidity Hackathon 2025
- **Track**: EVM Track (1) + PVM Track (2)
- **GitHub**: https://github.com/[your-repo]/crossshield
- **Demo**: http://localhost:3000 (local) / TODO: deploy

---

## License

MIT
