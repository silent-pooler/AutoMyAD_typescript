import colors from "colors";
import { ERC20ABI } from "../ABI/ERC20ABI";
import { getAddress, formatUnits, formatEther } from "viem";
import { mainnet } from "viem/chains";
import { HDAccount } from "viem/accounts";

import { createL1PublicClient } from "../helpers/load_publicClient";

import { TokenDetails } from "../constants/constants";

export const walletBalance_L1_token = async (
  wallet: HDAccount,
  tokenDetails: TokenDetails
) => {
  const decimals = tokenDetails.decimals;
  const symbol = tokenDetails.symbol;

  const L1PublicClient = createL1PublicClient(mainnet);

  try {
    const balance = await L1PublicClient.readContract({
      address: getAddress(tokenDetails.address),
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [wallet.address],
    });

    if (decimals === 18) {
      console.log(
        wallet.address + " => ",
        Number(formatEther(balance)),
        symbol
      );
    } else if (decimals === 6) {
      console.log(
        wallet.address + " => ",
        Number(formatUnits(balance, 6)),
        symbol
      );
    } else {
      console.log(colors.red("wrong decimals =>"), decimals);
    }
  } catch (error) {
    console.log(colors.red(`getBalance ${wallet.address} error =>`), error);
  }
};
