import type { NewsItem } from "../useNews";
import { QR } from "./QR";
import { Swap } from "./Swap";
import { useRotation } from "../useRotation";

const ROTATE_MS = 15_000;

function ago(date: Date, locale?: string) {
  const mins = Math.round((date.getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (mins > -60) return rtf.format(Math.min(mins, 0), "minute");
  if (mins > -24 * 60) return rtf.format(Math.round(mins / 60), "hour");
  return rtf.format(Math.round(mins / 1440), "day");
}

export function Headlines({ items, scope, locale }: { items: NewsItem[]; scope: string; locale?: string }) {
  const i = useRotation(items.length, ROTATE_MS);
  const item = items[i];
  return (
    <Swap k={i < 0 ? "loading" : i}>
      {!item ? (
        <p className="text-faint">Loading headlines…</p>
      ) : (
    <div className="flex items-center justify-end gap-[1rem]" aria-live="off">
      <div>
        <p className="t-text line-clamp-2 text-normal">
          {item.title}
        </p>
        <p className="t-meta mt-[0.4rem] text-faint">
          <span className="uppercase tracking-[0.15em]">{scope}</span> · {item.source}
          {item.publishedAt && <> · {ago(item.publishedAt, locale)}</>}
        </p>
      </div>
      {item.url && <QR url={item.url} />}
    </div>
      )}
    </Swap>
  );
}
