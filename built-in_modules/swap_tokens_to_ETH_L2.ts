import colors from "colors";
import { log } from "console";
import {
  Address,
  BaseError,
  ContractFunctionRevertedError,
  decodeAbiParameters,
  encodeAbiParameters,
  formatEther,
  formatUnits,
  parseAbiParameters,
  parseUnits,
} from "viem";
import { ERC20ABI } from "../ABI/ERC20ABI";
import { SyncSwapClassicPoolFactoryABI } from "../ABI/SyncSwapClassicPoolFactoryABI";
import { SyncSwapPoolABI } from "../ABI/SyncSwapPoolABI";
import { SyncSwapRouterABI } from "../ABI/SyncSwapRouterABI";
import {
  ContractDetails,
  Network,
  SCROLL_MAINNET_CONTRACT,
  SwapableNetworkContracts,
  TRANSACTION_PARAMETERS,
  ZERO_ADDRESS,
} from "../constants/constants";
import { delay, randomizeTime } from "../helpers/functions";
import {
  L2Wallets,
  accounts,
  getShuffledWallets,
} from "../helpers/load_walletsClient";
import { fetch_ETH_balance_L2 } from "../modules/eth_Balances_L2";
import { fetch_token_balance_L2 } from "../modules/tokens_Balances_L2";

const network: Network = "scroll";
const { SYNCSWAP_CLASSIC_POOL_FACTORY, SYNCSWAP_ROUTER, WETH } =
  SCROLL_MAINNET_CONTRACT;
const { min_delay, max_delay } = TRANSACTION_PARAMETERS;

