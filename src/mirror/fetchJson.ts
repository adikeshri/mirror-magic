// Mira's address. Empty means same origin, which is the case when Mira serves the UI itself;
// set VITE_MIRA_URL at build time (or in dev) when the UI is hosted elsewhere.
const MIRA_URL: string = (import.meta.env.VITE_MIRA_URL ?? "").replace(/\/$/, "");
export const apiUrl = (path: string) => MIRA_URL + path;

// fetch + timeout + status check, so every data hook fails the same way. `path` is a Mira route.
export async function fetchJson<T = unknown>(path: string, timeoutMs = 10_000): Promise<T> {
  const r = await fetch(apiUrl(path), { signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) throw new Error(`${path} HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
