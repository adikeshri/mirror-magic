import type { Settings } from "./config";
import type { WeatherData } from "./useWeather";

// One short, actionable line from the current weather and air quality, or null.
// First match wins, most disruptive first. Derived from the forecast, not an official warning.
export function nudgeFor(data: WeatherData, units: Settings["units"]): string | null {
  const imperial = units === "imperial";
  const { apparent, precipProb, uv, windSpeed, isDay } = data.current;
  const { aqi } = data;

  if (precipProb != null && precipProb >= 70) return "Rain's likely, take an umbrella.";
  if (apparent != null && apparent >= (imperial ? 100 : 38)) return "It's scorching out, stay hydrated.";
  if (aqi != null && aqi > 150) return "The air's unhealthy today, wear a mask outside.";
  if (uv != null && isDay && uv >= 8) return "UV is very high, wear sunscreen.";
  if (windSpeed != null && windSpeed >= (imperial ? 25 : 40)) return "It's windy out there, secure loose items.";
  if (apparent != null && apparent <= (imperial ? 32 : 0)) return "It's freezing, bundle up.";
  if (aqi != null && aqi > 100) return "The air's a bit poor, limit time outside.";
  return null;
}
