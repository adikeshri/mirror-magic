import { useQuery } from "@tanstack/react-query";
import { Settings } from "./config";
import { fetchJson, num } from "./fetchJson";

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
const FX_REFRESH_MS = 60 * 60 * 1000; // ECB rates change once a day

type MarketsConfig = Settings["markets"];

async function loadCrypto(cfg: MarketsConfig): Promise<Record<string, MarketQuote>> {
  const vs = cfg.cryptoCurrency;
  const params = new URLSearchParams({
    vs_currency: vs,
    ids: cfg.crypto.map((c) => c.id).join(","),
    sparkline: "true",
  });
  type Coin = { id: string; current_price?: number; price_change_percentage_24h?: number; sparkline_in_7d?: { price?: number[] } };
  const list = await fetchJson<Coin[]>(`https://api.coingecko.com/api/v3/coins/markets?${params}`);
  const out: Record<string, MarketQuote> = {};
  for (const c of list) {
    const value = num(c.current_price);
    if (value != null) out[c.id] = { value, changePct: num(c.price_change_percentage_24h), trend: c.sparkline_in_7d?.price };
  }
  return out;
}

// Change is measured against the previous published ECB rate.
async function loadFxPair(from: string, to: string): Promise<MarketQuote | null> {
  const start = new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10);
  const j = await fetchJson<{ rates?: Record<string, Record<string, number>> }>(
    `https://api.frankfurter.dev/v1/${start}..?base=${from}&symbols=${to}`,
  );
  const values = Object.keys(j.rates ?? {})
    .sort()
    .map((d) => num(j.rates![d][to]))
    .filter((v): v is number => v != null);
  if (values.length === 0) return null;
  const latest = values[values.length - 1];
  const prev = values.length > 1 ? values[values.length - 2] : null;
  return { value: latest, changePct: prev ? ((latest - prev) / prev) * 100 : null, trend: values.slice(-7) };
}

async function loadFx(cfg: MarketsConfig): Promise<Record<string, MarketQuote>> {
  const results = await Promise.all(
    cfg.fx.map(({ from, to }) => loadFxPair(from, to).catch(() => null)),
  );
  const out: Record<string, MarketQuote> = {};
  cfg.fx.forEach(({ from, to }, i) => {
    const q = results[i];
    if (q) out[`${from}${to}`] = q;
  });
  return out;
}

type IndexQuote = MarketQuote & { symbol: string };

// Served by our own server (server/yahoo.ts), which caches by market hours.
async function loadIndices(): Promise<Record<string, MarketQuote>> {
  const list = await fetchJson<IndexQuote[]>("/api/indices", 60_000);
  return Object.fromEntries(list.map((q) => [q.symbol, { value: q.value, changePct: q.changePct, trend: q.trend }]));
}

export function useMarkets(cfg: MarketsConfig, enabled: boolean): MarketRow[] {
  const cryptoKey = JSON.stringify([cfg.crypto, cfg.cryptoCurrency]);
  const crypto = useQuery({
    queryKey: ["crypto", cryptoKey],
    queryFn: () => loadCrypto(cfg),
    enabled: enabled && cfg.crypto.length > 0,
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
  }).data;
  const fx = useQuery({
    queryKey: ["fx", JSON.stringify(cfg.fx)],
    queryFn: () => loadFx(cfg),
    enabled: enabled && cfg.fx.length > 0,
    refetchInterval: FX_REFRESH_MS,
    staleTime: FX_REFRESH_MS,
  }).data;
  const indices = useQuery({
    queryKey: ["indices", JSON.stringify(cfg.indices)],
    queryFn: loadIndices,
    enabled: enabled && cfg.indices.length > 0,
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
  }).data;

  return [
    ...cfg.crypto.map((c) => ({
      key: `crypto:${c.id}`,
      label: c.label,
      quote: crypto?.[c.id] ?? null,
      currency: cfg.cryptoCurrency.toUpperCase(),
    })),
    ...cfg.fx.map((f) => ({
      key: `fx:${f.from}${f.to}`,
      label: f.label ?? `${f.from}/${f.to}`,
      quote: fx?.[`${f.from}${f.to}`] ?? null,
      currency: f.to,
      invertColor: true,
    })),
    ...cfg.indices.map((ix) => ({
      key: `index:${ix.symbol}`,
      label: ix.label,
      quote: indices?.[ix.symbol] ?? null,
      currency: null,
    })),
  ];
}
