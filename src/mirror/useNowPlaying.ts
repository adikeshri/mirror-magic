import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";

export type NowPlaying = { state: "playing" | "paused" | "stopped"; title: string | null; artist: string | null; album: string | null; coverUrl: string | null };

const REFRESH_MS = 5_000;

// Mira holds whatever the Pi's player last reported. null means nothing worth showing.
export function useNowPlaying(enabled: boolean): NowPlaying | null {
  const np =
    useQuery({
      queryKey: ["nowplaying"],
      queryFn: () => fetchJson<NowPlaying>("/api/now-playing"),
      enabled,
      refetchInterval: REFRESH_MS,
      retry: false, // an older Mira has no such route; don't hold up the welcome waiting on it
    }).data ?? null;
  return np && np.state !== "stopped" && np.title ? np : null;
}
