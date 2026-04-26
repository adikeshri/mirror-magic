import { CalendarEvent } from "../types";

function relativeDay(d: Date) {
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((+startOfDay(d) - +startOfDay(now)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "long" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtTime(d: Date, allDay: boolean) {
  if (allDay) return "all day";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function Calendar({ events }: { events: CalendarEvent[] }) {
  const upcoming = events.filter((e) => !e.isReminder).slice(0, 5);

  return (
    <div className="mt-10 fade-in-text">
      <div className="label-xs mb-3">Upcoming</div>
      {upcoming.length === 0 ? (
        <div className="text-faint light text-sm">No upcoming events</div>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((e) => (
            <li key={e.uid} className="grid grid-cols-[5.5rem_1fr] gap-3 light">
              <span className="text-dim text-sm pt-0.5">{relativeDay(e.start)}</span>
              <span>
                <span className="text-bright">{e.title}</span>
                <span className="text-faint text-sm ml-2">{fmtTime(e.start, e.allDay)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
