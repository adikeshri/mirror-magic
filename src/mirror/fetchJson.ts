// Mira's address. `npm run dev` defaults to a local Mira; a production build defaults to same origin,
// which is the case when Mira serves the UI itself. Set VITE_MIRA_URL when Mira lives elsewhere.
const MIRA_URL: string = (import.meta.env.VITE_MIRA_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:5080" : "")).replace(/\/$/, "");
export const apiUrl = (path: string) => MIRA_URL + path;

// fetch + timeout + status check, so every data hook fails the same way. `path` is a Mira route.
export async function fetchJson<T = unknown>(path: string, timeoutMs = 10_000): Promise<T> {
  const r = await fetch(apiUrl(path), { signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) throw new Error(`${path} HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
