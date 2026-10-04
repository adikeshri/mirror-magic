import { aqiInfo } from "../weatherIcons";

export function AQI({ aqi }: { aqi: number }) {
  const { label, color } = aqiInfo(aqi);
  return (
    <span className="inline-flex items-center gap-[0.45em]">
      <span aria-hidden className="inline-block size-[0.55em] rounded-full" style={{ background: `hsl(var(${color}))` }} />
      <span className="text-dim">AQI</span>
      <span className="text-normal tabular-nums">{aqi}</span>
      <span className="text-dim">{label}</span>
    </span>
  );
}
