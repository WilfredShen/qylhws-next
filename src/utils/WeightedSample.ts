export default class WeightedSample<T> {
  #source: T[];
  #weights: number[];
  #consumed: number[]; // source 的下标
  #unsampled: number[]; // source 的下标

  constructor(values: T[], weights: number[]) {
    this.#source = values;
    this.#weights = weights;
    this.#consumed = [];
    this.#unsampled = [];
    this.#init();
  }

  /**
   * 元素总数
   */
  get size() {
    return this.#source.length;
  }

  /**
   * 剩余可采样的元素数
   */
  get validSize() {
    return this.#unsampled.length;
  }

  #init(preconsumed?: number[]) {
    /** 使用 A-Res 算法生成加权随机序列 */
    const p = this.#weights.map((w, i) => [i, Math.random() ** (1 / w)]);
    const consumed = new Set(preconsumed);
    /** 去除已经预先消耗掉的元素 */
    const valid = preconsumed ? p.filter(([i]) => !consumed.has(i)) : p;
    this.#unsampled = valid.sort((a, b) => b[1] - a[1]).map(e => e[0]);
  }

  /**
   *
   */
  reset() {
    this.#init();
  }

  /**
   * 不放回采样，多次调用时，会维持上一次采样的状态，即同样不会和之前的采样结果重复，除非调用 reset 重置
   *
   * @param n 采样数，只接受正整数，大于 size 时，会减少到 size
   * @param stopIfExceed 无元素可采样时终止，最终采样数可能不等于 n，若设置为 false，则会在可采样元素不够时自动重置状态
   * @returns
   */
  sample(n: number = 1, stopIfExceed = true): T[] {
    if (!Number.isInteger(n) || n <= 0)
      throw new Error("sample count must be positive integer");

    if (!stopIfExceed && this.validSize === 0) this.#init();

    n = Math.min(n, stopIfExceed ? this.validSize : this.size);
    if (n === 0) return [];

    const sampled = this.#unsampled.splice(0, n);
    if (sampled.length < n) {
      this.#init(sampled);
      this.#consumed = this.#unsampled.splice(0, n - sampled.length);
    } else {
      this.#consumed.push(...sampled);
    }

    return sampled.map(i => this.#source[i]);
  }
}
