import { Pause } from "lucide-react";
import type { NowPlaying as Track } from "../useNowPlaying";

export function NowPlaying({ track }: { track: Track }) {
  return (
    <div className="fade-in flex items-center gap-[1rem] text-left">
      {track.coverUrl && <img src={track.coverUrl} alt="" className="size-[3.5rem] rounded object-cover" />}
      <p className="t-text min-w-0 text-normal">
        <span className="block truncate text-bright">{track.title}</span>
        <span className="t-meta flex items-center gap-[0.4em] truncate text-dim">
          {track.state === "paused" && <Pause size="1em" strokeWidth={1.5} aria-label="Paused" />}
          {track.artist}
        </span>
      </p>
    </div>
  );
}
