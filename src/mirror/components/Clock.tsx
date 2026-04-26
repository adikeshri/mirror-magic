import { useClock } from "../useClock";

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
}

export function Clock({ use24h }: { use24h: boolean }) {
  const now = useClock();
  let hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  if (!use24h) {
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }
  const mins = now.getMinutes().toString().padStart(2, "0");

  const dateLine = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="leading-none">
      <div className="thin text-bright" style={{ fontSize: "8rem", lineHeight: 1 }}>
        {use24h ? hours.toString().padStart(2, "0") : hours}
        <span className="blink mx-1">:</span>
        {mins}
        {!use24h && (
          <span className="light text-dim ml-3" style={{ fontSize: "2rem" }}>
            {ampm}
          </span>
        )}
      </div>
      <div className="text-normal light text-xl mt-2">{dateLine}</div>
      <div className="label-xs mt-1">Week {getWeekNumber(now)}</div>
    </div>
  );
}
