let lastEvent;

["click", "touchstart", "mousedown", "keydown", "mouseover"].forEach(
  (eventType) => {
    document.addEventListener(
      eventType,
      (e) => {
        lastEvent = e;
      },
      // 捕获阶段  不阻止默认事件
      { capture: true, passive: true }
    );
  }
);

export default () => lastEvent;
