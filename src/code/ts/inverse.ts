import { exgcd } from "./exgcd";
import { quickMod } from "./quick-mod";

//#region linear
export function inverseLinear(p: number): number[] {
  const inv: number[] = new Array<number>(p).fill(0);
  inv[1] = 1;
  for (let i = 2; i <= p - 1; i++)
    inv[i] = ((p - Math.floor(p / i)) * inv[p % i]) % p;
  return inv;
}

const invCache: Map<number, number[]> = new Map();

export function inverseLazy(a: number, p: number): number {
  if (!invCache.has(p)) invCache.set(p, [0, 1]); // 初始化
  const array = invCache.get(p);
  if (array[a] === void 0)
    array[a] = ((p - Math.floor(p / a)) * inverseLazy(p % a, p)) % p;
  return array[a];
}

//#endregion linear

//#region fermat
export function modInverseFermat(a: bigint, p: bigint): bigint {
  return quickMod(a, p - 2n, p);
}

//#endregion fermat

//#region exgcd
export function modInverseExgcd(a: number, p: number): number {
  const [gcd, x, y] = exgcd(a, p);
  if (gcd !== 1) return -1; // a和p不互质，无法求出逆元
  return (x + p) % p; // x可能为负数，需要加上p确保为正数
}

//#endregion exgcd
