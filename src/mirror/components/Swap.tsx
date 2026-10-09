import { useEffect, useRef, useState, type ReactNode } from "react";

// Crossfades when `k` changes: the old content drifts out while the new drifts in, stacked in one grid cell so
// the spot is never blank. Use instead of `key={…}` for any content that changes on its own (rotations, refreshes).
export function Swap({ k, className = "", children }: { k: string | number; className?: string; children: ReactNode }) {
  const [leaving, setLeaving] = useState<{ k: string | number; node: ReactNode }[]>([]);
  const shown = useRef<{ k: string | number; node: ReactNode } | null>(null);
  // Stays off until the key first changes, so the initial mount is left to the module's own entrance.
  const initial = useRef(k);
  const animate = useRef(false);
  if (k !== initial.current) animate.current = true;

  // Declared before the effect that records `shown`, so it still holds the previous render here.
  useEffect(() => {
    if (shown.current && shown.current.k !== k) {
      const gone = shown.current;
      setLeaving((l) => [...l, gone]);
    }
  }, [k]);
  useEffect(() => {
    shown.current = { k, node: children };
  });

  return (
    <div className="grid">
      {leaving.map((l) => (
        <div
          key={l.k}
          aria-hidden
          className={`fade-out pointer-events-none ${className}`}
          style={{ gridArea: "1 / 1" }}
          onAnimationEnd={() => setLeaving((x) => x.filter((y) => y !== l))}
        >
          {l.node}
        </div>
      ))}
      <div key={k} className={`${animate.current ? "fade-in" : ""} ${className}`} style={{ gridArea: "1 / 1" }}>
        {children}
      </div>
    </div>
  );
}
