import colors from "colors";
import { ERC20ABI } from "../ABI/ERC20ABI";
import { getAddress, formatEther, formatUnits } from "viem";

import { mainnet, scroll } from "viem/chains";

import { getAccounts, accounts } from "../helpers/load_walletsClient";

import {
  createL2PublicClient,
  createL1PublicClient,
} from "../helpers/load_publicClient";

import {
  NetworkContracts,
  SCROLL_MAINNET_CONTRACT,
  MAINNET_CONTRACT,
  TokenDetails,
  Network,
} from "../constants/constants";

export const walletBalances_Token = async (
  network: Network,
  tokenDetails: TokenDetails
): Promise<void> => {
  const decimals = tokenDetails.decimals;
  const symbol = tokenDetails.symbol;

  getAccounts();

  const publicClient =
    network === "mainnet"
      ? createL1PublicClient(mainnet)
      : createL2PublicClient(scroll);

  console.log(
    colors.green(`Wallet balances for ${symbol} on ${network} start ...`)
  );

  for (let i = 0; i < accounts.length; i++) {
    try {
      const balance = await publicClient.readContract({
        address: getAddress(tokenDetails.address),
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [accounts[i].address],
      });

      if (decimals === 18) {
        console.log(
          i + 1,
          accounts[i].address + " => ",
          Number(formatEther(balance)),
          symbol
        );
      } else if (decimals === 6) {
        console.log(
          i + 1,
          accounts[i].address + " => ",
          Number(formatUnits(balance, 6)),
          symbol
        );
      } else {
        console.log(colors.red("wrong decimals =>"), decimals);
      }
    } catch (error) {
      console.log(colors.red(`getBalance error wallet ${i + 1} =>`), error);
    }
  }

  console.log(colors.green(`Wallet balances for ${symbol} on ${network} end!`));
};

async function cli(): Promise<void> {
  if (process.argv[2] === "--help") {
    console.log("NETWORK SYMBOL       get SYMBOL wallet balances on NETWORK");
    return;
  }
  const args = process.argv.slice(2);

  if (args.length != 2) {
    console.log(
      colors.red("Please provide two arguments as network and token symbol")
    );
  }
  const network = args[0];
  const symbol = args[1];
  let tokenList: NetworkContracts | undefined;
  let tokenDetails: TokenDetails | undefined;

  switch (network) {
    case "mainnet":
      tokenList = MAINNET_CONTRACT;
      break;
    case "scroll":
      tokenList = SCROLL_MAINNET_CONTRACT;
      break;
    default:
      console.log(colors.red("Invalid network must be 'mainnet' or 'scroll'"));
      throw new Error("Invalid network");
  }

  switch (symbol) {
    case "USDT":
      tokenDetails = tokenList.USDT;
      break;
    case "USDC":
      tokenDetails = tokenList.USDC;
      break;
    case "WETH":
      tokenDetails = tokenList.WETH;
      break;
    default:
      console.log(colors.red("Invalid token research"));
      throw new Error("Invalid token");
  }

  walletBalances_Token(network, tokenDetails);
}

cli().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
