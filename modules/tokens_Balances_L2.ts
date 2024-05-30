import { log } from "console";
import colors from "colors";
import { ERC20ABI } from "../ABI/ERC20ABI";
import { getAddress, formatUnits, formatEther, Address } from "viem";
import { scroll } from "viem/chains";

import { createL2PublicClient } from "../helpers/load_publicClient";
import { exponentialDelay } from "../helpers/functions";

import { ContractDetails } from "../constants/constants";

export const walletBalance_L2_token = async (
  walletAddress: Address,
  token: ContractDetails
): Promise<string | null> => {
  const { address, symbol, decimals } = token;

  const L2PublicClient = createL2PublicClient(scroll);

  try {
    const balance = await L2PublicClient.readContract({
      address: getAddress(address),
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    });
    return formatUnits(balance, decimals);
  } catch (error) {
    console.log(
      colors.red(`getBalance ${address} error => ${error} for token ${symbol}`)
    );
    return null;
  }
};

export const fetch_token_balance_L2 = async (
  walletAddress: Address,
  token: ContractDetails
): Promise<string | null> => {
  const maxAttempts: number = 5;
  let attempts: number = 0;
  let tokenBalance: string | null = null;

  while (attempts < maxAttempts && tokenBalance === null) {
    attempts += 1;
    tokenBalance = await walletBalance_L2_token(walletAddress, token);
    if (tokenBalance !== null) {
      break;
    }
    if (attempts < maxAttempts) {
      await exponentialDelay(1000, attempts);
    }
  }
  return tokenBalance;
};
