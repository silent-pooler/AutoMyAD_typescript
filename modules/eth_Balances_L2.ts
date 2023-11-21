import colors from "colors";
import { formatEther } from "viem";
import { scroll } from "viem/chains";
import { HDAccount } from "viem/accounts";

import { createL2PublicClient } from "../helpers/load_publicClient";
export const walletBalance_L2_ETH = async (wallet: HDAccount) => {
  const L1PublicClient = createL2PublicClient(scroll);

  try {
    const balance = await L1PublicClient.getBalance({
      address: wallet.address,
    });

    console.log(wallet.address + " => ", Number(formatEther(balance)), "ETH");
  } catch (error) {
    console.log(colors.red("getBalance wallet error=>"), error);
  }
};