export const syncswap_swap_token_to_ETH = async (token: ContractDetails) => {
  getShuffledWallets();

  for (let i = 0; i < accounts.length; i++) {
    const [walletAddress]: Address[] = await L2Wallets[i].getAddresses();
    const { symbol, decimals } = token;

    const amount = await fetch_token_balance_L2(walletAddress, token);

    log(colors.green(`${i + 1} - ${walletAddress}`));
    log("\n");

    if (amount === null || amount === "0") {
      log(colors.yellow(`${walletAddress} ${symbol} balance is 0`));
      log("\n");
      continue;
    }

    log(colors.green(`... Swap on SyncSwap L2 ${network} start ...`));
    log("\n");
    log(colors.yellow(`${walletAddress} sell ${amount} ${symbol}`));
    log("\n");

    const tokenAmountIn: bigint = parseUnits(amount, decimals);
    const WETH_balance_before = await fetch_ETH_balance_L2(walletAddress);

    const poolAddress: Address = await L2Wallets[i].readContract({
      address: SYNCSWAP_CLASSIC_POOL_FACTORY.address,
      abi: SyncSwapClassicPoolFactoryABI,
      functionName: "getPool",
      args: [token.address, WETH.address],
    });

    if (poolAddress === ZERO_ADDRESS) {
      throw Error("Pool not exists");
    }

    const amountOutQuery: bigint = await L2Wallets[i].readContract({
      address: poolAddress,
      abi: SyncSwapPoolABI,
      functionName: "getAmountOut",
      args: [token.address, tokenAmountIn, WETH.address],
    });

    const minAmountOut: bigint = (amountOutQuery * BigInt(99)) / BigInt(100);

    const withdrawMode: number = 1;
    const swapData: `0x${string}` = encodeAbiParameters(
      parseAbiParameters("address, address, uint8"),
      [token.address, walletAddress, withdrawMode]
      // tokenIn, to, withdraw mode
    );

    const steps = [
      {
        pool: poolAddress,
        data: swapData,
        callback: ZERO_ADDRESS, // we don't have a callback
        callbackData: "0x" as `0x${string}`,
      },
    ];

    const paths = [
      {
        steps: steps,
        tokenIn: token.address,
        amountIn: tokenAmountIn,
      },
    ];

    let isApproved = false;
    try {
      log(colors.yellow("Approving ..."));
      log("\n");
      const { request } = await L2Wallets[i].simulateContract({
        address: token.address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [SYNCSWAP_ROUTER.address, tokenAmountIn],
      });

      const hash = await L2Wallets[i].writeContract(request);

      await L2Wallets[i].waitForTransactionReceipt({
        hash: hash,
        onReplaced: (replacement) => log("replacement =>", replacement),
      });

      isApproved = true;
    } catch (error) {
      log(colors.red(`An error happened in approve function`));
      if (error instanceof BaseError) {
        const revertError = error.walk(
          (error) => error instanceof ContractFunctionRevertedError
        );
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? "";
          log(colors.red(`errorName => ${errorName}`));
        }
      }
    }

    if (isApproved) {
      try {
        log(colors.yellow("Swapping ..."));
        log("\n");
        const { request } = await L2Wallets[i].simulateContract({
          address: SYNCSWAP_ROUTER.address,
          abi: SyncSwapRouterABI,
          functionName: "swap",
          args: [
            paths,
            minAmountOut,
            BigInt(Math.floor(Date.now() / 1000)) + BigInt(60),
          ],
        });

        const hash = await L2Wallets[i].writeContract(request);

        const receipt = await L2Wallets[i].waitForTransactionReceipt({
          confirmations: 6,
          hash: hash,
          onReplaced: (replacement) => log("replacement =>", replacement),
        });

        const receiptToCheck =
          symbol === "USDT"
            ? receipt.logs[2].data
            : symbol === "USDC"
            ? receipt.logs[1].data
            : undefined;

        if (receiptToCheck === undefined) {
          log(colors.red(`receiptToCheck => ${receiptToCheck}`));
          throw Error("receiptToCheck is undefined");
        }

        const [amount0In, amount1In, amount0Out, amount1Out] =
          decodeAbiParameters(
            parseAbiParameters(
              "uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out"
            ),
            receiptToCheck
          );

        let amountTokenSpent: string;
        let amountETHReceived: string;

        if (formatUnits(amount0In, decimals) === "0") {
          amountTokenSpent = formatUnits(amount1In, decimals);
          amountETHReceived = formatEther(amount0Out);
        } else {
          amountTokenSpent = formatUnits(amount0In, decimals);
          amountETHReceived = formatEther(amount1Out);
        }

        WETH_balance_before !== null
          ? log("ETH before =>", colors.yellow(`${WETH_balance_before}`))
          : log(
              colors.red("Failed to fetch WETH_balance_before after 5 attempts")
            );
        log("\n");

        log("Amount token spent =>", colors.yellow(amountTokenSpent));
        log("\n");
        log("Amount ETH received =>", colors.yellow(amountETHReceived));
        log("\n");

        const WETH_balance_after = await fetch_ETH_balance_L2(walletAddress);

        WETH_balance_after !== null
          ? log("ETH after =>", colors.yellow(`${WETH_balance_after}`))
          : log(
              colors.red("Failed to fetch WETH_balance_after after 5 attempts")
            );
        log("\n");
      } catch (error) {
        log(colors.red(`An error happened in swap function`));
        log("\n");
        if (error instanceof BaseError) {
          const revertError = error.walk(
            (error) => error instanceof ContractFunctionRevertedError
          );
          if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName ?? "";
            log(colors.red(`errorName => ${errorName}`));
            log("\n");
          }
        }
      }
    }
    const POLL_INTERVAL = randomizeTime(min_delay, max_delay);
    log("Poll interval =>", Math.floor(POLL_INTERVAL / (1000 * 60)), "mn");
    log("\n");

    await delay(POLL_INTERVAL);
  }
};

const cli = async (): Promise<void> => {
  if (process.argv[2] === "--help") {
    log(
      "SYMBOL       swap SYMBOL balance on scroll network on every wallets in a random way"
    );
    return;
  }
  const args = process.argv.slice(2);

  if (args.length != 1) {
    log(colors.red("Please provide one argument as token symbol"));
  }
  const symbol = args[0];

  const tokenList = SCROLL_MAINNET_CONTRACT as SwapableNetworkContracts;
  let ContractDetails: ContractDetails;
  switch (symbol) {
    case "USDT":
      ContractDetails = tokenList.USDT;
      break;
    case "USDC":
      ContractDetails = tokenList.USDC;
      break;
    default:
      log(colors.red("Invalid token research"));
      throw new Error("Invalid token");
  }

  await syncswap_swap_token_to_ETH(ContractDetails);
};

cli()
  .then(() => {
    console.log("exit(0)");
    process.exit(0);
  })
  .catch((error) => {
    console.log("exit(1)");
    console.error(error);
    process.exit(1);
  });
