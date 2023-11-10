import { ERC20ABI } from "../ABI/ERC20ABI";
import { getContract, createPublicClient, http } from "viem";
import { scrollSepolia, sepolia, mainnet, scroll } from "viem/chains";
import { HDAccount } from "viem/accounts";

import * as dotenv from "dotenv";
dotenv.config();

import {
  getWallets,
  getL2Wallets,
  L2Wallets,
} from "../helpers/load_walletsClient";

import {
  createL1PublicClient,
  createL2PublicClient,
} from "../helpers/load_publicClient";

import { SCROLL_MAINNET_CONTRACT } from "../constants/constants";
import { TokenDetails } from "../constants/constants";

const L2PublicClient = createL2PublicClient(scroll);

const tokenContract = getContract({
  address: SCROLL_MAINNET_CONTRACT.USDT.address as `0x${string}`,
  abi: ERC20ABI,
  publicClient: L2PublicClient,
});

export const walletBalance_L2_token = async (
  wallet: HDAccount,
  tokenDetails: TokenDetails
) => {
  const decimals = tokenDetails.decimals;

  const symbol = tokenDetails.symbol;

  console.log(
    `------------------------------- Wallet balances for ${symbol} on L2 start ...`
  );

  try {
    const balance = await tokenContract.read.balanceOf([wallet.address]);

    if (decimals === 18) {
      console.log(
        i + 1,
        wallet.address + " => ",
        Number(balance.toString()),
        symbol
      );
    } else if (decimals === 6) {
      console.log(
        i + 1,
        wallet.address + " => ",
        Number(balance.toString()),
        symbol
      );
    } else {
      console.log("\x1b[31m%s\x1b[0m", "wrong decimals =>", decimals);
    }
  } catch (error) {
    console.log(`getBalance error wallet ${i + 1} =>`, error);
  }

  console.log(
    `------------------------------- Wallet balances for ${symbol} on L2 end!`
  );
};
