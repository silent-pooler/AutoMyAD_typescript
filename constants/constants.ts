// export const GasLimit = {
//     DEPOSIT_ETH: 4e4,
//     DEPOSIT_ERC20: 8e4,
//     WITHDRAW_ETH: 16e4,
//     WITHDRAW_ERC20: 32e4,
//   };

import { Address } from "viem";

export type Network = "mainnet" | "scroll";

enum ScrollMainnetContractNames {
  USDT = "USDT",
  USDC = "USDC",
  WETH = "WETH",
  SYNCSWAP_CLASSIC_POOL_FACTORY = "SYNCSWAP_CLASSIC_POOL_FACTORY",
  SYNCSWAP_ROUTER = "SYNCSWAP_ROUTER",
}

enum MainnetContractNames {
  USDT = "USDT",
  USDC = "USDC",
  WETH = "WETH",
}

enum InterractionContractNames {
  SYNCSWAP_CLASSIC_POOL_FACTORY = "SYNCSWAP_CLASSIC_POOL_FACTORY",
  SYNCSWAP_ROUTER = "SYNCSWAP_ROUTER",
}
enum SwapableTokenNames {
  USDT = "USDT",
  USDC = "USDC",
  WETH = "WETH",
}

export interface ContractDetails {
  address: Address;
  symbol?: string;
  decimals?: number;
}

type ScrollMainnetContracts = {
  [key in ScrollMainnetContractNames]: ContractDetails;
};

type MainnetContracts = {
  [key in MainnetContractNames]: ContractDetails;
};

export type SwapableNetworkContracts = {
  [key in SwapableTokenNames]: ContractDetails;
};

export type InterractionContracts = {
  [key in InterractionContractNames]: Address;
};

export const SCROLL_MAINNET_CONTRACT: ScrollMainnetContracts = {
  USDT: {
    symbol: "USDT",
    address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
    decimals: 6,
  },
  USDC: {
    symbol: "USDC",
    address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    decimals: 6,
  },
  WETH: {
    symbol: "WETH",
    address: "0x5300000000000000000000000000000000000004",
    decimals: 18,
  },
  SYNCSWAP_CLASSIC_POOL_FACTORY: {
    address: "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d",
  },
  SYNCSWAP_ROUTER: {
    address: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
  },
};

export const MAINNET_CONTRACT: MainnetContracts = {
  USDT: {
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  USDC: {
    symbol: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  WETH: {
    symbol: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
  },
};

export const ZERO_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export interface TransactionParameters {
  min_delay: number;
  max_delay: number;
  min_amount_stable: number;
  max_amount_stable: number;
}

export const TRANSACTION_PARAMETERS: TransactionParameters = {
  min_delay: 1800, // in s = 30 mn
  max_delay: 14400, // in s = 4 h
  min_amount_stable: 2,
  max_amount_stable: 12,
};
