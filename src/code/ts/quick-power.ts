//#region main
/**
 * number类型支持的最大安全整数仅有2^53-1，大约为9e15
 * 在幂运算中非常容易溢出，建议使用更安全的bigint
 */
export function quickPower(x: bigint, p: bigint): bigint {
  let res: bigint = 1n;
  while (p) {
    if (p & 1n) res *= x;
    x *= x;
    p >>= 1n;
  }
  return res;
}

//#endregion main
