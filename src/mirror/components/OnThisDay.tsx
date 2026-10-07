import type { HistoricalEvent } from "../useOnThisDay";
import { useRotation } from "../useRotation";

const ROTATE_MS = 60_000;

export function OnThisDay({ events }: { events: HistoricalEvent[] }) {
  const i = useRotation(events.length, ROTATE_MS);
  if (i < 0) return null;
  const e = events[i];
  return (
    <p key={i} className="t-text fade-in line-clamp-4 text-normal">
      <span className="mr-[0.5em] text-bright tabular-nums">{e.year}</span>
      {e.text}
    </p>
  );
}
