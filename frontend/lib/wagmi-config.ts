import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected } from 'wagmi/connectors';

export const polkadotHub = defineChain({
  id: 420420421,
  name: 'Polkadot Asset Hub (Westend)',
  nativeCurrency: { name: 'WND', symbol: 'WND', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://assethub-westend.subscan.io',
    },
  },
});

export const localnet = defineChain({
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [localnet, polkadotHub],
  connectors: [
    injected(),
  ],
  transports: {
    [localnet.id]: http(),
    [polkadotHub.id]: http(),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
