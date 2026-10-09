import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";

export type HistoricalEvent = { year: number; text: string };

const load = (month: string, day: string) => fetchJson<HistoricalEvent[]>(`/api/on-this-day?month=${month}&day=${day}`);

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
      placeholderData: keepPreviousData, // midnight: the old day stays until the new one lands, never a blank module
    }).data ?? []
  );
}
