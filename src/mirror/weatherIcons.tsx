import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  Moon,
  Sun,
  CloudSun,
} from "lucide-react";

// Open-Meteo WMO weather code → icon + label
export function weatherInfo(code: number, isDay = true) {
  const Day = isDay ? Sun : Moon;
  const PartlyCloudy = isDay ? CloudSun : Cloud;

  if (code === 0) return { Icon: Day, label: isDay ? "Clear" : "Clear Night" };
  if (code === 1) return { Icon: Day, label: "Mostly Clear" };
  if (code === 2) return { Icon: PartlyCloudy, label: "Partly Cloudy" };
  if (code === 3) return { Icon: Cloudy, label: "Overcast" };
  if (code === 45 || code === 48) return { Icon: CloudFog, label: "Fog" };
  if (code >= 51 && code <= 57) return { Icon: CloudDrizzle, label: "Drizzle" };
  if (code >= 61 && code <= 67) return { Icon: CloudRain, label: "Rain" };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: "Snow" };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, label: "Showers" };
  if (code >= 85 && code <= 86) return { Icon: CloudSnow, label: "Snow Showers" };
  if (code >= 95) return { Icon: CloudLightning, label: "Thunderstorm" };
  return { Icon: Cloud, label: "—" };
}

export function aqiInfo(aqi: number): { label: string; tokenVar: string } {
  if (aqi <= 50) return { label: "Good", tokenVar: "--aqi-good" };
  if (aqi <= 100) return { label: "Moderate", tokenVar: "--aqi-moderate" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", tokenVar: "--aqi-unhealthy-sensitive" };
  if (aqi <= 200) return { label: "Unhealthy", tokenVar: "--aqi-unhealthy" };
  if (aqi <= 300) return { label: "Very Unhealthy", tokenVar: "--aqi-very-unhealthy" };
  return { label: "Hazardous", tokenVar: "--aqi-hazardous" };
}
