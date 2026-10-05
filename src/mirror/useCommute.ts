import { useQuery } from "@tanstack/react-query";
import { Coords, Settings } from "./config";
import { fetchJson } from "./fetchJson";

// typicalMinutes is the route's usual drive time; Mira only knows it with a Mapbox token.
export type Commute = { name: string; minutes: number; km: number; typicalMinutes?: number | null };

export type Traffic = "heavier" | "normal" | "lighter";

// 10+ minutes over or under typical is heavier or lighter; anything closer is normal.
export function traffic({ minutes, typicalMinutes }: Commute): Traffic | null {
  if (!typicalMinutes) return null;
  const diff = minutes - typicalMinutes;
  return diff >= 10 ? "heavier" : diff <= -10 ? "lighter" : "normal";
}

const REFRESH_MS = 5 * 60 * 1000;

// Mira times a drive to each destination in its config.json; failed routes come back null and are dropped.
export function useCommute(coords: Coords | null): Commute[] {
  const lat = coords ? Number(coords.lat.toFixed(3)) : null;
  const lon = coords ? Number(coords.lon.toFixed(3)) : null;
  return (
    useQuery({
      queryKey: ["commute", lat, lon],
      queryFn: async () =>
        (await fetchJson<(Commute | null)[]>(`/api/commute?${new URLSearchParams({ lat: String(lat), lon: String(lon) })}`)).filter(
          (c): c is Commute => c != null,
        ),
      enabled: lat != null && lon != null,
      refetchInterval: REFRESH_MS,
      staleTime: REFRESH_MS,
    }).data ?? []
  );
}

// "25 min", "1 h", "1 h 5 min": no zero-padding, and no trailing "0 min" on whole hours.
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatDistance(km: number, units: Settings["units"]) {
  return units === "imperial" ? `${(km * 0.621371).toFixed(1)} mi` : `${km.toFixed(1)} km`;
}
