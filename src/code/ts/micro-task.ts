// #region main
export function runMicroTask(fn: () => void) {
  if (typeof process === "object" && typeof process.nextTick === "function") {
    // Node环境下直接使用process.nextTick
    process.nextTick(fn);
  } else if (typeof Promise === "function") {
    // 如果有Promise，使用Promise添加到微队列
    Promise.resolve().then(fn);
  } else if (typeof MutationObserver === "function") {
    // 浏览器环境下尝试使用MutationObserver
    const ob = new MutationObserver(() => {
      fn(); // 执行回调
      ob.disconnect(); // 停止监听
    });
    const node = document.createTextNode("");
    ob.observe(node, { characterData: true });
    node.data = "1";
  } else {
    // 没有API，无法添加至微队列，退而求其次使用setTimeout
    //! 需要注意setTimeout无法将任务添加至微队列，是不得已的做法
    setTimeout(fn, 0);
  }
}

// #endregion main
