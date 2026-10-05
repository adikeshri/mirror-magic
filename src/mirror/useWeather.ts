import { useQuery } from "@tanstack/react-query";
import { Coords, Settings } from "./config";
import { fetchJson } from "./fetchJson";

export type WeatherData = {
  current: {
    temp: number;
    apparent: number | null;
    humidity: number | null;
    windSpeed: number | null;
    uv: number | null;
    precipProb: number | null;
    code: number;
    isDay: boolean;
  };
  today: { high: number; low: number; sunrise: string; sunset: string };
  daily: { date: string; high: number; low: number; code: number }[];
  aqi: number | null;
};

const REFRESH_MS = 10 * 60 * 1000;

// Mira calls Open-Meteo (forecast and air quality) and returns this shape.
function loadWeather(lat: number, lon: number, units: Settings["units"]): Promise<WeatherData> {
  return fetchJson<WeatherData>(`/api/weather?${new URLSearchParams({ lat: String(lat), lon: String(lon), units })}`);
}

export function useWeather(coords: Coords | null, units: Settings["units"]) {
  // ~1 km precision is plenty for weather and keeps the cache key stable.
  const lat = coords ? Number(coords.lat.toFixed(2)) : null;
  const lon = coords ? Number(coords.lon.toFixed(2)) : null;
  return useQuery({
    queryKey: ["weather", lat, lon, units],
    queryFn: () => loadWeather(lat!, lon!, units),
    enabled: lat != null && lon != null,
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
  }).data;
}

// Place name for the coordinates, looked up by Mira. Runs once per location and is cached for a day.
export function usePlaceName(coords: Coords | null) {
  const lat = coords ? Number(coords.lat.toFixed(2)) : null;
  const lon = coords ? Number(coords.lon.toFixed(2)) : null;
  const query = useQuery({
    queryKey: ["place", lat, lon],
    queryFn: async () => {
      const j = await fetchJson<{ name: string | null }>(`/api/places/reverse?lat=${lat}&lon=${lon}`);
      return j.name || null;
    },
    enabled: lat != null && lon != null && !coords?.name,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  return coords?.name || query.data || null;
}

// "2026-10-05" is a calendar date at the forecast location, not a UTC instant.
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}
