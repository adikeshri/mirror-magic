import { Sunrise, Sunset } from "lucide-react";

export function SunTimes({ sunrise, sunset, hour24, locale }: { sunrise: string; sunset: string; hour24: boolean; locale?: string }) {
  // Open-Meteo returns local wall-clock times ("2026-10-05T06:12") for the location.
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hourCycle: hour24 ? "h23" : "h12" });
  return (
    <span className="inline-flex gap-[1rem] whitespace-nowrap">
      <span className="inline-flex items-center gap-[0.35em] text-dim">
        <Sunrise size="1.1em" strokeWidth={1.25} aria-label="Sunrise" /> {fmt(sunrise)}
      </span>
      <span className="inline-flex items-center gap-[0.35em] text-dim">
        <Sunset size="1.1em" strokeWidth={1.25} aria-label="Sunset" /> {fmt(sunset)}
      </span>
    </span>
  );
}
