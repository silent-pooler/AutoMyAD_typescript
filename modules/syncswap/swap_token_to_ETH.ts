import colors from "colors";
import { log } from "console";
import { ERC20ABI } from "../../ABI/ERC20ABI";
import { SyncSwapClassicPoolFactoryABI } from "../../ABI/SyncSwapClassicPoolFactoryABI.";
import { SyncSwapPoolABI } from "../../ABI/SyncSwapPoolABI";
import { SyncSwapRouterABI } from "../../ABI/SyncSwapRouterABI";
import {
  ContractDetails,
  SCROLL_MAINNET_CONTRACT,
  ZERO_ADDRESS,
} from "../../constants/constants";

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
import { WalletClientWithPublicActions } from "../../helpers/load_walletsClient";
import { fetch_ETH_balance_L2 } from "../eth_Balances_L2";

const { SYNCSWAP_CLASSIC_POOL_FACTORY, SYNCSWAP_ROUTER, WETH } =
  SCROLL_MAINNET_CONTRACT;

export const syncswap_swap_token_to_ETH = async (
  walletClient: WalletClientWithPublicActions,
  amount: string,
  token: ContractDetails
) => {
  const [walletAddress]: Address[] = await walletClient.getAddresses();
  const network: string | undefined = walletClient.chain?.name;
  const { symbol, decimals } = token;

  log(colors.green(`... Swap on SyncSwap L2 ${network} start ...`));
  log("\n");
  log(colors.green(`${walletAddress} sell ${colors.yellow(symbol)}`));
  log("\n");

  const tokenAmountIn: bigint = parseUnits(amount, decimals);

  const WETH_balance_before = await fetch_ETH_balance_L2(walletAddress);

  WETH_balance_before !== null
    ? log("WETH_balance_before =>", colors.yellow(`${WETH_balance_before}`))
    : log(colors.red("Failed to fetch WETH_balance_before after 5 attempts"));

  const poolAddress: Address = await walletClient.readContract({
    address: SYNCSWAP_CLASSIC_POOL_FACTORY.address,
    abi: SyncSwapClassicPoolFactoryABI,
    functionName: "getPool",
    args: [token.address, WETH.address],
  });

  if (poolAddress === ZERO_ADDRESS) {
    throw Error("Pool not exists");
  }

  const amountOutQuery: bigint = await walletClient.readContract({
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

  try {
    {
      const { request } = await walletClient.simulateContract({
        address: token.address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [SYNCSWAP_ROUTER.address, tokenAmountIn],
      });

      const hash = await walletClient.writeContract(request);

      await walletClient.waitForTransactionReceipt({
        hash: hash,
        onReplaced: (replacement) => log("replacement =>", replacement),
      });
    }

    const { request } = await walletClient.simulateContract({
      address: SYNCSWAP_ROUTER.address,
      abi: SyncSwapRouterABI,
      functionName: "swap",
      args: [
        paths,
        minAmountOut,
        BigInt(Math.floor(Date.now() / 1000)) + BigInt(60),
      ],
    });

    const hash = await walletClient.writeContract(request);

    const receipt = await walletClient.waitForTransactionReceipt({
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

    const [amount0In, amount1In, amount0Out, amount1Out] = decodeAbiParameters(
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

    log("\n");
    log("amountTokenSpent =>", colors.yellow(amountTokenSpent));
    log("amountETHReceived =>", colors.yellow(amountETHReceived));
    log("\n");

    const WETH_balance_after = await fetch_ETH_balance_L2(walletAddress);

    WETH_balance_after !== null
      ? log("WETH_balance_after =>", colors.yellow(`${WETH_balance_after}`))
      : log(colors.red("Failed to fetch WETH_balance_after after 5 attempts"));

    log("\n");
  } catch (error) {
    log(colors.red(`An error happen => ${error}`));
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
};
