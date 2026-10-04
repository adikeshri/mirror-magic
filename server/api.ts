import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { DEFAULT_SETTINGS, SettingsSchema, type Settings } from "../src/mirror/config.ts";
import { getIndexQuote } from "./yahoo.ts";

// The mirror's small backend. It exists only for data browsers cannot fetch
// themselves (no CORS): RSS feeds and Yahoo index quotes. It never proxies a
// URL supplied by the client, only those listed in config.json.

const FEED_TTL_MS = 10 * 60 * 1000;
const FEED_MAX_BYTES = 2 * 1024 * 1024;
const FEED_UA = "mirror-magic (self-hosted magic mirror)";

export async function loadConfig(path: string): Promise<Settings> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    return DEFAULT_SETTINGS; // no config.json: run on defaults
  }
  try {
    return SettingsSchema.parse(JSON.parse(raw));
  } catch (e) {
    console.error(`[mirror] ${path} is not valid JSON, using defaults:`, (e as Error).message);
    return DEFAULT_SETTINGS;
  }
}

const feedCache = new Map<string, { body: string; expiresAt: number }>();

async function readCapped(r: Response, maxBytes: number): Promise<string> {
  const reader = r.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error(`feed larger than ${maxBytes} bytes`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function getFeed(url: string): Promise<string | null> {
  const hit = feedCache.get(url);
  if (hit && hit.expiresAt > Date.now()) return hit.body;
  try {
    const r = await fetch(url, { headers: { "User-Agent": FEED_UA }, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const body = await readCapped(r, FEED_MAX_BYTES);
    feedCache.set(url, { body, expiresAt: Date.now() + FEED_TTL_MS });
    return body;
  } catch (e) {
    console.warn(`[mirror] feed ${url} failed: ${(e as Error).message}`);
    return hit?.body ?? null; // stale beats nothing
  }
}

function send(res: ServerResponse, status: number, body: string, type = "application/json; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

type Next = (err?: unknown) => void;

export function createApi(configPath: string) {
  return async function api(req: IncomingMessage, res: ServerResponse, next: Next) {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    if (!pathname.startsWith("/api/")) return next();
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, '{"error":"method not allowed"}');

    try {
      const config = await loadConfig(configPath);

      if (pathname === "/api/config") return send(res, 200, JSON.stringify(config));

      if (pathname === "/api/indices") {
        const quotes = await Promise.all(config.markets.indices.map((ix) => getIndexQuote(ix.symbol)));
        return send(res, 200, JSON.stringify(quotes.filter(Boolean)));
      }

      const feed = /^\/api\/feed\/(\d{1,2})$/.exec(pathname);
      if (feed) {
        const entry = config.news.feeds[Number(feed[1])];
        if (!entry) return send(res, 404, '{"error":"no such feed"}');
        const body = await getFeed(entry.url);
        if (body == null) return send(res, 502, '{"error":"feed unavailable"}');
        return send(res, 200, body, "application/xml; charset=utf-8");
      }

      return send(res, 404, '{"error":"not found"}');
    } catch (e) {
      console.error("[mirror] api error", e);
      return send(res, 500, '{"error":"internal error"}');
    }
  };
}
