import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
} from "lucide-react";

// Open-Meteo WMO weather code -> icon + label.
export function weatherInfo(code: number, isDay = true) {
  if (code === 0) return { Icon: isDay ? Sun : Moon, label: "Clear" };
  if (code === 1) return { Icon: isDay ? Sun : Moon, label: "Mostly clear" };
  if (code === 2) return { Icon: isDay ? CloudSun : CloudMoon, label: "Partly cloudy" };
  if (code === 3) return { Icon: Cloudy, label: "Overcast" };
  if (code === 45 || code === 48) return { Icon: CloudFog, label: "Fog" };
  if (code >= 51 && code <= 57) return { Icon: CloudDrizzle, label: "Drizzle" };
  if (code >= 61 && code <= 67) return { Icon: CloudRain, label: "Rain" };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: "Snow" };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, label: "Showers" };
  if (code >= 85 && code <= 86) return { Icon: CloudSnow, label: "Snow showers" };
  if (code >= 95) return { Icon: CloudLightning, label: "Thunderstorm" };
  return { Icon: Cloud, label: "" };
}

// US AQI bands.
export function aqiInfo(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: "Good", color: "--aqi-good" };
  if (aqi <= 100) return { label: "Moderate", color: "--aqi-moderate" };
  if (aqi <= 150) return { label: "Unhealthy for some", color: "--aqi-sensitive" };
  if (aqi <= 200) return { label: "Unhealthy", color: "--aqi-unhealthy" };
  if (aqi <= 300) return { label: "Very unhealthy", color: "--aqi-very-unhealthy" };
  return { label: "Hazardous", color: "--aqi-hazardous" };
}
