import colors from "colors";
import { ERC20ABI } from "../ABI/ERC20ABI";
import { getAddress, formatUnits, formatEther, Address } from "viem";
import { mainnet } from "viem/chains";

import { createL1PublicClient } from "../helpers/load_publicClient";

import { ContractDetails } from "../constants/constants";

export const walletBalance_L1_token = async (
  address: Address,
  tokenDetails: ContractDetails
) => {
  const decimals = tokenDetails.decimals;
  const symbol = tokenDetails.symbol;

  const L1PublicClient = createL1PublicClient(mainnet);

  try {
    const balance = await L1PublicClient.readContract({
      address: getAddress(tokenDetails.address),
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [address],
    });

    if (decimals === 18) {
      return formatEther(balance);
    } else if (decimals === 6) {
      return formatUnits(balance, 6);
    } else {
      console.log(colors.red(`wrong decimals => ${decimals}`));
      throw new Error(`wrong decimals ${tokenDetails.symbol}  `);
    }
  } catch (error) {
    console.log(colors.red(`getBalance ${address} error => ${error}`));
  }
};
