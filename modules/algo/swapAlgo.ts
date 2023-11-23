import { TRANSACTION_PARAMETERS } from "../../constants/constants";
import { WalletClientWithPublicActions } from "../../helpers/load_walletsClient";
import {
  randomizeAmount_2decimals,
  randomizeAmount_6decimals,
} from "../../helpers/functions";

const { min_amount, max_amount } = TRANSACTION_PARAMETERS;

import { syncswap_swap } from "../syncswap/swap";

export const swapAlgo = async (wallet: WalletClientWithPublicActions) => {
  const amount: string = randomizeAmount_2decimals(min_amount, max_amount);

  console.log("amount", amount);

  await syncswap_swap(wallet, amount);
};
