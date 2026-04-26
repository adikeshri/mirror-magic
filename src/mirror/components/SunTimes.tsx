import { Sunrise, Sunset } from "lucide-react";
import { WeatherData } from "../useWeather";

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function SunTimes({ data }: { data: WeatherData | null }) {
  if (!data) return null;
  return (
    <div className="mt-2 flex justify-end gap-5 text-dim light text-sm">
      <span className="inline-flex items-center gap-1">
        <Sunrise size={16} strokeWidth={1} /> {fmt(data.current.sunrise)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Sunset size={16} strokeWidth={1} /> {fmt(data.current.sunset)}
      </span>
    </div>
  );
}
