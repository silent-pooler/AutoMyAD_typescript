import { log } from "console";
import colors from "colors";
import { Address, formatEther } from "viem";
import { scroll } from "viem/chains";

import { createL2PublicClient } from "../helpers/load_publicClient";
import { exponentialDelay } from "../helpers/functions";

export const walletBalance_L2_ETH = async (
  walletAddress: Address
): Promise<string | null> => {
  const L2PublicClient = createL2PublicClient(scroll);

  try {
    const balance = await L2PublicClient.getBalance({
      address: walletAddress,
    });
    return formatEther(balance);
  } catch (error) {
    log(colors.red(`getBalance ${walletAddress} error => ${error}`));
    return null;
  }
};

export const fetch_ETH_balance_L2 = async (
  address: Address
): Promise<string | null> => {
  const maxAttempts: number = 5;
  let attempts: number = 0;
  let ETH_balance: string | null = null;

  while (attempts < maxAttempts && ETH_balance === null) {
    attempts += 1;
    ETH_balance = await walletBalance_L2_ETH(address);
    if (ETH_balance !== null) {
      break;
    }
    if (attempts < maxAttempts) {
      await exponentialDelay(1000, attempts);
    }
  }
  return ETH_balance;
};
