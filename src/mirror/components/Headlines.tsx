import type { NewsItem } from "../useNews";
import { useRotation } from "../useRotation";

const ROTATE_MS = 15_000;

function ago(date: Date, locale?: string) {
  const mins = Math.round((date.getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (mins > -60) return rtf.format(Math.min(mins, 0), "minute");
  if (mins > -24 * 60) return rtf.format(Math.round(mins / 60), "hour");
  return rtf.format(Math.round(mins / 1440), "day");
}

export function Headlines({ items, locale }: { items: NewsItem[]; locale?: string }) {
  const i = useRotation(items.length, ROTATE_MS);
  if (i < 0) return <p className="text-faint">Loading headlines…</p>;
  const item = items[i];
  return (
    <div key={i} className="fade-in" aria-live="off">
      <p className="line-clamp-3 text-bright" style={{ fontSize: "1.45rem", lineHeight: 1.35 }}>
        {item.title}
      </p>
      <p className="mt-[0.4rem] text-faint" style={{ fontSize: "1rem" }}>
        {item.source}
        {item.publishedAt && <> · {ago(item.publishedAt, locale)}</>}
      </p>
    </div>
  );
}
