// Approximate location from the server's public IP, the last resort for
// mirrors with no configured location and no browser geolocation. City-level at best. Asks a keyless service, which sees
// this machine's IP; set "autoLocation": false in config.json to disable.

export type GeoLocation = { lat: number; lon: number; name: string };

const TTL_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;

type Provider = { url: string; parse: (j: Record<string, unknown>) => GeoLocation | null };

const toNum = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

export function toLocation(j: Record<string, unknown>): GeoLocation | null {
  const lat = toNum(j.latitude);
  const lon = toNum(j.longitude);
  if (lat == null || lon == null || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = [str(j.city), str(j.region)].filter(Boolean).join(", ");
  return { lat, lon, name };
}

const PROVIDERS: Provider[] = [
  {
    url: "https://ipwho.is/?fields=success,latitude,longitude,city,region",
    parse: (j) => (j.success === false ? null : toLocation(j)),
  },
  { url: "https://get.geojs.io/v1/ip/geo.json", parse: toLocation },
];

let cached: { value: GeoLocation | null; expiresAt: number } | null = null;
let inflight: Promise<GeoLocation | null> | null = null;

async function lookup(): Promise<GeoLocation | null> {
  for (const p of PROVIDERS) {
    try {
      const r = await fetch(p.url, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const loc = p.parse((await r.json()) as Record<string, unknown>);
      if (loc) return loc;
    } catch (e) {
      console.warn(`[mirror] ip location via ${new URL(p.url).host} failed: ${(e as Error).message}`);
    }
  }
  return null;
}

export function getIpLocation(): Promise<GeoLocation | null> {
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);
  inflight ??= lookup()
    .then((value) => {
      // A failure is remembered briefly so a dead service isn't hammered.
      cached = { value, expiresAt: Date.now() + (value ? TTL_MS : RETRY_MS) };
      return value;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
