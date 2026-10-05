import type { IncomingMessage, ServerResponse } from "node:http";

// The mirror's only backend is Mira. This forwards /api/* to it so the browser
// stays same-origin (no CORS, and the CSP can allow 'self' only).
export const MIRA_URL = process.env.MIRA_URL ?? "http://127.0.0.1:5080";

type Next = (err?: unknown) => void;

export function createMiraProxy(base = MIRA_URL) {
  return async function proxy(req: IncomingMessage, res: ServerResponse, next: Next) {
    const url = req.url ?? "/";
    if (!url.startsWith("/api/")) return next();
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      return res.end();
    }
    try {
      const r = await fetch(new URL(url, base), { method: req.method, signal: AbortSignal.timeout(60_000) });
      // Responses are small (the largest is the 2.5 MB speed test), so buffering beats streaming.
      const body = Buffer.from(await r.arrayBuffer());
      res.statusCode = r.status;
      res.setHeader("Content-Type", r.headers.get("content-type") ?? "application/octet-stream");
      res.setHeader("Cache-Control", "no-store");
      res.end(req.method === "HEAD" ? undefined : body);
    } catch (e) {
      console.warn(`[mirror] mira at ${base} unreachable: ${(e as Error).message}`);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end('{"error":"mira unavailable"}');
    }
  };
}
