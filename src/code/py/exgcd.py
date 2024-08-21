#region main
def exgcd(a: int, b: int) -> int:
    if b == 0:
        return a, 1, 0
    gcd, x, y = exgcd(b, a % b)
    return gcd, y, x - a // b * y
#endregion main
