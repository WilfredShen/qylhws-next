// #region main
function timeout(fn: () => void) {
  setTimeout(fn, 1000);
}

function listenClick(dom: Element | null, fn: () => void) {
  dom?.addEventListener("click", fn);
}

function ajax(url: string, fn: () => void) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = fn;
  xhr.open("GET", url, true);
  xhr.send();
}

const handler = () => console.log("finished");

timeout(handler);
listenClick(document.getElementById("#test"), handler);
ajax("http://localhost", handler);

// #endregion main

// #region callback-hell
function waitInput(callback: (query: any) => void) {
  setTimeout(() => {
    /* 等待用户输入，并将用户输入存入userInput，完成后调用callback */
    const userInput = { username: "Alice", password: "123456" };
    callback(userInput);
  }, 3000);
}

function sendRequest(query: any, callback: (res: any) => void) {
  setTimeout(() => {
    /* 进行网络通信，并将响应结果存入response，完成后调用callback */
    const response = { code: 200, message: "success" };
    callback(response);
  }, 3000);
}

function refresh(callback: () => void) {
  setTimeout(() => {
    /* 请求刷新页面，完成后调用callback */
    callback();
  }, 3000);
}

function notify(message: string, callback: () => void) {
  setTimeout(() => {
    /* 显示提示信息，用户确认后调用callback */
    callback();
  }, 3000);
}

waitInput((query) => {
  sendRequest(query, (res) => {
    if (res.code === 200) {
      refresh(() => {
        notify("加载完成", () => {
          console.log("用户已确认");
        });
      });
    } else {
      /* ... */
    }
  });
});

// #endregion callback-hell

export default {};
