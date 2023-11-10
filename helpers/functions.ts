export function shuffleWallets(array: []) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function randomizeAmount(
  min_amount: number,
  max_amount: number
): string {
  return (Math.random() * (max_amount - min_amount) + min_amount).toFixed(4);
}

export function randomizeAmountETH(
  min_amount: number,
  max_amount: number
): string {
  return (Math.random() * (max_amount - min_amount) + min_amount).toFixed(18);
}

export function randomizeAmountUSDC(
  min_amount: number,
  max_amount: number
): string {
  return (Math.random() * (max_amount - min_amount) + min_amount).toFixed(6);
}

// return a number in millisecond
export function randomizeTime(min_time: number, max_time: number): number {
  return (Math.floor(Math.random() * (max_time - min_time)) + min_time) * 1000;
}

export function randomizeIndex(length: number): number {
  let index = Math.floor(Math.random() * length);
  return index;
}
