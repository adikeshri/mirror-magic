import { marqueeSeconds, MIN_SECONDS } from "./marquee";

describe("marqueeSeconds", () => {
  it("does not animate text that fits", () => {
    expect(marqueeSeconds(0)).toBe(0);
    expect(marqueeSeconds(-5)).toBe(0);
  });
  it("keeps the rests readable for a small overflow", () => expect(marqueeSeconds(20)).toBe(MIN_SECONDS));
  it("slows down for a long overflow so the speed stays comfortable", () => {
    // 400 px at 36 px/s over 35% of the cycle
    expect(marqueeSeconds(400)).toBeCloseTo(31.7, 1);
  });
  it("scales with the speed", () => expect(marqueeSeconds(400, 72)).toBeLessThan(marqueeSeconds(400, 36)));
});
