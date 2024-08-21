//#region main
/**
 * number类型支持的最大安全整数仅有2^53-1，大约为9e15
 * 在幂运算中非常容易溢出，建议使用更安全的bigint
 */
export function quickMod(x: bigint, p: bigint, mod: bigint): bigint {
  let res: bigint = 1n;
  while (p) {
    if (p & 1n) res = (res * x) % mod;
    x = (x * x) % mod;
    p >>= 1n;
  }
  return res;
}

//#endregion main
