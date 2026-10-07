import { Check, Circle } from "lucide-react";
import { statusOf, type EventStatus } from "../useCalendar";

// Today's events, as returned by Mira: all-day first, then by start time.
export type CalendarEvent = {
  title: string;
  calendar: string;
  start: Date;
  end: Date;
  allDay: boolean;
  // The calendar's position in Mira's config, which picks its colour.
  source: number;
};

const MAX_EVENTS = 8;

// One hue per calendar, in config order; muted so they sit well on a dark mirror.
const HUES = [210, 35, 150, 330, 270, 60];
const colorOf = (source: number) =>
  `hsl(${HUES[source % HUES.length]} 60% 65%)`;

const TEXT: Record<EventStatus, string> = {
  past: "text-faint line-through",
  now: "text-bright",
  upcoming: "text-normal",
};

function Marker({ status }: { status: EventStatus }) {
  const props = {
    size: "0.7em",
    "aria-hidden": true,
    className:
      status === "now"
        ? "text-bright"
        : status === "past"
          ? "text-faint"
          : "text-dim",
  };
  return status === "past" ? (
    <Check {...props} strokeWidth={2} />
  ) : (
    <Circle
      {...props}
      strokeWidth={1.5}
      fill={status === "now" ? "currentColor" : "none"}
    />
  );
}

// Names of the calendars on screen, in config order. A legend only helps with more than one.
export function CalendarLegend({ events }: { events: CalendarEvent[] }) {
  const legend = [...new Map(events.slice(0, MAX_EVENTS).map((e) => [e.source, e.calendar])).entries()].sort((a, b) => a[0] - b[0]);
  if (legend.length < 2) return null;
  return (
    <ul className="flex flex-wrap gap-x-[1.2em] normal-case tracking-normal text-faint">
      {legend.map(([source, name]) => (
        <li key={source} className="flex items-center gap-[0.5em]">
          <span aria-hidden className="inline-block size-[0.7em] rounded-full" style={{ background: colorOf(source) }} />
          {name}
        </li>
      ))}
    </ul>
  );
}

export function Calendar({
  events,
  now,
  hour24,
  locale,
}: {
  events: CalendarEvent[];
  now: Date;
  hour24: boolean;
  locale?: string;
}) {
  if (events.length === 0) return null;
  const shown = events.slice(0, MAX_EVENTS);
  return (
    <div className="t-body">
      <ul className="space-y-[0.3rem]">
        {shown.map((e) => {
          const status = statusOf(e, now);
          return (
            <li
              key={`${e.source}|${e.title}|${e.start.getTime()}`}
              className="grid grid-cols-[1em_5em_1fr] items-center gap-[0.5em] border-l-[0.2em] pl-[0.6em]"
              style={{ borderLeftColor: colorOf(e.source) }}
            >
              <Marker status={status} />
              <span className={status === "now" ? "text-normal" : "text-dim"}>
                {e.allDay
                  ? "all day"
                  : e.start.toLocaleTimeString(locale, {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: !hour24,
                    })}
              </span>
              <span className={TEXT[status]}>
                {e.title}
                <span className="sr-only">
                  {" "}
                  ({status === "now" ? "in progress" : status})
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
