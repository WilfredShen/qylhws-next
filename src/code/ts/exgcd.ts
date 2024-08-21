//#region main
export function exgcd(a: number, b: number): [number, number, number] {
  if (!b) return [a, 1, 0];
  const [gcd, x, y] = exgcd(b, a % b);
  return [gcd, y, x - Math.floor(a / b) * y];
}

//#endregion main
