import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";

export type MarketQuote = { value: number; changePct: number | null; trend?: number[] };

export type MarketRow = {
  key: string;
  label: string;
  quote: MarketQuote | null;
  // How to format the value: a currency code, or null for a plain number.
  currency: string | null;
  // For fx, a rising rate means the "from" currency got dearer, which the
  // viewer (holding "to") reads as bad news.
  invertColor?: boolean;
};

const REFRESH_MS = 5 * 60 * 1000;

// Mira assembles the rows (crypto, fx, indices) from config.json and caches upstream calls.
export function useMarkets(enabled: boolean): MarketRow[] {
  return (
    useQuery({
      queryKey: ["markets"],
      queryFn: () => fetchJson<MarketRow[]>("/api/markets", 60_000),
      enabled,
      refetchInterval: REFRESH_MS,
      staleTime: REFRESH_MS,
    }).data ?? []
  );
}
