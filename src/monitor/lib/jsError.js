import getLastEvent from "../util/getLastEvent";
import getSelector from "../util/getSelector";
import tracker from "../util/tracker";

export function injectJsError() {
  window.addEventListener(
    "error",
    (e) => {
      console.log("injectJsError", e);
      const lastEvent = getLastEvent(); // 最后一个交互事件
      let stats = {
        category: "stability",
        type: e.type,
        errorType: "jsError",
        message: e.message,
        url: location.href,
        position: `${e.lineno}:${e.colno}`,
        stack: getLines(e.error.stack),
        // 最后一次操作
        selector: lastEvent ? getSelector(lastEvent.path) : "",
      };
      tracker.send(stats);
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (e) => {
      let message = "",
        url = "",
        position = "",
        stack = "";
      const reason = e.reason;
      const lastEvent = getLastEvent();
      if (typeof reason === "string") {
        message = reason;
      } else if (typeof reason === "object") {
        // at http://localhost:8080/:29:28\n
        if (reason.stack) {
          let ret = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          url = ret[1];
          position = `${ret[2]}:${ret[3]}`;
          stack = getLines(reason.stack);
          message = reason.message;
        }
      }
      let stats = {
        category: "stability",
        type: e.type,
        errorType: "promiseError",
        message,
        url,
        position,
        stack,
        // 最后一次操作
        selector: lastEvent ? getSelector(lastEvent.path) : "",
      };
      tracker.send(stats);
    },
    true
  );
}

function getLines(stack) {
  return stack
    .split("\n")
    .slice(1)
    .map((v) => v.replace(/^\s+at\s+/g, ""))
    .join("^");
}
