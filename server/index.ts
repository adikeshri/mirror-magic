// Production server: serves the built mirror (dist/) and forwards /api to Mira.
//   npm run build && npm start
// Env: PORT (8080), HOST (127.0.0.1), MIRA_URL (http://127.0.0.1:5080)
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { createMiraProxy, MIRA_URL } from "./proxy.ts";

const PORT = Number(process.env.PORT ?? 8080);
// Loopback by default: the mirror's own browser is the only client it needs.
const HOST = process.env.HOST ?? "127.0.0.1";
const DIST = resolve(import.meta.dirname, "../dist");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self' data:",
    "img-src 'self' data:",
    "connect-src 'self'", // the browser only talks to this server, which forwards /api to Mira
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function serveStatic(pathname: string, res: ServerResponse) {
  let file = resolve(DIST, "." + pathname);
  if (file !== DIST && !file.startsWith(DIST + sep)) {
    res.statusCode = 403;
    return res.end();
  }
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) file = join(DIST, "index.html"); // single-page app
  const hashed = file.startsWith(join(DIST, "assets") + sep);
  res.setHeader("Content-Type", MIME[extname(file)] ?? "application/octet-stream");
  res.setHeader("Cache-Control", hashed ? "public, max-age=31536000, immutable" : "no-cache");
  createReadStream(file)
    .on("error", () => {
      res.statusCode = 404;
      res.end("Not found. Did you run `npm run build`?");
    })
    .pipe(res);
}

const api = createMiraProxy();

const server = createServer((req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.statusCode = 400;
    return res.end();
  }
  api(req, res, () => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      return res.end();
    }
    serveStatic(pathname, res).catch(() => {
      res.statusCode = 500;
      res.end();
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[mirror] http://${HOST.includes(":") ? `[${HOST}]` : HOST}:${PORT}  (mira: ${MIRA_URL})`);
});

for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => server.close(() => process.exit(0)));
