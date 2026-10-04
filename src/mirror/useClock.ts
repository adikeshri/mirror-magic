import { useEffect, useState } from "react";

// Ticks on the boundary of `stepMs`, so a minute clock flips exactly on the minute.
export function useNow(stepMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let id: number;
    const schedule = () => {
      id = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, stepMs - (Date.now() % stepMs) + 5);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, [stepMs]);
  return now;
}
