import * as envEnc from "@chainlink/env-enc";
envEnc.config();
// import * as dotenv from "dotenv";
// dotenv.config();

import {
  PublicActions,
  WalletClient,
  createWalletClient,
  fallback,
  http,
  publicActions,
} from "viem";
import { HDAccount, mnemonicToAccount } from "viem/accounts";
import { mainnet, scroll } from "viem/chains";

import { shuffleWallets } from "./functions";

export const accounts: HDAccount[] = [];

export const getAccounts = () => {
  for (let i = 0; i < 15; i++) {
    accounts[i] = mnemonicToAccount(process.env.SEED_1 || "", {
      addressIndex: i,
    });
  }
  for (let j = 0; j < 15; j++) {
    accounts[j + 15] = mnemonicToAccount(process.env.SEED_2 || "", {
      addressIndex: j,
    });
  }
};

export interface WalletClientWithPublicActions
  extends WalletClient,
    PublicActions {}

export const L1Wallets: WalletClientWithPublicActions[] = [];

export const getL1Wallets = () => {
  for (let i = 0; i < 30; i++) {
    L1Wallets[i] = createWalletClient({
      account: accounts[i],
      chain: mainnet,
      transport: http(process.env.ETHEREUM_MAINNET_RPC_URL),
    }).extend(publicActions);
  }
};

export const L2Wallets: WalletClientWithPublicActions[] = [];

export const getL2Wallets = () => {
  for (let i = 0; i < 30; i++) {
    L2Wallets[i] = createWalletClient({
      account: accounts[i],
      chain: scroll,
      transport: fallback(
        [
          http(process.env.SCROLL_MAINNET_RPC_URL),
          http("https://scroll.drpc.org"),
          http("https://1rpc.io/scroll"),
          http("https://rpc.scroll.io/"),
        ],
        { rank: true }
      ),
    }).extend(publicActions);
  }
};

export const getWallets = () => {
  getAccounts();
  getL1Wallets();
  getL2Wallets();
};

export const getShuffledWallets = () => {
  getAccounts();
  shuffleWallets(accounts);
  getL1Wallets();
  getL2Wallets();
};
