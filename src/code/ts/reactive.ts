import { isObject } from "./validation";

// #region main
// 通过这些特定的标记，可以访问响应式对象的特殊属性
enum ReactiveFlags {
  IS_REACTIVE = "__is_reactive__",
  RAW = "__raw__",
}

interface Target {
  [ReactiveFlags.IS_REACTIVE]: boolean;
  [ReactiveFlags.RAW]: boolean;
}

export function isReactive(value: object): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

// 使用 WeakMap，避免影响垃圾回收
const proxyMap: WeakMap<object, any> = new WeakMap();

class ReactiveHandler implements ProxyHandler<Target> {
  // 标记属性记录在 handler 上，避免对原始对象产生影响
  protected readonly isReactive: boolean = true;

  get(target: Target, key: string | symbol, receiver: any) {
    if (key === ReactiveFlags.IS_REACTIVE) return this.isReactive;

    // 返回原始对象
    if (key === ReactiveFlags.RAW) return target;

    const res = Reflect.get(target, key, receiver);

    /* track(...) 收集依赖 */

    // 递归建立监听（有别于 Object.defineProperty，仅在访问到时执行）
    if (isObject(res) && !isReactive(res)) return reactive(res);

    return res;
  }
}

export function reactive<T extends object>(target: T): T {
  if (!isObject(target)) throw "target must be an object";

  // 不能使用 target instanceof Proxy 来判断 target 是否为 Proxy
  // 因此采用新增属性的方式
  if (isReactive(target)) return target;

  if (!proxyMap.has(target)) {
    const proxy = new Proxy(target as Target, new ReactiveHandler());
    proxyMap.set(target, proxy);
  }

  return proxyMap.get(target)!;
}

/**
 * 尝试获得响应式对象的原始对象，否则返回自身
 */
export function toRaw<T>(value: T): T {
  const raw = value && value[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : value;
}

/**
 * 尝试将 value 转变为 reactive，否则返回自身
 */
export function toReactive<T>(value: T): T {
  return isObject(value) ? reactive(value) : value;
}

const a = { author: { name: "abc", age: 18 } };
const b = reactive(a);

console.log(b === reactive(a)); // true
console.log(b === reactive(b)); // true
console.log(b.author === reactive(a.author)); // true
console.log(b[ReactiveFlags.RAW] === a); // true

// #endregion main
