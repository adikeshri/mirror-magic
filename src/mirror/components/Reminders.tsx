import { Circle } from "lucide-react";
import { CalendarEvent } from "../types";

export function Reminders({ events }: { events: CalendarEvent[] }) {
  const reminders = events.filter((e) => e.isReminder).slice(0, 5);
  if (reminders.length === 0) return null;
  return (
    <div className="mt-8 fade-in-text">
      <div className="label-xs mb-3">Reminders</div>
      <ul className="space-y-1.5">
        {reminders.map((e) => (
          <li key={e.uid} className="flex items-center gap-2 light">
            <Circle size={10} strokeWidth={1.5} className="text-dim" />
            <span className="text-normal">{e.title.replace(/\b(todo|reminder)\b|\[reminder\]/gi, "").trim()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
