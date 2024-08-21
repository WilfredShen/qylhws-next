// #region main
function waitInput() {
  return new Promise<any>((resolve) => {
    /* 等待用户输入，并将用户输入存入userInput，完成后调用resolve */
    const userInput = { username: "Alice", password: "123456" };
    resolve(userInput);
  });
}

function sendRequest(query: any) {
  return new Promise<any>((resolve) => {
    /* 进行网络通信，并将响应结果存入response，完成后调用resolve */
    const response = { code: 200, message: "success" };
    resolve(response);
  });
}

function refresh() {
  return new Promise<void>((resolve) => {
    /* 请求刷新页面，完成后调用resolve */
    resolve();
  });
}

function notify(message: string) {
  return new Promise<void>((resolve) => {
    /* 显示提示信息，用户确认后调用resolve */
    resolve();
  });
}

waitInput()
  .then((userInput) => sendRequest(userInput))
  .then((res) => {
    if (res.code === 200) return refresh();
    else throw "请求失败";
  })
  .then(() => notify("加载完成"))
  .then(() => console.log("用户已确认"))
  .catch((err) => console.error(err));

// #endregion main

export default {};
