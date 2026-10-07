import { formatDistance, formatDuration, traffic, type Commute as Route, type Traffic } from "../useCommute";
import type { Settings } from "../config";

// Laid out like Markets: one line per route, name / live time / distance. The time carries the
// traffic signal against the route's usual: red ▲ slower, green ▼ faster, plain when normal.
const TONE: Record<Traffic, string> = { heavier: "text-down", normal: "text-bright", lighter: "text-up" };
const ARROW: Record<Traffic, string> = { heavier: "▲ ", normal: "", lighter: "▼ " };

export function Commute({ routes, units }: { routes: Route[]; units: Settings["units"] }) {
  return (
    <table className="t-quiet border-separate border-spacing-y-[0.35rem] tabular-nums">
      <tbody>
        {routes.map((r, i) => {
          const t = traffic(r) ?? "normal";
          return (
            <tr key={r.name} className="rise" style={{ animationDelay: `${600 + i * 90}ms` }}>
              <th scope="row" className="pr-[1.2rem] text-left text-dim" style={{ fontWeight: 300 }}>
                {r.name}
              </th>
              <td className={`pr-[0.9rem] text-right ${TONE[t]}`}>
                {ARROW[t]}
                {formatDuration(r.minutes)}
                {t !== "normal" && <span className="sr-only"> ({t} traffic)</span>}
              </td>
              <td className="t-meta text-right text-faint">
                {formatDistance(r.km, units)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
