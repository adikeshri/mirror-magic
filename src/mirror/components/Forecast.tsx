import { parseLocalDate, type WeatherData } from "../useWeather";
import { weatherInfo } from "../weatherIcons";

export function Forecast({ daily, locale }: { daily: WeatherData["daily"]; locale?: string }) {
  return (
    <table className="ml-auto border-separate border-spacing-x-[1.1rem] border-spacing-y-[0.35rem] text-right tabular-nums" style={{ fontSize: "1.25rem" }}>
      <tbody>
        {daily.map((d, i) => {
          const { Icon, label } = weatherInfo(d.code);
          return (
            // Later days fade out, the classic MagicMirror cue for "less certain".
            <tr key={d.date} className="rise" style={{ opacity: 1 - i * 0.14, animationDelay: `${700 + i * 90}ms` }}>
              <td className="text-dim">{parseLocalDate(d.date).toLocaleDateString(locale, { weekday: "short" })}</td>
              <td>
                <Icon size="1.3em" strokeWidth={1.1} className="inline text-normal" aria-label={label} />
              </td>
              <td className="text-bright">{d.high}°</td>
              <td className="text-faint">{d.low}°</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
