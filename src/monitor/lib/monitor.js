import { cusAjax } from "../util/cusFetch";

function report(error) {
  /* 三种方式上报
  1. img上传，兼容性好，异步，不存在跨域，不过大小受制与url；
  2. 与其他高优先级竞争资源，且不确保数据正确传输到服务端
  var reportUrl = 'http://xxxx/report';
  new Image().src = reportUrl + 'error=' + JSON.stringify(error); // 兼容性强，但是受url信息长度限制；
  */

  /**
   * 该方法在IE上不兼容
   * Microsoft Edge	支持
   * data 参数是将要发送的 ArrayBufferView 或 Blob, DOMString 或者 FormData 类型
   */
  // 关于Blob: https://www.jianshu.com/p/b322c2d5d778
  const blob = new Blob([JSON.stringify(error)], {
    type: "application/x-www-form-urlencoded",
  });

  navigator.sendBeacon("reportUrl", blob);

  // 如果sendBeacon不可用则使用cusAjax

  cusAjax("POST", "reportUrl", blob);
}

const errInfo = {
  userId: "", // 用户id，标示唯一用户
  appId: "", // 应用id，标示唯一应用
  traceId: "", // 全链路id，多服务时，方便追踪异常
  sysInfo: "",
  errInfo: {},
  happenTime: "",
  simpleUrl: "",
};

const JsError = 1; // js异常
const StaticError = 2; // 静态资源加载异常

const formatErrObj = function (type = JsError, errInfo = {}) {
  return {
    ...errInfo,
    operateTime: new Date().valueOf(), // 操作时间
    simpleUrl: window.location.href.split("?")[0].replace("#", ""), // 当前url地址
    sysInfo: window.navigator.userAgent, // 用户当前平台
    type, // 异常类型
    errInfo, // 错误信息
  };
};

export const setConfig = ({ userId, appId }) => {
  errInfo.userId = userId;
  errInfo.appId = appId;
};

const initMonitor = () => {
  /**
   * 捕获jserror
   * 目前无法捕获的异常有：
   * 1. 网络异常，如果需要，需要在捕获阶段去做
   * 2. promise异常；
   * 结论：如果想通过onerror函数收集不同域的js错误，我们需要做两件事：
      1. 相关的js文件上加上Access-Control-Allow-Origin:*的response header
      2. 引用相关的js文件时加上crossorigin属性；例如：<script type="text/javascript" src="http://b.com/b.js"  crossorigin></script>
  */
  window.onerror = (message, scriptUrl, lineNum, columnNum, error) => {
    try {
      const reqData = formatErrObj({
        errMsg: message,
        url: scriptUrl,
        line: lineNum,
        column: columnNum,
        error,
      });
      report(reqData);
    } catch (e) {
      console.log(e, "上报异常");
    }
  };

  // 重写console.error, 可以捕获更全面的报错信息
  const oldError = console.error;
  console.error = function () {
    // arguments的长度为2时，才是error上报的时机
    if (arguments.length < 2) return;
    var errorMsg = arguments[0] && arguments[0].message;
    var errorObj = arguments[0] && arguments[0].stack;
    if (!errorObj) errorObj = arguments[0];
    // 如果onerror重写成功，就无需在这里进行上报了
    var reqData = formatErrObj({
      url: null,
      errMsg: errorMsg,
      line: 0,
      column: 0,
      errorObj,
    });
    !jsMonitorStarted && report(reqData);
    return oldError.apply(console, arguments);
  };

  /**
   * 监听unhandledrejection事件，即可捕获到未处理的Promise错误
   * 对promise未有catch可以捕获，但是如果自身加了catch无法捕获
   */
  window.addEventListener("unhandledrejection", (event) => {
    try {
      const { scriptUrl, lineNum, columnNum, error } = event;
      const reqData = formatErrObj({
        url: scriptUrl,
        line: lineNum,
        column: columnNum,
        error,
      });
      report(reqData);
    } catch (e) {
      console.log(e, "上报异常");
    }
  });

  /**
   * 监听静态资源加载异常
   * 目前只监听了css和js
   */
  window.addEventListener(
    "error",
    function (e) {
      try {
        const typeName = e.target.localName;
        let sourceUrl = "";
        let type = "";
        if (typeName === "link") {
          sourceUrl = e.target.href;
          type = "css";
        } else if (typeName === "script") {
          sourceUrl = e.target.src;
          type = "js";
        }

        report(StaticError, { typeName: type, url: sourceUrl });
      } catch (err) {
        console.log("静态资源异常捕获失败");
      }
    },
    true
  );

  /**
   * 上报时机
   * 选择页面卸载时，批量上报
   * 上报方式，sendBeacon方法
   * 使用 sendBeacon() 方法会使用户代理在有机会时异步地向服务器发送数据，同时不会延迟页面的卸载或影响下一导航的载入性能。
   * 这就解决了提交分析数据时的所有的问题：数据可靠，传输异步并且不会影响下一页面的加载
   */
  window.addEventListener("unload", logData, false);
};

initMonitor();
