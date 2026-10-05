import { nudgeFor } from "./nudge";
import type { WeatherData } from "./useWeather";

const base = (c: Partial<WeatherData["current"]> = {}, aqi: number | null = 40) =>
  ({
    current: { temp: 24, apparent: 24, humidity: 50, windSpeed: 5, uv: 3, precipProb: 10, code: 1, isDay: true, ...c },
    aqi,
  }) as WeatherData;

describe("nudgeFor", () => {
  it("is quiet on a calm day", () => expect(nudgeFor(base(), "metric")).toBeNull());
  it("prefers rain over everything else", () => {
    expect(nudgeFor(base({ precipProb: 90, uv: 10 }, 200), "metric")).toMatch(/umbrella/);
  });
  it("only warns about UV in daylight", () => {
    expect(nudgeFor(base({ uv: 10 }), "metric")).toMatch(/sunscreen/);
    expect(nudgeFor(base({ uv: 10, isDay: false }), "metric")).toBeNull();
  });
  it("tiers air quality", () => {
    expect(nudgeFor(base({}, 120), "metric")).toMatch(/limit/);
    expect(nudgeFor(base({}, 180), "metric")).toMatch(/mask/);
  });
  it("respects units", () => {
    expect(nudgeFor(base({ apparent: 100 }), "imperial")).toMatch(/hydrated/);
    expect(nudgeFor(base({ apparent: 100 }), "metric")).toMatch(/hydrated/);
    expect(nudgeFor(base({ apparent: 50 }), "imperial")).toBeNull();
  });
});
