enum TouchStateMachineType {
  isNotContainer, // 不在容器中
  disableScroll, // 不需要滚动
  isScroll, // 可以滚动
  isScrollTop,
  isScrollBottom,
}

type TouchStateMachineValue = {
  type: TouchStateMachineType;
  touches: TouchList;
};

const TouchStateMachine = new Map<HTMLElement, TouchStateMachineValue>();
const Locks = new Map<HTMLElement, { [k in string]: (e: TouchEvent) => any }>();

function preventDefault(e: TouchEvent) {
  e.preventDefault();
  return false;
}

function touchstart(targetElement: HTMLElement) {
  return (e: TouchEvent) => {
    const isContainer =
      targetElement === e.srcElement ||
      targetElement.contains(e.srcElement as any);

    let type: TouchStateMachineType;
    if (!isContainer) {
      type = TouchStateMachineType.isNotContainer;
    } else if (targetElement.clientHeight >= targetElement.scrollHeight) {
      type = TouchStateMachineType.disableScroll;
    } else {
      const isTop = targetElement.scrollTop <= 0;
      const isBottom =
        targetElement.scrollTop + targetElement.clientHeight >=
        targetElement.scrollHeight;

      type = isTop
        ? TouchStateMachineType.isScrollTop
        : isBottom
        ? TouchStateMachineType.isScrollBottom
        : TouchStateMachineType.isScroll;
    }

    TouchStateMachine.set(targetElement, { type, touches: e.touches });
  };
}

function touchmove(targetElement: HTMLElement) {
  return (e: TouchEvent) => {
    const state = TouchStateMachine.get(targetElement);

    if (!state) return true;

    const isMoveUp = e.touches[0].clientY < state.touches[0].clientY; // 向上滑动

    if (
      state.type === TouchStateMachineType.isNotContainer ||
      state.type === TouchStateMachineType.disableScroll ||
      (state.type === TouchStateMachineType.isScrollTop && !isMoveUp) ||
      (state.type === TouchStateMachineType.isScrollBottom && isMoveUp)
    ) {
      TouchStateMachine.set(targetElement, {
        type: TouchStateMachineType.disableScroll,
        touches: e.touches,
      });
      return preventDefault(e);
    }
    return true;
  };
}

export function enableBodyScroll(targetElement: HTMLElement) {
  const handlers = Locks.get(targetElement);
  if (handlers) {
    Object.keys(handlers).forEach((handler) => {
      console.log(handler, handlers[handler]);
      document.removeEventListener(handler as any, handlers[handler] as any);
    });
  }
  Locks.delete(targetElement);
  TouchStateMachine.delete(targetElement);
}

export function disableBodyScroll(targetElement: HTMLElement) {
  if (!targetElement) {
    console.error(
      "disableBodyScroll unsuccessful - targetElement must be provided"
    );
    return;
  }

  if (Locks.get(targetElement)) {
    return;
  }

  if (targetElement.clientHeight >= targetElement.scrollHeight) {
    Locks.set(targetElement, { touchmove: preventDefault });
  } else {
    let lock = {
      touchstart: touchstart(targetElement),
      touchmove: touchmove(targetElement),
    };
    Locks.set(targetElement, lock);
  }

  const handlers = Locks.get(targetElement);
  if (handlers) {
    Object.keys(handlers).forEach((handler) => {
      document.addEventListener(handler as any, handlers[handler] as any, {
        passive: false,
      });
    });
  }
}

export function clearBodyScroll() {
  TouchStateMachine.forEach(function (value, key) {
    disableBodyScroll(key);
  });
}
