function getSelectors(path) {
  return path
    .reverse()
    .filter((ele) => {
      return ele !== document && ele !== window;
    })
    .map((ele) => {
      if (ele.id) {
        return `${ele.nodeName.toLowerCase()}#${ele.id}`;
      } else if (ele.className) {
        return `${ele.nodeName.toLowerCase()}.${ele.className}`;
      } else {
        return ele.nodeName.toLowerCase();
      }
    })
    .join(" ");
}

export default function (path) {
  if (Array.isArray(path)) {
    return getSelectors(path);
  }
}
