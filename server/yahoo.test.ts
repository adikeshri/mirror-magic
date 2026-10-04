import { describe, expect, it } from "vitest";
import { expiryFor } from "./yahoo.ts";

const MIN = 60_000;
// A session from 09:15 to 15:30 on some day, in epoch seconds.
const start = Date.parse("2026-10-05T03:45:00Z") / 1000;
const end = Date.parse("2026-10-05T10:00:00Z") / 1000;
const period = { start, end };

describe("expiryFor", () => {
  it("holds a pre-open quote until the open", () => {
    const now = start * 1000 - 6 * 60 * MIN;
    expect(expiryFor(now, period)).toBe(start * 1000);
  });

  it("refreshes every 5 minutes during the session and just after the close", () => {
    const during = start * 1000 + 60 * MIN;
    expect(expiryFor(during, period)).toBe(during + 5 * MIN);
    const justClosed = end * 1000 + 10 * MIN;
    expect(expiryFor(justClosed, period)).toBe(justClosed + 5 * MIN);
  });

  it("rechecks hourly after the close", () => {
    const evening = end * 1000 + 3 * 60 * MIN;
    expect(expiryFor(evening, period)).toBe(evening + 60 * MIN);
  });

  it("falls back to 5 minutes without session info", () => {
    expect(expiryFor(1000, null)).toBe(1000 + 5 * MIN);
  });
});
