//#region main
export function eulerPhi(n: bigint) {
  let res: bigint = n;
  for (let i = 2n; i * i <= n; i++) {
    if (n % i === 0n) {
      res = (res / i) * (i - 1n);
      while (n % i === 0n) n /= i;
    }
  }
  if (n > 1n) res = (res / n) * (n - 1n);
  return res;
}

//#endregion main
