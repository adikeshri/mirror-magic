import { useLayoutEffect, type RefObject } from "react";

const MIN_FIT = 0.55;

// How much to shrink, from the current scale, so content `scrollHeight` tall fits in `clientHeight`.
export function nextFit(current: number, clientHeight: number, scrollHeight: number, min = MIN_FIT): number {
  if (scrollHeight <= clientHeight || scrollHeight <= 0) return current;
  // A hair under the exact ratio, because padding and gaps don't scale with the text.
  return Math.max(min, current * (clientHeight / scrollHeight) * 0.99);
}

// A busy mirror (calendar, commute and markets in one column) can be taller than the screen. Rather than
// overlap or cut off, scale the whole layout down until it fits. Re-measured whenever a column's size changes.
export function useFitToScreen(ref: RefObject<HTMLElement>, active: boolean) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const root = document.documentElement;
    let frame = 0;

    const fit = () => {
      let f = 1;
      root.style.setProperty("--fit", "1");
      for (let i = 0; i < 4; i++) {
        const next = nextFit(f, el.clientHeight, el.scrollHeight);
        if (next === f) break;
        f = next;
        root.style.setProperty("--fit", String(f));
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.style.removeProperty("--fit");
    };
  }, [ref, active]);
}
