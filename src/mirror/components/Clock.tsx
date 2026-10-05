import { useNow } from "../useClock";

// ISO-8601 week number.
function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((+date - +yearStart) / 86_400_000 + 1) / 7);
}

export function Clock({ hour24, locale }: { hour24: boolean; locale?: string }) {
  const now = useNow(1000);
  const parts = new Intl.DateTimeFormat(locale, {
    hour: hour24 ? "2-digit" : "numeric",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: hour24 ? "h23" : "h12",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const date = now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <time
        dateTime={now.toISOString()}
        className="glow flex items-start leading-none text-bright tabular-nums"
        style={{ fontWeight: 100, fontSize: "7.5rem", letterSpacing: "-0.02em" }}
      >
        {part("hour")}
        <span className="colon">:</span>
        <span key={part("minute")} className="tick-slow">
          {part("minute")}
        </span>
        <span className="ml-[0.15em] mt-[0.12em] flex flex-col text-dim" style={{ fontSize: "0.28em", fontWeight: 300 }}>
          <span key={part("second")} className="tick">
            {part("second")}
          </span>
          {!hour24 && <span className="mt-[0.2em] text-faint">{part("dayPeriod")}</span>}
        </span>
      </time>
      <div className="mt-[0.6rem] text-normal" style={{ fontSize: "1.9rem", fontWeight: 300 }}>
        {date}
      </div>
      <div className="label mt-[0.5rem]">Week {isoWeek(now)}</div>
    </div>
  );
}
