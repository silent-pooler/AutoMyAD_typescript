import colors from "colors";
import { formatEther } from "viem";

import { mainnet, scroll } from "viem/chains";

import { getAccounts, accounts } from "../helpers/load_walletsClient";

import {
  createL2PublicClient,
  createL1PublicClient,
} from "../helpers/load_publicClient";

import { Network } from "../constants/constants";

export const walletBalances_ETH = async (network: Network): Promise<void> => {
  getAccounts();

  const publicClient =
    network === "mainnet"
      ? createL1PublicClient(mainnet)
      : createL2PublicClient(scroll);

  console.log(colors.green(`ETH wallet balances for on ${network} start ...`));

  for (let i = 0; i < accounts.length; i++) {
    try {
      const balance = await publicClient.getBalance({
        address: accounts[i].address,
      });

      console.log(
        i + 1,
        accounts[i].address + " => ",
        Number(formatEther(balance)),
        "ETH"
      );
    } catch (error) {
      console.log(colors.red(`getBalance error wallet ${i + 1} =>`), error);
    }
  }

  console.log(colors.green(`ETH wallet balances on ${network} end!`));
};

async function cli(): Promise<void> {
  if (process.argv[2] === "--help") {
    console.log("NETWORK        get wallet ETH balances");
    return;
  }

  const args = process.argv.slice(2);

  if (args.length != 1) {
    console.log(colors.red("Please provide one argument as network"));
  }
  const network = args[0];

  switch (network) {
    case "mainnet":
      walletBalances_ETH("mainnet");
      break;
    case "scroll":
      walletBalances_ETH("scroll");
      break;
    default:
      console.log(colors.red("Invalid network must be 'mainnet' or 'scroll'"));
      throw new Error("Invalid network");
  }
}

cli().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
