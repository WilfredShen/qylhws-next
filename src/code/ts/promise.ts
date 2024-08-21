import { runMicroTask } from "./micro-task";

// #region types
type Resolve<T> = (data: T) => void;
type Reject = (reason: any) => void;
type Fulfilled<T = unknown, R = unknown> = (data: T) => R | MyPromiseLike<R>;
type Rejected<E = never> = (reason: any) => E | MyPromiseLike<E>;
type PromiseState = "pending" | "fulfilled" | "rejected";

interface MyPromiseLike<T> {
  then: (
    resolve: Resolve<T> | null | undefined,
    reject: Reject | null | undefined,
  ) => void;
}

// #endregion types

// #region is-promise-like
export function isPromiseLike(o: any): o is MyPromiseLike<unknown> {
  return o && typeof o.then === "function";
}

// #endregion is-promise-like

// #region main
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

/**
 * Promise构造时会直接运行executor，并尝试捕获错误。<br/>
 * 注意：如果executor内存在异步代码，由于异步代码执行时，
 * 同步的try...catch代码已经结束，异步代码的错误将无法被捕获。<br/>
 * 这也是Promise无法捕获异步错误的原因。
 */
export class MyPromise<T = unknown> {
  #state: PromiseState = "pending";
  #result: T | null | undefined = undefined;
  // 同一个promise的then方法可能会多次调用，需要以数组形式存储
  #handlers: {
    resolve: Resolve<any>;
    reject: Reject;
    onFulfilled?: Fulfilled<any, any> | null | undefined;
    onRejected?: Rejected<any> | null | undefined;
  }[] = [];

  /**
   * 构造时直接运行executor，并尝试捕获错误
   * @param executor
   */
  constructor(executor: (resolve: Resolve<T>, reject: Reject) => void) {
    const resolve = (data: T) => this.#changeState(FULFILLED, data);
    const reject = (reason: any) => this.#changeState(REJECTED, reason);
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * then方法返回一个Promise
   * @param onFulfilled
   * @param onRejected
   */
  then<R = T, E = never>(
    onFulfilled?: Fulfilled<T, R> | null | undefined,
    onRejected?: Rejected<E> | null | undefined,
  ) {
    return new MyPromise<R>((resolve, reject) => {
      this.#handlers.push({
        resolve,
        reject,
        onFulfilled,
        onRejected,
      });
      this.#run();
    });
  }

  /**
   * catch是then方法的别名，不提供onFulfilled
   * @param onRejected
   */
  catch<E = never>(onRejected?: Rejected<E>) {
    return this.then<T | E, E>(null, onRejected);
  }

  /**
   * 改变Promise的状态
   * @param state 目标状态
   * @param payload value或reason
   * @private
   */
  #changeState(state: Exclude<PromiseState, "pending">, payload: any) {
    if (this.#state !== PENDING) return;
    this.#state = state;
    this.#result = payload;
    this.#run();
  }

  /**
   * 尝试运行then方法提供的回调
   * @private
   */
  #run() {
    if (this.#state === PENDING) return;
    while (this.#handlers.length) {
      const { resolve, reject, onFulfilled, onRejected } =
        this.#handlers.shift()!;
      const callback = this.#state === FULFILLED ? onFulfilled : onRejected;
      runMicroTask(() => {
        if (typeof callback === "function") {
          try {
            const data = callback(this.#result);
            // 如果返回的是promise，则由其决定接下来的行为
            if (isPromiseLike(data)) {
              data.then(resolve, reject);
            } else {
              resolve(data);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          //! 没有提供回调，直接穿透
          if (this.#state === FULFILLED) {
            resolve(this.#result);
          } else {
            reject(this.#result);
          }
        }
      });
    }
  }
}

// #endregion main
