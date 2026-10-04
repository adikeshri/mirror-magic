// fetch + timeout + status check, so every data hook fails the same way.
export async function fetchJson<T = unknown>(url: string, timeoutMs = 10_000): Promise<T> {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) throw new Error(`${new URL(url, location.href).host} HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
