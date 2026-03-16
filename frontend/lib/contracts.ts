import { Abi } from 'viem';

// Default addresses for localhost (overridden by deployed-addresses.json after deploy)
const DEFAULT_ADDRESSES = {
  MockUSDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  RWAOracle: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  XCMBridge: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
  TxInterceptor: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as `0x${string}`,
  CrossShieldVault: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as `0x${string}`,
};

export const CONTRACT_ADDRESSES = DEFAULT_ADDRESSES;

// CrossShieldVault ABI (key functions)
export const VAULT_ABI = [
  {
    name: 'depositUSDC',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdrawPrincipal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'openShield',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assetId', type: 'uint8' },
      { name: 'leverage', type: 'uint8' },
    ],
    outputs: [{ name: 'shieldId', type: 'uint256' }],
  },
  {
    name: 'closeShield',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shieldId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'yieldAvailable',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'yield', type: 'uint256' }],
  },
  {
    name: 'calculatePresentValue',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      { name: 'faceValue', type: 'uint256' },
      { name: 'maturityDays', type: 'uint256' },
    ],
    outputs: [{ name: 'pv', type: 'uint256' }],
  },
  {
    name: 'getDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'principal', type: 'uint256' },
          { name: 'depositedAt', type: 'uint256' },
          { name: 'maturityTime', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getShield',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shieldId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'owner', type: 'address' },
          { name: 'assetId', type: 'uint8' },
          { name: 'leverage', type: 'uint8' },
          { name: 'entryPrice', type: 'uint256' },
          { name: 'marginUsed', type: 'uint256' },
          { name: 'openedAt', type: 'uint256' },
          { name: 'isOpen', type: 'bool' },
          { name: 'xcmMessageId', type: 'bytes32' },
          { name: 'realizedPnl', type: 'int256' },
        ],
      },
    ],
  },
  {
    name: 'getUserShields',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'unrealizedPnl',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shieldId', type: 'uint256' }],
    outputs: [{ name: 'pnl', type: 'int256' }],
  },
  {
    name: 'totalDeposited',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'PrincipalDeposited',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'maturityTime', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'ShieldOpened',
    type: 'event',
    inputs: [
      { name: 'shieldId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'assetId', type: 'uint8', indexed: false },
      { name: 'leverage', type: 'uint8', indexed: false },
      { name: 'margin', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'ShieldClosed',
    type: 'event',
    inputs: [
      { name: 'shieldId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'pnl', type: 'int256', indexed: false },
      { name: 'principalSafe', type: 'bool', indexed: false },
    ],
  },
] as const satisfies Abi;

export const ORACLE_ABI = [
  {
    name: 'getPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'assetId', type: 'uint8' }],
    outputs: [{ name: 'price', type: 'uint256' }],
  },
  {
    name: 'assetName',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'assetId', type: 'uint8' }],
    outputs: [{ name: 'name', type: 'string' }],
  },
] as const satisfies Abi;

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'faucet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const satisfies Abi;
