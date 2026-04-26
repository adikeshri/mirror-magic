import { WeatherData } from "../useWeather";
import { weatherInfo } from "../weatherIcons";

export function Weather({ data, unit }: { data: WeatherData | null; unit: "fahrenheit" | "celsius" }) {
  if (!data) {
    return <div className="text-faint label-xs">Loading weather…</div>;
  }
  const { Icon, label } = weatherInfo(data.current.code, data.current.isDay);
  const u = unit === "fahrenheit" ? "°F" : "°C";

  return (
    <div className="flex items-start gap-4 justify-end fade-in-text">
      <Icon className="text-bright" size={64} strokeWidth={1} />
      <div className="text-right">
        <div className="thin text-bright leading-none" style={{ fontSize: "4.5rem" }}>
          {data.current.temp}
          <span className="text-dim">{u}</span>
        </div>
        <div className="text-normal light text-lg mt-1">{label}</div>
        {data.city && <div className="label-xs mt-1">{data.city}</div>}
      </div>
    </div>
  );
}
