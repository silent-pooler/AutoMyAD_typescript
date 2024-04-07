import { log } from "console";
import {
  TRANSACTION_PARAMETERS,
  SCROLL_MAINNET_CONTRACT,
  SwapableNetworkContracts,
} from "../../constants/constants";
import { WalletClientWithPublicActions } from "../../helpers/load_walletsClient";
import {
  randomizeAmount_2decimals,
  randomizeIndex,
} from "../../helpers/functions";

const { min_amount_stable, max_amount_stable } = TRANSACTION_PARAMETERS;
const { USDT, USDC }: SwapableNetworkContracts = SCROLL_MAINNET_CONTRACT;

import { syncswap_swap_ETH_to_token } from "../syncswap/swap";

export const swapAlgo = async (wallet: WalletClientWithPublicActions) => {
  let amount: string;

  const action = randomizeIndex(2);
  log(action);

  switch (action) {
    case 0:
      amount = randomizeAmount_2decimals(min_amount_stable, max_amount_stable);
      log("amount", amount);
      await syncswap_swap_ETH_to_token(wallet, amount, USDC);

      break;
    case 1:
      amount = randomizeAmount_2decimals(min_amount_stable, max_amount_stable);
      log("amount", amount);
      await syncswap_swap_ETH_to_token(wallet, amount, USDT);

      break;
  }
};
