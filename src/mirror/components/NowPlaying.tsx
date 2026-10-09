import { Music } from "lucide-react";
import { Marquee } from "./Marquee";
import { useNow } from "../useClock";
import type { NowPlaying as Track } from "../useNowPlaying";

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// Cover art beside title, artist and a progress bar, like a player's now-playing card. Its size never depends on the
// track: the width is fixed, every row has a fixed height, and a title or artist that does not fit glides (Marquee).
export function NowPlaying({ track, fetchedAt }: { track: Track; fetchedAt: number }) {
  const now = useNow(1000);
  const dur = track.durationMs;
  const base = track.positionMs ?? 0;
  const pos = Math.max(0, Math.min(dur ?? Infinity, track.state === "playing" ? base + (now.getTime() - fetchedAt) : base));
  return (
    <div className="flex w-[min(28rem,90vw)] items-center gap-[1.6rem] text-left">
      {track.coverUrl ? (
        <img src={track.coverUrl} alt="" className="size-[7.5rem] shrink-0 rounded-md object-cover shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.6)]" />
      ) : (
        <div className="grid size-[7.5rem] shrink-0 place-items-center rounded-md bg-white/10 text-faint">
          <Music size="40%" strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="h-[2.1rem] text-[1.6rem] leading-[2.1rem] text-bright" style={{ fontWeight: 400 }}>
          <Marquee key={track.title}>{track.title ?? ""}</Marquee>
        </p>
        <p className="t-text h-[1.8rem] leading-[1.8rem] text-dim">
          <Marquee key={track.artist}>{track.artist ?? ""}</Marquee>
        </p>
        {/* Always laid out, so a track without a known length doesn't change the card's height. */}
        <div className={`mt-[0.8rem] ${dur ? "" : "invisible"}`}>
          <div className="h-[3px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${dur ? (pos / dur) * 100 : 0}%` }} />
          </div>
          <p className="t-meta mt-[0.35rem] flex h-[1.4rem] justify-between leading-[1.4rem] tabular-nums text-faint">
            <span>{clock(pos)}</span>
            <span>{track.state === "paused" ? "Paused" : clock(dur ?? 0)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
