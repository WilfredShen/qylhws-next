// #region main
function newInst<T extends any[], R>(fn: (...args: T) => R, ...args: T)
  : R extends void ? any : R {
  const obj = Object.create(fn.prototype);
  const r: R = fn.apply(obj, args);
  return r ?? obj; // 优先返回构造函数的返回值
}

// #endregion main
