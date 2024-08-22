import { toRaw, toReactive } from "./reactive";

// #region main
enum RefFlags {
  IS_REF = "__is_ref__",
}

interface Ref<T = any> {
  value: T;
}

function isRef<T>(value: Ref<T> | unknown): value is Ref<T> {
  return !!(value && (value as any)[RefFlags.IS_REF]);
}

class RefImpl<T> implements Ref<T> {
  [RefFlags.IS_REF]: boolean = true;
  #raw: T;
  #value: T;

  constructor(value: T) {
    this.#raw = toRaw(value);
    this.#value = toReactive(value);
  }

  get value(): T {
    /* track(...) 收集依赖 */
    return this.#value;
  }

  set value(newVal: T) {
    const raw = toRaw(newVal);
    // 原始类型的值或对象的地址改变，需要更新
    if (!Object.is(this.#raw, raw)) {
      this.#raw = raw;
      this.#value = toReactive(raw);
      /* trigger(...) 派发更新 */
    }
  }
}

export function ref<T = any>(): Ref<T | undefined>;
export function ref<T>(target: T | Ref<T>): Ref<T>;
export function ref(value?: unknown) {
  return isRef(value) ? value : new RefImpl(value);
}

// #endregion main
