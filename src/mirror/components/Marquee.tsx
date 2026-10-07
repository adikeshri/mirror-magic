import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { marqueeSeconds } from "../marquee";

// One line of text. If it is wider than the space it has, it glides back and forth so all of it can be read.
export function Marquee({ children, className = "" }: { children: string; className?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useLayoutEffect(() => {
    const outer = box.current;
    const inner = text.current;
    if (!outer || !inner) return;
    const measure = () => setOverflow(Math.max(0, Math.ceil(inner.scrollWidth - outer.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [children]);

  const seconds = marqueeSeconds(overflow);
  const style = seconds ? ({ "--shift": `${overflow}px`, "--dur": `${seconds}s` } as CSSProperties) : undefined;
  return (
    <span ref={box} className={`marquee block min-w-0 overflow-hidden whitespace-nowrap ${className}`}>
      <span ref={text} className={`inline-block ${seconds ? "marquee-run" : ""}`} style={style}>
        {children}
      </span>
    </span>
  );
}
