import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";

export type NewsItem = { title: string; source: string; url: string | null; publishedAt: Date | null };

type Wire = { title: string; source: string; url: string | null; publishedAt: string | null };

const REFRESH_MS = 10 * 60 * 1000;
const NONE = { world: [] as NewsItem[], local: [] as NewsItem[] };

const toItem = (w: Wire): NewsItem => ({ ...w, publishedAt: w.publishedAt ? new Date(w.publishedAt) : null });

// Mira fetches, parses, merges and sorts the feeds listed in config.json.
export function useNews(enabled: boolean) {
  return (
    useQuery({
      queryKey: ["news"],
      queryFn: async () => {
        const j = await fetchJson<{ world: Wire[]; local: Wire[] }>("/api/news", 30_000);
        return { world: j.world.map(toItem), local: j.local.map(toItem) };
      },
      enabled,
      refetchInterval: REFRESH_MS,
      staleTime: REFRESH_MS,
    }).data ?? NONE
  );
}
