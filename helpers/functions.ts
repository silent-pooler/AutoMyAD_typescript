import { HDAccount } from "viem";

export function shuffleWallets(array: HDAccount[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function randomizeAmount_2decimals(
  min_amount: number,
  max_amount: number
): string {
  return (Math.random() * (max_amount - min_amount) + min_amount).toFixed(2);
}

export function randomizeAmount_ETH(
  min_amount: number,
  max_amount: number
): string {
  return (Math.random() * (max_amount - min_amount) + min_amount).toFixed(18);
}

export function randomizeAmount_6decimals(
  min_amount: number,
  max_amount: number
): string {
  return (Math.random() * (max_amount - min_amount) + min_amount).toFixed(6);
}

// give min and max in s and return a number in millisecond
export function randomizeTime(min_time: number, max_time: number): number {
  return (Math.floor(Math.random() * (max_time - min_time)) + min_time) * 1000;
}

export function randomizeIndex(length: number): number {
  let index = Math.floor(Math.random() * length);
  return index;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function exponentialDelay(ms: number, attempt: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms * Math.pow(2, attempt))
  );
}
