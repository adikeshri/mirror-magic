// A title wider than its row rests at the start, glides to the end, rests, and glides back (see .marquee-run).
// The keyframes spend 15% of the cycle resting at each end and 35% moving each way, so the duration follows
// from the speed. It never drops below MIN_SECONDS, which keeps the rests long enough to read at.
const MOVE_SHARE = 0.35;
export const MIN_SECONDS = 10;

export function marqueeSeconds(overflowPx: number, speedPxPerSecond = 36): number {
  if (!(overflowPx > 0)) return 0;
  return +Math.max(MIN_SECONDS, overflowPx / (MOVE_SHARE * speedPxPerSecond)).toFixed(1);
}
