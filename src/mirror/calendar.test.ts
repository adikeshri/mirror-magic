import { expect, test } from "vitest";
import type { CalendarEvent } from "./components/Calendar";
import { statusOf } from "./useCalendar";

test("events are past, in progress or upcoming by the current time; all-day is always in progress", () => {
  const at = (h: number, m = 0) => new Date(2026, 9, 7, h, m);
  const ev = (start: Date, end: Date, allDay = false): CalendarEvent => ({ title: "x", calendar: "c", start, end, allDay, source: 0 });
  const meeting = ev(at(10), at(11));
  expect(statusOf(meeting, at(9, 59))).toBe("upcoming");
  expect(statusOf(meeting, at(10))).toBe("now");
  expect(statusOf(meeting, at(10, 59))).toBe("now");
  expect(statusOf(meeting, at(11))).toBe("past"); // ends exactly at 11:00
  expect(statusOf(ev(at(0), at(23), true), at(15))).toBe("now");
});
