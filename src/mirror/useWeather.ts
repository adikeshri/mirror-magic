import { useQuery } from "@tanstack/react-query";
import { Coords, Settings } from "./config";
import { fetchJson, num } from "./fetchJson";

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

type OpenMeteo = {
  current: Record<string, number>;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
};

async function loadWeather(lat: number, lon: number, units: Settings["units"]): Promise<WeatherData> {
  const imperial = units === "imperial";
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,precipitation_probability,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    temperature_unit: imperial ? "fahrenheit" : "celsius",
    wind_speed_unit: imperial ? "mph" : "kmh",
    timezone: "auto",
    forecast_days: "6",
  });
  const aqiParams = new URLSearchParams({ latitude: String(lat), longitude: String(lon), current: "us_aqi" });

  const [w, a] = await Promise.all([
    fetchJson<OpenMeteo>(`https://api.open-meteo.com/v1/forecast?${params}`),
    // AQI is a nice-to-have; never let it sink the forecast.
    fetchJson<{ current?: { us_aqi?: number } }>(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams}`,
    ).catch(() => null),
  ]);

  const c = w.current;
  const d = w.daily;
  const round = (v: unknown) => (num(v) == null ? null : Math.round(v as number));
  return {
    current: {
      temp: Math.round(c.temperature_2m),
      apparent: round(c.apparent_temperature),
      humidity: num(c.relative_humidity_2m),
      windSpeed: num(c.wind_speed_10m),
      uv: num(c.uv_index),
      precipProb: num(c.precipitation_probability),
      code: c.weather_code,
      isDay: !!c.is_day,
    },
    today: {
      high: Math.round(d.temperature_2m_max[0]),
      low: Math.round(d.temperature_2m_min[0]),
      sunrise: d.sunrise[0],
      sunset: d.sunset[0],
    },
    daily: d.time.slice(1).map((date, i) => ({
      date,
      high: Math.round(d.temperature_2m_max[i + 1]),
      low: Math.round(d.temperature_2m_min[i + 1]),
      code: d.weather_code[i + 1],
    })),
    aqi: num(a?.current?.us_aqi),
  };
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

type Nominatim = { address?: Record<string, string> };

// Place name for the coordinates. Nominatim's policy asks for light use, so
// this runs once per location and is cached for a day.
export function usePlaceName(coords: Coords | null) {
  const lat = coords ? Number(coords.lat.toFixed(2)) : null;
  const lon = coords ? Number(coords.lon.toFixed(2)) : null;
  const query = useQuery({
    queryKey: ["place", lat, lon],
    queryFn: async () => {
      const j = await fetchJson<Nominatim>(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=en`,
      );
      const a = j.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.county ?? null;
      return [city, a.state].filter(Boolean).join(", ") || null;
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
