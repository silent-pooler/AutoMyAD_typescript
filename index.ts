import * as envEnc from "@chainlink/env-enc";
import colors from "colors";
import { log } from "console";
import * as dotenv from "dotenv";
envEnc.config();
dotenv.config();

import { TRANSACTION_PARAMETERS } from "./constants/constants";
import { delay, randomizeIndex, randomizeTime } from "./helpers/functions";

import {
  L2Wallets,
  accounts,
  getShuffledWallets,
} from "./helpers/load_walletsClient";

import { swapAlgo } from "./modules/algo/swapAlgo";

const { min_delay, max_delay } = TRANSACTION_PARAMETERS;

const main = async () => {
  // Acquire wallets
  getShuffledWallets();

  for (let i = 0; i < accounts.length; i++) {
    const [walletAddress] = await L2Wallets[i].getAddresses();

    log("\n");
    log(colors.green(`${i + 1} - ${walletAddress}`));
    log("\n");

    const action = randomizeIndex(1);

    switch (action) {
      case 0:
        await swapAlgo(L2Wallets[i]);
        break;
      /*
      case 1:
        // do something, wrap / unwrap ETH for example
        break;
      case 2:
        // do something, add / remove liquidity for example
        break;
      */
    }

    const POLL_INTERVAL = randomizeTime(min_delay, max_delay);
    log("Poll interval =>", Math.floor(POLL_INTERVAL / (1000 * 60)), "mn");
    log("\n");

    await delay(POLL_INTERVAL);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
