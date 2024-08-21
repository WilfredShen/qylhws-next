import math

#region main
def euler_phi(n: int) -> int:
    res = n
    for i in range(2, math.floor(math.sqrt(n)) + 1):
        if n % i == 0:
            res = (res // i) * (i - 1)
            while n % i == 0:
                n //= i
    if res > 1:
        res = (res // n) * (n - 1)
    return res
#endregion main