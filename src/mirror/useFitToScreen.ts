import { useLayoutEffect, type RefObject } from "react";

const MIN_FIT = 0.55;

// How much to shrink, from the current scale, so content `scrollHeight` tall fits in `clientHeight`.
export function nextFit(current: number, clientHeight: number, scrollHeight: number, min = MIN_FIT): number {
  if (scrollHeight <= clientHeight || scrollHeight <= 0) return current;
  // A hair under the exact ratio, because padding and gaps don't scale with the text.
  return Math.max(min, current * (clientHeight / scrollHeight) * 0.99);
}

// How tall the layout needs to be: the lowest grid area plus the bottom padding. Measured from the areas
// themselves (layout sizes, not transformed rects), because scrollHeight stops at the padding box and would let
// the content eat the bottom margin.
function requiredHeight(el: HTMLElement): number {
  let bottom = 0;
  for (const child of Array.from(el.children) as HTMLElement[]) {
    if (child.style.gridArea) bottom = Math.max(bottom, child.offsetTop + child.offsetHeight);
  }
  return bottom + parseFloat(getComputedStyle(el).paddingBottom);
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
        const next = nextFit(f, el.clientHeight, requiredHeight(el));
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
