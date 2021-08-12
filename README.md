# 前端性能监控

## 原则说明

- 不能影响主应用，包括监控代码不会篡改主应用，不会抢占请求，出错不影响主应用正常运行等

- 数据结构统一，便于消费

## 监控类型说明

稳定性相关，用户体验相关，业务相关

以下主要分析稳定性相关实操

### jsError

```js
/**
   * 捕获jserror
   * 目前无法捕获的异常有：
   * 1. 网络异常，如果需要，需要在捕获阶段去做
   * 2. promise异常；
   * 结论：如果想通过onerror函数收集不同域的js错误，我们需要做两件事：
      1. 相关的js文件上加上Access-Control-Allow-Origin:*的response header
      2. 引用相关的js文件时加上crossorigin属性；例如：<script type="text/javascript" src="http://b.com/b.js"  crossorigin></script>
  */
window.onerror = (message, scriptUrl, lineNum, columnNum, error) => {};

// 重写console.error, 可以捕获更全面的报错信息
const oldError = console.error;
console.error = function () {};
```

### promiseError

```js
// 监听unhandledrejection事件，即可捕获到未处理的Promise错误
// 对promise未有catch可以捕获，但是如果自身加了catch无法捕获
window.addEventListener("unhandledrejection", (event) => {}

// 扩展XHR原型，检测返回的状态码，如404等，来检测ajax请求失败、错误
// 待实现
```

### resourceError

```js
// 监听静态资源加载异常
// 可以按照typeName区分资源类型
window.addEventListener("error", (event) => {
    const typeName = e.target.localName;
}
```

## 上报方式说明

尽可能地选择页面卸载时，批量上报，节流上报

### ajax 请求

- 页面卸载时户代理通常会忽略往往会忽略请求，这个是很困难的

### img 标签

- 兼容性好，异步，不存在跨域

- 大小受制于 url

- 与其他高优先级竞争资源，且不确保数据正确传输到服务端

### sendBeacon 方法

- 使用 `sendBeacon()` 方法会使用户代理在有机会时异步地向服务器发送数据

- 不会延迟页面的卸载或影响下一导航的载入性能。

- 这就解决了提交分析数据时的所有的问题：数据可靠，传输异步并且不会影响下一页面的加载

- [参考 MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon)

## 可视化

[The Elastic Stack](https://www.elastic.co/cn/elastic-stack/)

## 自动化预警

设定业务指标，超过阈值触发邮件，JIRA/Dingding Boot 通知到责任人以及其他相关人员

## 未来

- 如何联合监控？

- 小程序怎么监控？

## 参考

- [腾讯前端团队是如何做 web 性能监控的](https://cloud.tencent.com/developer/article/1650831)

- [我在谈论前端监控时我在谈什么](https://github.com/zhangxiang958/Blog/issues/25)

- [开源的监控系统整合](https://cloud.tencent.com/developer/news/682347)
