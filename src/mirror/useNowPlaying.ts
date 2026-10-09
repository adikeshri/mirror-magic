import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";

export type NowPlaying = {
  state: "playing" | "paused" | "stopped";
  title: string | null;
  artist: string | null;
  album: string | null;
  coverUrl: string | null;
  positionMs: number | null; // as of the moment it was fetched
  durationMs: number | null;
};

const REFRESH_MS = 5_000;

// Mira holds whatever the Pi's player last reported. track is null when there is nothing worth showing;
// fetchedAt lets the progress bar keep moving between polls.
export function useNowPlaying(enabled: boolean): { track: NowPlaying | null; fetchedAt: number } {
  const q = useQuery({
    queryKey: ["nowplaying"],
    queryFn: () => fetchJson<NowPlaying>("/api/now-playing"),
    enabled,
    refetchInterval: REFRESH_MS,
    retry: false, // an older Mira has no such route; don't hold up the welcome waiting on it
  });
  const np = q.data ?? null;
  return { track: np && np.state !== "stopped" && np.title ? np : null, fetchedAt: q.dataUpdatedAt };
}
