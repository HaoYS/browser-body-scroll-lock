# browser-body-scroll-lock

解决移动端弹窗滚动透传问题。 通过对 body 的 touchstart 和 touchmove 事件的监听，拦截浏览器默认行为。

```typescript
import React, { useState, useEffect, useRef } from "react";
import { disableBodyScroll, enableBodyScroll } from "browser-body-scroll-lock";

function App() {
  const [list, setList] = useState<any[]>([]);
  const [visit, setVisit] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setList(() => new Array(100).fill(1));
  }, []);

  useEffect(() => {
    if (ref.current) {
      visit && disableBodyScroll(ref.current);
    }
  }, [visit]);

  return (
    <div className="App">
      <button
        onClick={() => {
          setVisit(true);
        }}
      >
        show
      </button>

      <div>
        {list.map((p, i) => {
          return (
            <p key={i}>
              {p} - {i}
            </p>
          );
        })}
      </div>
      {visit ? (
        <div className="mask" onClick={() => {}}>
          <div className="mask-content" ref={ref} id="r">
            <button
              onClick={() => {
                ref.current && enableBodyScroll(ref.current);
                setVisit(false);
              }}
            >
              hide
            </button>
            {list.map((p, i) => (
              <p key={i}>
                {p}/{i}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
```
