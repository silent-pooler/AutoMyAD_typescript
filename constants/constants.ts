// export const GasLimit = {
//     DEPOSIT_ETH: 4e4,
//     DEPOSIT_ERC20: 8e4,
//     WITHDRAW_ETH: 16e4,
//     WITHDRAW_ERC20: 32e4,
//   };

type Token = "USDT" | "USDC" | "WETH";

export interface TokenDetails {
  symbol: string;
  address: string;
  decimals: number;
}

type ScrollMainnetContract = {
  [key in Token]: TokenDetails;
};

export const SCROLL_MAINNET_CONTRACT: ScrollMainnetContract = {
  USDT: {
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  USDC: {
    symbol: "USDC",
    address: "0x80e38291e06339d10aab483c65695d004dbd5c69",
    decimals: 6,
  },
  WETH: {
    symbol: "WETH",
    address: "0x5300000000000000000000000000000000000004",
    decimals: 18,
  },
};
