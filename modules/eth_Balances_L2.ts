import colors from "colors";
import { Address, formatEther } from "viem";
import { scroll } from "viem/chains";

import { createL2PublicClient } from "../helpers/load_publicClient";

export const walletBalance_L2_ETH = async (address: Address) => {
  const L2PublicClient = createL2PublicClient(scroll);

  try {
    const balance = await L2PublicClient.getBalance({
      address: address,
    });

    return formatEther(balance);
  } catch (error) {
    console.log(colors.red(`getBalance ${address} error => ${error}`));
  }
};
