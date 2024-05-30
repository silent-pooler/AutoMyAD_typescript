import { log } from "console";
import colors from "colors";
import { SyncSwapClassicPoolFactoryABI } from "../../ABI/SyncSwapClassicPoolFactoryABI.";
import { SyncSwapPoolABI } from "../../ABI/SyncSwapPoolABI";
import { SyncSwapRouterABI } from "../../ABI/SyncSwapRouterABI";
import {
  ContractDetails,
  ZERO_ADDRESS,
  SCROLL_MAINNET_CONTRACT,
} from "../../constants/constants";

import {
  Address,
  formatEther,
  formatUnits,
  parseUnits,
  encodeAbiParameters,
  parseAbiParameters,
  BaseError,
  ContractFunctionRevertedError,
  //decodeEventLog,
  decodeAbiParameters,
  //parseAbiItem,
} from "viem";
import { WalletClientWithPublicActions } from "../../helpers/load_walletsClient";
import { fetch_ETH_balance_L2 } from "../eth_Balances_L2";

const { SYNCSWAP_CLASSIC_POOL_FACTORY, SYNCSWAP_ROUTER, WETH } =
  SCROLL_MAINNET_CONTRACT;

export const syncswap_swap_ETH_to_token = async (
  walletClient: WalletClientWithPublicActions,
  amount: string,
  token: ContractDetails
) => {
  const [walletAddress]: Address[] = await walletClient.getAddresses();
  const network: string | undefined = walletClient.chain?.name;
  const { symbol, decimals } = token;

  log(colors.green(`... Swap on SyncSwap L2 ${network} start ...`));
  log("\n");
  log(colors.green(`${walletAddress} buy ${colors.yellow(symbol)}`));
  log("\n");

  const value: bigint = parseUnits(amount, decimals);

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

  const ETHAmountIn: bigint = await walletClient.readContract({
    address: poolAddress,
    abi: SyncSwapPoolABI,
    functionName: "getAmountOut",
    args: [token.address, value, WETH.address],
  });

  const amountOutQuery: bigint = await walletClient.readContract({
    address: poolAddress,
    abi: SyncSwapPoolABI,
    functionName: "getAmountOut",
    args: [WETH.address, ETHAmountIn, token.address],
  });

  const minAmountOut: bigint = (amountOutQuery * BigInt(99)) / BigInt(100);

  const withdrawMode: number = 1;
  const swapData: `0x${string}` = encodeAbiParameters(
    parseAbiParameters("address, address, uint8"),
    [WETH.address, walletAddress, withdrawMode]
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
      tokenIn: ZERO_ADDRESS,
      amountIn: ETHAmountIn,
    },
  ];

  try {
    /* if you want to play with event PART 1

    const block = await walletClient.getBlockNumber();

    */

    const { request } = await walletClient.simulateContract({
      address: SYNCSWAP_ROUTER.address,
      abi: SyncSwapRouterABI,
      functionName: "swap",
      args: [
        paths,
        minAmountOut,
        BigInt(Math.floor(Date.now() / 1000)) + BigInt(60),
      ],
      value: ETHAmountIn,
    });

    const hash = await walletClient.writeContract(request);

    const receipt = await walletClient.waitForTransactionReceipt({
      confirmations: 6,
      hash: hash,
      onReplaced: (replacement) => log("replacement =>", replacement),
    });

    const [amount0In, amount1In, amount0Out, amount1Out] = decodeAbiParameters(
      parseAbiParameters(
        "uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out"
      ),
      receipt.logs[0].data
    );

    let amountETHSpent: string;
    let amountTokenReceived: string;

    if (formatEther(amount0In) === "0") {
      amountETHSpent = formatEther(amount1In);
      amountTokenReceived = formatUnits(amount0Out, decimals);
    } else {
      amountETHSpent = formatEther(amount0In);
      amountTokenReceived = formatUnits(amount1Out, decimals);
    }

    log("\n");
    log("amountETHSpent =>", colors.yellow(amountETHSpent));
    log("amountTokenReceived =>", colors.yellow(amountTokenReceived));
    log("\n");

    const WETH_balance_after = await fetch_ETH_balance_L2(walletAddress);

    WETH_balance_after !== null
      ? log("WETH_balance_after =>", colors.yellow(`${WETH_balance_after}`))
      : log(colors.red("Failed to fetch WETH_balance_after after 5 attempts"));

    log("\n");

    /* if you want to play with event PART 2

    const eventLogs = await walletClient.getLogs({
      address: poolAddress,
      event: parseAbiItem(
        "event Swap(address indexed sender, uint256, uint256, uint256, uint256, address indexed to)"
      ),
      args: {
        sender: SYNCSWAP_ROUTER.address,
        to: walletAddress,
      },
      fromBlock: block,
    });

    const topics = decodeEventLog({
      abi: SyncSwapPoolABI,
      data: eventLogs[0].data,
      topics: eventLogs[0].topics,
    });

    */
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
