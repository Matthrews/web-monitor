const userAgent = require("user-agent");

const project = "rfzhu-web-monitor";
const host = "cn-shanghai.log.aliyuncs.com";
const logstore = "web-monitor-log";

function getExtraInfo() {
  return {
    title: document.title,
    url: location.url,
    timeStamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).fullName,
    // more info about user
  };
}

/**
 * https://help.aliyun.com/document_detail/31752.htm?spm=a2c4g.11186623.2.24.19542e93WSQKIL#t13028.html
 * 使用Web Tracking则表示该Logstore打开互联网匿名写入权限，没有经过有效鉴权，可能产生脏数据。
 * GET请求不支持上传16 KB以上的Body内容。
 * POST请求每次写入的日志数量上限为3 MB或者4096条。更多信息，请参见PutLogs。
 */
class SendTracker {
  constructor() {
    this.url = `http://${project}.${host}/logstores/${logstore}/track?APIVersion=0.6.0`; // 上报服务器地址
    this.xhr = new XMLHttpRequest();
  }

  send(data = {}) {
    const extra = getExtraInfo();
    const log = { ...extra, ...data };
    console.log("SendTracker", log);
    // 阿里云要求对象值不能是数字
    for (const key in log) {
      if (typeof log[key] === "number") {
        log[key] = `${log[key]}`;
      }
      this.url += `&${key}=${log[key]}`;
    }
    this.xhr.open("GET", this.url, true);
    this.xhr.onload = () => {
      console.log("onload", this.xhr.response);
    };
    this.xhr.onerror = (error) => {
      console.log("onerror", error);
    };

    this.xhr.send();
  }
}

export default new SendTracker();
