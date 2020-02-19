export function arrayMove<T>(array: T[], from: number, to: number) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

export function arrayRemove<T>(array: T[], index: number) {
  array = array.slice();
  array.splice(index, 1);
  return array;
}

export function getTranslateOffset(element: Element) {
  const style = window.getComputedStyle(element);
  return (
    Math.max(
      parseInt(style['margin-top' as any], 10),
      parseInt(style['margin-bottom' as any], 10)
    ) + element.getBoundingClientRect().height
  );
}

export function isTouchEvent(event: TouchEvent & MouseEvent) {
  return (
    (event.touches && event.touches.length) ||
    (event.changedTouches && event.changedTouches.length)
  );
}

export function transformItem(
  element: Element,
  offsetY: number | null = 0,
  offsetX: number | null = 0
) {
  if (!element) return;
  if (offsetY === null || offsetX === null) {
    (element as HTMLElement).style.removeProperty('transform');
    return;
  }
  (element as HTMLElement).style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

export function isItemTransformed(element: Element) {
  return !!(element as HTMLElement).style.transform;
}

export function setItemTransition(
  element: Element,
  duration: number,
  timing?: string
) {
  if (element) {
    (element as HTMLElement).style[
      'transition' as any
    ] = `transform ${duration}ms${timing ? ` ${timing}` : ''}`;
  }
}

// returns the "slot" for the targetValue, aka where it should go
// in an ordered "array", it starts with -1 index
export function binarySearch(array: number[], targetValue: number) {
  let min = 0;
  let max = array.length - 1;
  let guess: number;
  while (min <= max) {
    guess = Math.floor((max + min) / 2);
    if (
      !array[guess + 1] ||
      (array[guess] <= targetValue && array[guess + 1] >= targetValue)
    ) {
      return guess;
    } else if (array[guess] < targetValue && array[guess + 1] < targetValue) {
      min = guess + 1;
    } else {
      max = guess - 1;
    }
  }
  return -1;
}

// adapted from https://github.com/alexreardon/raf-schd
export const schd = (fn: Function) => {
  let lastArgs: any[] = [];
  let frameId: number | null = null;
  const wrapperFn = (...args: any[]) => {
    lastArgs = args;
    if (frameId) {
      return;
    }
    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });
  };
  return wrapperFn;
};

export function checkIfInteractive(target: Element, rootElement: Element) {
  const DISABLED_ELEMENTS = [
    'input',
    'textarea',
    'select',
    'option',
    'optgroup',
    'video',
    'audio',
    'button',
    'a'
  ];
  const DISABLED_ROLES = ['button', 'link', 'checkbox', 'tab'];
  while (target !== rootElement) {
    if (target.getAttribute('data-movable-handle')) {
      return false;
    }
    if (DISABLED_ELEMENTS.includes(target.tagName.toLowerCase())) {
      return true;
    }
    const role = target.getAttribute('role');
    if (role && DISABLED_ROLES.includes(role.toLowerCase())) {
      return true;
    }
    if (
      target.tagName.toLowerCase() === 'label' &&
      target.hasAttribute('for')
    ) {
      return true;
    }
    if (target.tagName) target = target.parentElement!;
  }
  return false;
}

// consider 20% area top and 20% area bottom of view port as drag zones.
export const calcDragZoneHeight = (viewportHeight: number, maxSize: number) =>
  Math.min(
    Math.round( viewportHeight * 0.2),
    maxSize,
  );

const scale = (x: number, i1: number, i2: number, o1: number, o2: number) => ((x - i1) / (i2 - i1)) * (o2 - o1) + o1;
export const calcSpeed = (distance: number, maxDistance: number, maxSpeed: number) => {
  // idea is to use the exponential curve e^x. whose range starts from 1 if x = 0
  // first off, lets use exp func = e^x - 1 to make the range start from 0 when x = 0
  // now, we need to cap exp func to maxSpeed
  // so we need to find the value of x that would give us maxSpeed
  // Math:
  // e^xmax - 1 = maxSpeed
  // => e^xmax = maxSpeed + 1
  // => xmax = log(maxSpeed + 1)
  const maxScale = Math.log(maxSpeed + 1);

  // now that we got both ranges let's scale client Y from 0 - maxDistance range to 0 - maxSpeed
  const cappedDistance = Math.min(distance, maxDistance);
  const scaledDistance = scale(cappedDistance, 0, maxDistance, 0, maxScale);
  return Math.round(Math.exp(scaledDistance) - 1);
};