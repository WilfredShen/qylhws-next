#region main
def quick_power(x: int, p: int) -> int:
    res: int = 1
    while p:
        if p & 1:
            res *= x
        x *= x
        p >>= 1
    return res
#endregion main