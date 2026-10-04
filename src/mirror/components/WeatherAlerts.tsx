import { CloudRain, Flame, Snowflake, Sun, Wind, type LucideIcon } from "lucide-react";
import type { Settings } from "../config";
import type { WeatherData } from "../useWeather";

type Alert = { id: string; label: string; Icon: LucideIcon };

// Derived from the forecast, not an official warning service.
function deriveAlerts(current: WeatherData["current"], units: Settings["units"]): Alert[] {
  const imperial = units === "imperial";
  const alerts: Alert[] = [];
  const { apparent, precipProb, uv, windSpeed } = current;

  if (apparent != null && apparent >= (imperial ? 100 : 38)) alerts.push({ id: "heat", label: "Extreme heat", Icon: Flame });
  else if (apparent != null && apparent <= (imperial ? 32 : 0)) alerts.push({ id: "cold", label: "Freezing", Icon: Snowflake });
  if (precipProb != null && precipProb >= 70) alerts.push({ id: "rain", label: "Rain likely", Icon: CloudRain });
  if (uv != null && uv >= 8) alerts.push({ id: "uv", label: "Very high UV", Icon: Sun });
  if (windSpeed != null && windSpeed >= (imperial ? 25 : 40)) alerts.push({ id: "wind", label: "Strong wind", Icon: Wind });

  return alerts.slice(0, 3);
}

export function WeatherAlerts({ current, units }: { current: WeatherData["current"]; units: Settings["units"] }) {
  const alerts = deriveAlerts(current, units);
  if (alerts.length === 0) return null;
  return (
    <ul className="mt-[0.9rem] flex flex-wrap justify-end gap-[0.5rem]">
      {alerts.map(({ id, label, Icon }) => (
        <li
          key={id}
          className="inline-flex items-center gap-[0.4em] rounded-full border border-white/20 px-[0.7em] py-[0.25em] text-bright"
          style={{ fontSize: "0.95rem" }}
        >
          <Icon size="1em" strokeWidth={1.5} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
