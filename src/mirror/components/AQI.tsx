import { aqiInfo } from "../weatherIcons";
import { WeatherData } from "../useWeather";

export function AQI({ data }: { data: WeatherData | null }) {
  if (!data || data.aqi == null) return null;
  const info = aqiInfo(data.aqi);
  return (
    <div className="mt-3 text-right fade-in-text">
      <span className="label-xs">Air Quality </span>
      <span
        className="light"
        style={{ color: `hsl(var(${info.tokenVar}))`, fontWeight: 300 }}
      >
        {data.aqi} · {info.label}
      </span>
    </div>
  );
}
