import { Circle } from "lucide-react";

// Visual only: no calendar source is wired up, so nothing renders until one
// supplies events. Kept so a future source has a ready-made view.
export type CalendarEvent = {
  uid: string;
  title: string;
  start: Date;
  allDay: boolean;
  isReminder: boolean;
};

function relativeDay(d: Date, locale?: string) {
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / 86_400_000);
  if (days >= 0 && days < 2) return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
  if (days < 7) return d.toLocaleDateString(locale, { weekday: "long" });
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export function Calendar({ events, locale }: { events: CalendarEvent[]; locale?: string }) {
  const upcoming = events.filter((e) => !e.isReminder).slice(0, 5);
  const reminders = events.filter((e) => e.isReminder).slice(0, 5);
  if (upcoming.length === 0 && reminders.length === 0) return null;

  return (
    <div style={{ fontSize: "1.2rem" }}>
      {upcoming.length > 0 && (
        <ul className="space-y-[0.3rem]">
          {upcoming.map((e) => (
            <li key={e.uid} className="grid grid-cols-[7em_1fr] gap-[0.8em]">
              <span className="text-dim capitalize">{relativeDay(e.start, locale)}</span>
              <span>
                <span className="text-bright">{e.title}</span>{" "}
                <span className="text-faint" style={{ fontSize: "0.85em" }}>
                  {e.allDay ? "all day" : e.start.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {reminders.length > 0 && (
        <ul className="mt-[0.8rem] space-y-[0.3rem]">
          {reminders.map((e) => (
            <li key={e.uid} className="flex items-center gap-[0.5em] text-normal">
              <Circle size="0.6em" strokeWidth={1.5} className="text-dim" aria-hidden />
              {e.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
