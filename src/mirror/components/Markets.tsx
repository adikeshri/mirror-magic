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
    <span className={tone} style={{ fontSize: "0.8em" }}>
      {arrow} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

export function Markets({ rows, locale }: { rows: MarketRow[]; locale?: string }) {
  return (
    <table className="border-separate border-spacing-y-[0.3rem] tabular-nums" style={{ fontSize: "1.2rem" }}>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            <th scope="row" className="pr-[1.2rem] text-left text-dim" style={{ fontWeight: 300 }}>
              {r.label}
            </th>
            <td className="pr-[0.9rem] text-right text-bright">{r.quote ? formatValue(r.quote.value, r.currency, locale) : "—"}</td>
            <td className="text-right">
              <Change pct={r.quote?.changePct ?? null} invert={r.invertColor} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
