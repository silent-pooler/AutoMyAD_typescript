import colors from "colors";
import { ERC20ABI } from "../ABI/ERC20ABI";
import { getAddress, formatUnits, formatEther, Address } from "viem";
import { scroll } from "viem/chains";

import { createL2PublicClient } from "../helpers/load_publicClient";

import { ContractDetails } from "../constants/constants";

export const walletBalance_L2_token = async (
  address: Address,
  tokenDetails: ContractDetails
) => {
  const decimals = tokenDetails.decimals;

  const L2PublicClient = createL2PublicClient(scroll);

  try {
    const balance = await L2PublicClient.readContract({
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
