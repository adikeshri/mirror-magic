import { describe, expect, it } from "vitest";
import { formatDuration, traffic } from "./useCommute";

const route = (minutes: number, typicalMinutes?: number) => ({ name: "Work", minutes, km: 10, typicalMinutes });

describe("traffic", () => {
  it("compares live to typical", () => {
    expect(traffic(route(30, 20))).toBe("heavier");
    expect(traffic(route(20, 30))).toBe("lighter");
    expect(traffic(route(29, 20))).toBe("normal");
    expect(traffic(route(21, 30))).toBe("normal");
  });
  it("is unknown without a typical time", () => {
    expect(traffic(route(30))).toBeNull();
  });
});

describe("formatDuration", () => {
  it("reads naturally", () => {
    expect(formatDuration(25)).toBe("25 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(65)).toBe("1 h 5 min");
    expect(formatDuration(100)).toBe("1 h 40 min");
  });
});
