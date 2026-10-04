// Index quotes from Yahoo Finance's unofficial chart endpoint.
//
// Yahoo is strict: requests without a browser User-Agent get 429, and so does
// a request that follows another within ~2s. So calls are serialised with a
// gap, cached per symbol by market hours, and the last good value is served
// when Yahoo refuses. The cache is kept on disk so a restart doesn't blank it.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type IndexQuote = { symbol: string; value: number; changePct: number | null; asOf: number };
type Period = { start: number; end: number }; // epoch seconds, from Yahoo

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const GAP_MS = 4000;
const OPEN_TTL_MS = 5 * 60 * 1000;
const CLOSED_TTL_MS = 60 * 60 * 1000;
const CLOSE_GRACE_MS = 15 * 60 * 1000; // the closing print lands a few minutes late
const FAILURE_BACKOFF_MS = 2 * 60 * 1000;

// When should a quote fetched at `now` be refetched?
//   before the session opens -> hold until the open
//   during the session       -> every 5 minutes
//   after the close          -> hourly, until Yahoo rolls over to the next
//                               session, which then holds until that open
export function expiryFor(now: number, period: Period | null): number {
  if (!period) return now + OPEN_TTL_MS;
  const start = period.start * 1000;
  const end = period.end * 1000;
  if (now < start) return start;
  if (now < end + CLOSE_GRACE_MS) return now + OPEN_TTL_MS;
  return now + CLOSED_TTL_MS;
}

type Entry = { quote: IndexQuote; expiresAt: number };
const CACHE_FILE = resolve(process.env.MIRROR_CACHE_DIR ?? ".cache", "indices.json");

function loadCache(): Map<string, Entry> {
  try {
    return new Map(Object.entries(JSON.parse(readFileSync(CACHE_FILE, "utf8")) as Record<string, Entry>));
  } catch {
    return new Map();
  }
}

function saveCache() {
  try {
    mkdirSync(dirname(CACHE_FILE), { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache)));
  } catch (e) {
    console.warn(`[mirror] could not write ${CACHE_FILE}: ${(e as Error).message}`);
  }
}

const cache = loadCache();
const failedUntil = new Map<string, number>();
const inflight = new Map<string, Promise<IndexQuote | null>>();
let queue: Promise<unknown> = Promise.resolve();

function spaced<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  const gap = () => new Promise((r) => setTimeout(r, GAP_MS));
  queue = run.then(gap, gap);
  return run;
}

async function fetchQuote(symbol: string): Promise<{ quote: IndexQuote; period: Period | null }> {
  // range=1d makes chartPreviousClose the previous session's close.
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10_000) });
  if (!r.ok) throw new Error(`yahoo ${symbol} HTTP ${r.status}`);
  const meta = (await r.json())?.chart?.result?.[0]?.meta;
  const value = meta?.regularMarketPrice;
  if (typeof value !== "number") throw new Error(`yahoo ${symbol}: no price`);
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  const changePct = typeof prev === "number" && prev > 0 ? ((value - prev) / prev) * 100 : null;
  const regular = meta.currentTradingPeriod?.regular;
  const period = typeof regular?.start === "number" && typeof regular?.end === "number" ? regular : null;
  return { quote: { symbol, value, changePct, asOf: Date.now() }, period };
}

export function getIndexQuote(symbol: string): Promise<IndexQuote | null> {
  const now = Date.now();
  const hit = cache.get(symbol);
  if (hit && hit.expiresAt > now) return Promise.resolve(hit.quote);
  if ((failedUntil.get(symbol) ?? 0) > now) return Promise.resolve(hit?.quote ?? null);

  let p = inflight.get(symbol);
  if (!p) {
    p = spaced(() => fetchQuote(symbol))
      .then(({ quote, period }) => {
        cache.set(symbol, { quote, expiresAt: expiryFor(Date.now(), period) });
        saveCache();
        return quote;
      })
      .catch((e) => {
        console.warn(`[mirror] ${(e as Error).message}; serving last known value`);
        failedUntil.set(symbol, Date.now() + FAILURE_BACKOFF_MS);
        return hit?.quote ?? null;
      })
      .finally(() => inflight.delete(symbol));
    inflight.set(symbol, p);
  }
  return p;
}
