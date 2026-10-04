import { MapPin } from "lucide-react";
import type { Settings } from "../config";
import type { WeatherData } from "../useWeather";
import { weatherInfo } from "../weatherIcons";
import { AQI } from "./AQI";
import { SunTimes } from "./SunTimes";
import { WeatherAlerts } from "./WeatherAlerts";

type Props = {
  data: WeatherData | undefined;
  place: string | null;
  locationError: string | null;
  units: Settings["units"];
  hour24: boolean;
  locale?: string;
};

export function Weather({ data, place, locationError, units, hour24, locale }: Props) {
  if (!data) {
    return (
      <p className="max-w-[18rem] text-right text-faint" style={{ fontSize: "1.1rem" }}>
        {locationError ? "No location yet. Set one in settings (Shift + S) or config.json." : "Loading weather…"}
      </p>
    );
  }
  const { current, today } = data;
  const { Icon, label } = weatherInfo(current.code, current.isDay);
  const unit = units === "imperial" ? "°F" : "°C";

  return (
    <div className="flex flex-col items-end text-right">
      {place && (
        <div className="label inline-flex items-center gap-[0.4em]">
          <MapPin size="1.1em" strokeWidth={1.5} aria-hidden />
          {place}
        </div>
      )}
      <div className="flex items-center gap-[1.2rem] leading-none">
        <Icon size="4.6rem" strokeWidth={0.9} className="text-bright" aria-hidden />
        <span className="text-bright tabular-nums" style={{ fontSize: "6.5rem", fontWeight: 100 }}>
          {current.temp}
          <span className="text-dim" style={{ fontSize: "0.45em", fontWeight: 300, verticalAlign: "0.9em" }}>
            {unit}
          </span>
        </span>
      </div>
      <div className="mt-[0.4rem] text-normal" style={{ fontSize: "1.7rem", fontWeight: 300 }}>
        {label}
      </div>
      <div className="mt-[0.3rem] text-dim tabular-nums" style={{ fontSize: "1.15rem" }}>
        {current.apparent != null && <>Feels {current.apparent}° · </>}
        <span className="text-normal">↑ {today.high}°</span> <span>↓ {today.low}°</span>
      </div>
      <div className="mt-[0.6rem] flex flex-wrap justify-end gap-x-[1.2rem] gap-y-[0.3rem]" style={{ fontSize: "1.05rem" }}>
        {data.aqi != null && <AQI aqi={data.aqi} />}
        <SunTimes sunrise={today.sunrise} sunset={today.sunset} hour24={hour24} locale={locale} />
      </div>
      <WeatherAlerts current={current} units={units} />
    </div>
  );
}
