import { useQuery } from "@tanstack/react-query";
import { fetchJson, num } from "./fetchJson";

export type HistoricalEvent = { year: number; text: string };

async function load(month: string, day: string): Promise<HistoricalEvent[]> {
  const j = await fetchJson<{ events?: { year?: unknown; text?: unknown }[] }>(
    `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
  );
  return (j.events ?? []).flatMap((e) => {
    const year = num(e.year);
    const text = typeof e.text === "string" ? e.text.trim() : "";
    return year != null && text ? [{ year, text }] : [];
  });
}

// `today` is passed in so the query re-keys itself at midnight.
export function useOnThisDay(today: Date, enabled: boolean) {
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return (
    useQuery({
      queryKey: ["onthisday", month, day],
      queryFn: () => load(month, day),
      enabled,
      staleTime: Infinity,
    }).data ?? []
  );
}
