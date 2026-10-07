import { nextFit } from "./useFitToScreen";

describe("nextFit", () => {
  it("leaves a layout that already fits alone", () => expect(nextFit(1, 1000, 1000)).toBe(1));
  it("shrinks in proportion to the overflow, with a little margin", () => {
    const f = nextFit(1, 1000, 1250);
    expect(f).toBeCloseTo(0.8 * 0.99, 5);
  });
  it("compounds from the current scale", () => expect(nextFit(0.9, 1000, 1010)).toBeLessThan(0.9));
  it("never goes below the floor", () => expect(nextFit(1, 1000, 5000)).toBe(0.55));
  it("ignores an empty measurement", () => expect(nextFit(1, 1000, 0)).toBe(1));
});
