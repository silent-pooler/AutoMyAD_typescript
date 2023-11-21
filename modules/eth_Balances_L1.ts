import colors from "colors";
import { formatEther } from "viem";
import { mainnet } from "viem/chains";
import { HDAccount } from "viem/accounts";
import { createL1PublicClient } from "../helpers/load_publicClient";

export const walletBalance_L1_ETH = async (wallet: HDAccount) => {
  const L1PublicClient = createL1PublicClient(mainnet);

  try {
    const balance = await L1PublicClient.getBalance({
      address: wallet.address,
    });

    console.log(wallet.address + " => ", Number(formatEther(balance)), "ETH");
  } catch (error) {
    console.log(colors.red("getBalance wallet error=>"), error);
  }
};
