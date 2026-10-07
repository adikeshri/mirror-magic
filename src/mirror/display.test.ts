import { isNight, resolveLayout } from "./display";

describe("resolveLayout", () => {
  it("follows the screen when set to auto", () => {
    expect(resolveLayout("auto", true)).toBe("landscape");
    expect(resolveLayout("auto", false)).toBe("portrait");
  });
  it("forces the chosen layout whatever the screen is", () => {
    expect(resolveLayout("portrait", true)).toBe("portrait");
    expect(resolveLayout("landscape", false)).toBe("landscape");
  });
});

describe("isNight", () => {
  const rise = "2026-10-07T06:08";
  const set = "2026-10-07T18:05";
  const at = (hh: number, mm: number) => new Date(2026, 9, 7, hh, mm);

  it("is dark before sunrise, light between, dark from sunset", () => {
    expect(isNight(at(5, 59), rise, set)).toBe(true);
    expect(isNight(at(6, 8), rise, set)).toBe(false); // exactly sunrise is day
    expect(isNight(at(12, 0), rise, set)).toBe(false);
    expect(isNight(at(18, 4), rise, set)).toBe(false);
    expect(isNight(at(18, 5), rise, set)).toBe(true); // exactly sunset is night
    expect(isNight(at(23, 59), rise, set)).toBe(true);
  });
  it("never dims on unusable times", () => {
    expect(isNight(at(2, 0), "", set)).toBe(false);
    expect(isNight(at(2, 0), rise, "not a time")).toBe(false);
  });
});
