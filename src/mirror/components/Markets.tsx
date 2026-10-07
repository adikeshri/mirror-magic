import type { MarketRow } from "../useMarkets";

function formatValue(value: number, currency: string | null, locale?: string) {
  const digits = value >= 1000 ? 0 : 2;
  return value.toLocaleString(locale, {
    ...(currency ? { style: "currency", currency, currencyDisplay: "narrowSymbol" } : {}),
    minimumFractionDigits: currency ? digits : 2,
    maximumFractionDigits: currency ? digits : 2,
  });
}

function Change({ pct, invert }: { pct: number | null; invert?: boolean }) {
  if (pct == null) return null;
  const signed = invert ? -pct : pct;
  const tone = signed > 0.05 ? "text-up" : signed < -0.05 ? "text-down" : "text-dim";
  const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "";
  return (
    <span className={`t-meta ${tone}`}>
      {arrow} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

function Sparkline({ values, invert }: { values?: number[]; invert?: boolean }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 28).toFixed(1)},${(9 - ((v - min) / span) * 8).toFixed(1)}`);
  const rise = (values[values.length - 1] - values[0]) * (invert ? -1 : 1);
  return (
    <svg width="28" height="10" viewBox="0 0 28 10" className={rise >= 0 ? "text-up" : "text-down"} style={{ display: "block" }}>
      <polyline className="draw" pathLength={1} points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Markets({ rows, locale }: { rows: MarketRow[]; locale?: string }) {
  return (
    <table className="t-quiet border-separate border-spacing-y-[0.35rem] tabular-nums">
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.key} className="rise" style={{ animationDelay: `${600 + i * 90}ms` }}>
            <th scope="row" className="pr-[1.2rem] text-left text-dim" style={{ fontWeight: 300 }}>
              {r.label}
            </th>
            <td key={r.quote?.value} className="flash pr-[0.9rem] text-right text-bright">
              {r.quote ? formatValue(r.quote.value, r.currency, locale) : "—"}
            </td>
            <td className="pr-[0.9rem]">
              <Sparkline values={r.quote?.trend} invert={r.invertColor} />
            </td>
            <td className="text-right">
              <Change pct={r.quote?.changePct ?? null} invert={r.invertColor} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
