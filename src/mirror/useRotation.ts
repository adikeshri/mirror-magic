import { useEffect, useState } from "react";

// Index into a list that advances every `intervalMs`. -1 when the list is empty.
export function useRotation(length: number, intervalMs: number, randomStart = false) {
  const [i, setI] = useState(() => (randomStart && length > 0 ? Math.floor(Math.random() * length) : 0));
  useEffect(() => {
    if (length <= 1) return;
    const id = window.setInterval(() => setI((x) => x + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs]);
  return length > 0 ? i % length : -1;
}
