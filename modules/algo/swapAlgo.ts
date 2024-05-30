import { log } from "console";
import { Address } from "viem";
import {
  SCROLL_MAINNET_CONTRACT,
  SwapableNetworkContracts,
  TRANSACTION_PARAMETERS,
} from "../../constants/constants";
import { WalletClientWithPublicActions } from "../../helpers/load_walletsClient";
import { fetch_token_balance_L2 } from "../tokens_Balances_L2";

const { min_amount_stable, max_amount_stable } = TRANSACTION_PARAMETERS;

const { USDT, USDC }: SwapableNetworkContracts =
  SCROLL_MAINNET_CONTRACT as SwapableNetworkContracts;

import {
  randomizeAmount_2decimals,
  randomizeIndex,
} from "../../helpers/functions";
import { syncswap_swap_ETH_to_token } from "../syncswap/swap_ETH_to_token";
import { syncswap_swap_token_to_ETH } from "../syncswap/swap_token_to_ETH";

syncswap_swap_token_to_ETH;

export const swapAlgo = async (wallet: WalletClientWithPublicActions) => {
  const [walletAddress]: Address[] = await wallet.getAddresses();
  let amountETH;
  let tokenBalance;
  const action = randomizeIndex(4);
  // function randomTwoOrThree() {
  //   return Math.floor(Math.random() * 2) + 2;
  // }
  // const action = randomTwoOrThree();

  switch (action) {
    // Buy USDC
    case 0:
      tokenBalance = await fetch_token_balance_L2(walletAddress, USDC);
      log("amountToken =>", tokenBalance);

      if (tokenBalance === null) {
        break;
      } else if (tokenBalance >= "12") {
        log("token balance > 12");
        await syncswap_swap_token_to_ETH(wallet, tokenBalance, USDC);
        break;
      }

      amountETH = randomizeAmount_2decimals(
        min_amount_stable,
        max_amount_stable
      );
      await syncswap_swap_ETH_to_token(wallet, amountETH, USDC);
      break;

    // Buy USDT
    case 1:
      tokenBalance = await fetch_token_balance_L2(walletAddress, USDT);
      log("amountToken =>", tokenBalance);

      if (tokenBalance === null) {
        break;
      } else if (tokenBalance >= "12") {
        log("token balance > 12");
        await syncswap_swap_token_to_ETH(wallet, tokenBalance, USDT);
        break;
      }

      amountETH = randomizeAmount_2decimals(
        min_amount_stable,
        max_amount_stable
      );
      await syncswap_swap_ETH_to_token(wallet, amountETH, USDT);
      break;

    // SELL USDC
    case 2:
      tokenBalance = await fetch_token_balance_L2(walletAddress, USDC);

      if (tokenBalance === null) {
        break;
      } else if (tokenBalance === "0") {
        log("Nothing to sell, we buy!");
        log("\n");

        amountETH = randomizeAmount_2decimals(
          min_amount_stable,
          max_amount_stable
        );
        await syncswap_swap_ETH_to_token(wallet, amountETH, USDC);
        break;
      }

      await syncswap_swap_token_to_ETH(wallet, tokenBalance, USDC);
      break;

    //SELL USDT

    case 3:
      tokenBalance = await fetch_token_balance_L2(walletAddress, USDT);

      if (tokenBalance === null) {
        break;
      } else if (tokenBalance === "0") {
        log("Nothing to sell, we buy!");
        log("\n");

        amountETH = randomizeAmount_2decimals(
          min_amount_stable,
          max_amount_stable
        );
        await syncswap_swap_ETH_to_token(wallet, amountETH, USDT);
        break;
      }
      await syncswap_swap_token_to_ETH(wallet, tokenBalance, USDT);
      break;
  }
};
