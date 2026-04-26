import { useEffect, useState } from "react";
import { Coords, Settings } from "./types";

export type WeatherData = {
  current: {
    temp: number;
    code: number;
    isDay: boolean;
    sunrise: string;
    sunset: string;
  };
  daily: { date: string; high: number; low: number; code: number }[];
  aqi: number | null;
  city: string | null;
};

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: {
        "Accept-Language": "en",
      },
    });
    const j = await r.json();
    const city =
      j?.address?.city ??
      j?.address?.town ??
      j?.address?.village ??
      j?.address?.hamlet ??
      j?.address?.county ??
      null;
    const state = j?.address?.state ?? null;

    if (!city && !state) return null;
    if (city && state) return `${city}, ${state}`;
    return city ?? state;
  } catch {
    return null;
  }
}

export function useWeather(coords: Coords | null, settings: Settings) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    const load = async () => {
      const unit = settings.unit;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=${unit}&timezone=auto&forecast_days=6`;
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi`;
      try {
        const [w, a] = await Promise.all([fetch(url).then((r) => r.json()), fetch(aqiUrl).then((r) => r.json()).catch(() => null)]);
        const city = coords.city ?? (await reverseGeocode(coords.lat, coords.lon));
        if (cancelled) return;
        setData({
          current: {
            temp: Math.round(w.current.temperature_2m),
            code: w.current.weather_code,
            isDay: !!w.current.is_day,
            sunrise: w.daily.sunrise[0],
            sunset: w.daily.sunset[0],
          },
          daily: w.daily.time.slice(1, 6).map((d: string, i: number) => ({
            date: d,
            high: Math.round(w.daily.temperature_2m_max[i + 1]),
            low: Math.round(w.daily.temperature_2m_min[i + 1]),
            code: w.daily.weather_code[i + 1],
          })),
          aqi: a?.current?.us_aqi ?? null,
          city,
        });
      } catch (e) {
        console.error("[mirror] weather load failed", e);
      }
    };

    load();
    const id = setInterval(load, 1000 * 60 * 10);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [coords, settings.unit]);

  return data;
}
