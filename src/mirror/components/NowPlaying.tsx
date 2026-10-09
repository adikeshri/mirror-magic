import { Music } from "lucide-react";
import { Marquee } from "./Marquee";
import { useNow } from "../useClock";
import type { NowPlaying as Track } from "../useNowPlaying";

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// Cover art beside title, artist and a progress bar, like a player's now-playing card. It is as wide as the track needs,
// up to a cap, so it stays centered; every row has a fixed height, and a title or artist past the cap glides (Marquee).
export function NowPlaying({ track, fetchedAt }: { track: Track; fetchedAt: number }) {
  const now = useNow(1000);
  const dur = track.durationMs;
  const base = track.positionMs ?? 0;
  const pos = Math.max(0, Math.min(dur ?? Infinity, track.state === "playing" ? base + (now.getTime() - fetchedAt) : base));
  return (
    <div className="flex w-fit max-w-[min(22.5rem,90vw)] items-center gap-[1.3rem] text-left">
      {track.coverUrl ? (
        <img src={track.coverUrl} alt="" className="size-[6rem] shrink-0 rounded-md object-cover shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.6)]" />
      ) : (
        <div className="grid size-[6rem] shrink-0 place-items-center rounded-md bg-white/10 text-faint">
          <Music size="40%" strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <div className="min-w-[8rem]">
        <p className="h-[1.7rem] text-[1.3rem] leading-[1.7rem] text-bright" style={{ fontWeight: 400 }}>
          <Marquee key={track.title}>{track.title ?? ""}</Marquee>
        </p>
        <p className="t-text h-[1.45rem] text-[1rem] leading-[1.45rem] text-dim">
          <Marquee key={track.artist}>{track.artist ?? ""}</Marquee>
        </p>
        {/* Always laid out, so a track without a known length doesn't change the card's height. */}
        <div className={`mt-[0.65rem] ${dur ? "" : "invisible"}`}>
          <div className="h-[3px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${dur ? (pos / dur) * 100 : 0}%` }} />
          </div>
          <p className="t-meta mt-[0.3rem] flex h-[1.15rem] justify-between text-[0.85rem] leading-[1.15rem] tabular-nums text-faint">
            <span>{clock(pos)}</span>
            <span>{track.state === "paused" ? "Paused" : clock(dur ?? 0)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
