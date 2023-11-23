import colors from "colors";

import { Address, formatUnits, parseUnits } from "viem";
import { WalletClientWithPublicActions } from "../../helpers/load_walletsClient";

export const syncswap_swap = async (
  wallet: WalletClientWithPublicActions,
  amount: string
) => {
  const address: Address | undefined = wallet.account?.address;
  const network: string | undefined = wallet.chain?.name;

  console.log(colors.green(`... Swap on SyncSwap L2 ${network} start ...`));

  let value = parseUnits(amount, 6);
};
