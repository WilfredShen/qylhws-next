#region main
def quick_mod(x: int, p: int, mod: int) -> int:
    res: int = 1
    while p:
        if p & 1:
            res = (res * x) % mod
        x = (x * x) % mod
        p >>= 1
    return res
#endregion main