import * as envEnc from "@chainlink/env-enc";
envEnc.config();
import * as dotenv from "dotenv";
dotenv.config();

import { TRANSACTION_PARAMETERS } from "./constants/constants";
import { randomizeTime, randomizeIndex } from "./helpers/functions";

import {
  accounts,
  L2Wallets,
  getShuffledWallets,
} from "./helpers/load_walletsClient";

import { swapAlgo } from "./modules/algo/swapAlgo";

///

import { walletBalance_L2_token } from "./modules/tokens_Balances_L2";

///

// export const L1PublicClient = createL1PublicClient(mainnet);
// export const L2PublicClient = createL2PublicClient(scroll);

const { min_delay, max_delay } = TRANSACTION_PARAMETERS;

const main = async () => {
  // Acquire wallets
  getShuffledWallets();

  for (let i = 0; i < accounts.length; i++) {
    const action = randomizeIndex(1);

    switch (action) {
      case 0:
        await swapAlgo(L2Wallets[i]);
        break;
      // case 1:
      //   // do something
      //   break;
      // case 2:
      //   await swapAlgo(L2Wallets[i]);
      //   break;
    }

    const POLL_INTERVAL = randomizeTime(min_delay, max_delay);
    console.log(
      "Poll interval =>",
      Math.floor(POLL_INTERVAL / (1000 * 60)),
      "mn"
    );
    await new Promise((resolve, _) => setTimeout(resolve, POLL_INTERVAL));
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
