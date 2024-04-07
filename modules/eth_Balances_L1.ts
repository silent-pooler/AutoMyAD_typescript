import colors from "colors";
import { Address, formatEther } from "viem";
import { mainnet } from "viem/chains";
import { createL1PublicClient } from "../helpers/load_publicClient";

export const walletBalance_L1_ETH = async (address: Address) => {
  const L1PublicClient = createL1PublicClient(mainnet);

  try {
    const balance = await L1PublicClient.getBalance({
      address: address,
    });

    return formatEther(balance);
  } catch (error) {
    console.log(colors.red(`getBalance ${address} error => ${error}`));
  }
};
