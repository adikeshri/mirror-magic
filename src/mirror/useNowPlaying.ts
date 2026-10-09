import { useEffect, useState } from "react";
import { apiUrl } from "./fetchJson";

export type NowPlaying = {
  state: "playing" | "paused" | "stopped";
  title: string | null;
  artist: string | null;
  album: string | null;
  coverUrl: string | null;
  positionMs: number | null; // as of the moment it was received
  durationMs: number | null;
};

// Mira pushes the player's state whenever it changes (server-sent events), so there is nothing to poll; EventSource
// reconnects by itself if Mira restarts. track is null when there is nothing worth showing; fetchedAt is when the
// current state arrived, which lets the progress bar keep moving in between.
export function useNowPlaying(enabled: boolean): { track: NowPlaying | null; fetchedAt: number } {
  const [latest, setLatest] = useState<{ np: NowPlaying; at: number } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource(apiUrl("/api/now-playing/stream"));
    source.onmessage = (e) => {
      try {
        setLatest({ np: JSON.parse(e.data) as NowPlaying, at: Date.now() });
      } catch {
        /* ignore a malformed message; the next one replaces it */
      }
    };
    return () => source.close();
  }, [enabled]);
  const np = enabled ? latest?.np : null;
  return { track: np && np.state !== "stopped" && np.title ? np : null, fetchedAt: latest?.at ?? 0 };
}
