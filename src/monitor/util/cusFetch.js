const post = (url, param, options = {}) => {
  const { headers = {} } = options;
  fetch(url, {
    method: "post",
    body: JSON.stringify(param),
    headers: new Headers({
      "Content-Type": "application/json",
      ...headers,
    }),
  }).catch((err) => {
    console.log(err, "埋点失败");
  });
};

/**
 *
 * @param method  请求类型(大写)  GET/POST
 * @param url     请求URL
 * @param param   请求参数
 * @param successCallback  成功回调方法
 * @param failCallback   失败回调方法
 */
const cusAjax = function (method, url, param, successCallback, failCallback) {
  var xmlHttp = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  xmlHttp.open(method, url, true);
  xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      var res = JSON.parse(xmlHttp.responseText);
      typeof successCallback == "function" && successCallback(res);
    } else {
      typeof failCallback == "function" && failCallback();
    }
  };

  xmlHttp.send("data=" + JSON.stringify(param));
};

export { cusAjax, post };
