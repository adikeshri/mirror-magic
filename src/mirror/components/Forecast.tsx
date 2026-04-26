import { WeatherData } from "../useWeather";
import { weatherInfo } from "../weatherIcons";

export function Forecast({ data }: { data: WeatherData | null }) {
  if (!data) return null;
  return (
    <div className="mt-6 fade-in-text">
      <div className="label-xs mb-2 text-right">5-Day Forecast</div>
      <div className="space-y-2">
        {data.daily.map((d) => {
          const { Icon } = weatherInfo(d.code, true);
          const day = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" });
          return (
            <div key={d.date} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center text-normal light">
              <span className="text-right text-dim">{day}</span>
              <Icon size={20} strokeWidth={1} className="text-normal" />
              <span className="text-right tabular-nums w-20">
                <span className="text-bright">{d.high}°</span>
                <span className="text-faint"> / {d.low}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
