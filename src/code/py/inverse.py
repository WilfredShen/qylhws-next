from exgcd import exgcd
from functools import lru_cache
from typing import List
from quick_mod import quick_mod


# region linear
def inverse_liner(p: int) -> List[int]:
    inv: List[int] = []
    inv[1] = 1
    for i in range(2, p):
        inv[i] = (p - p // i) * inv[p % i] % p
    return inv


@lru_cache(maxsize=None)
def inverse_lazy(a: int, p: int) -> int:
    if a == 1:
        return 1
    return (p - p // a) * inverse_lazy(p % a, p) % p
# endregion linear


#region fermat
def mod_inverse_fermat(a: int, p: int) -> int:
    return quick_mod(a, p - 2, p)
#endregion fermat


#region exgcd
def mod_inverse_exgcd(a: int, p: int) -> int:
    gcd, x, y = exgcd(a, p)
    if gcd != 1:
        return -1 # a和p不互质，无法求出逆元
    return (x + p) % p # x可能为负数，需要加上p确保为正数
#endregion exgcd