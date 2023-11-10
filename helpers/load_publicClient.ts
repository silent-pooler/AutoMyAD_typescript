import { Chain, PublicClient, createPublicClient, http } from "viem";

export const createL1PublicClient = (
  chain: Chain | undefined
): PublicClient => {
  return createPublicClient({
    chain: chain,
    transport: http(),
  });
};

export const createL2PublicClient = (
  chain: Chain | undefined
): PublicClient => {
  return createPublicClient({
    chain: chain,
    transport: http(),
  });
};
