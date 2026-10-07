import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WeatherAlerts } from "./WeatherAlerts";
import { Weather } from "./Weather";
import type { WeatherData } from "../useWeather";

const calm: WeatherData["current"] = { temp: 22, apparent: 24, humidity: 60, windSpeed: 10, uv: 3, precipProb: 10, code: 1, isDay: true };
const data = (current: WeatherData["current"]): WeatherData => ({
  current,
  today: { high: 29, low: 21, sunrise: "2026-10-07T06:08", sunset: "2026-10-07T18:05" },
  daily: [],
  aqi: 92,
});
const labels = (html: string) => [...html.matchAll(/<li[^>]*>.*?<\/svg>([^<]+)<\/li>/g)].map((m) => m[1]);

describe("weather alert pills", () => {
  it("shows nothing on a calm day", () => expect(renderToStaticMarkup(<WeatherAlerts current={calm} units="metric" />)).toBe(""));

  it("shows a pill per condition", () => {
    const html = renderToStaticMarkup(<WeatherAlerts current={{ ...calm, precipProb: 85, uv: 9, windSpeed: 50 }} units="metric" />);
    expect(labels(html)).toEqual(["Rain likely", "Very high UV", "Strong wind"]);
  });

  it("covers heat and freezing, with imperial thresholds", () => {
    expect(labels(renderToStaticMarkup(<WeatherAlerts current={{ ...calm, apparent: 40 }} units="metric" />))).toEqual(["Extreme heat"]);
    expect(labels(renderToStaticMarkup(<WeatherAlerts current={{ ...calm, apparent: -3 }} units="metric" />))).toEqual(["Freezing"]);
    expect(labels(renderToStaticMarkup(<WeatherAlerts current={{ ...calm, apparent: 40 }} units="imperial" />))).toEqual([]); // 40 °F is not extreme heat
  });

  it("is still part of the weather block", () => {
    const html = renderToStaticMarkup(
      <Weather data={data({ ...calm, precipProb: 90 })} place="Bangalore" locationError={null} units="metric" hour24={false} />,
    );
    expect(html).toContain("Rain likely");
  });

  it("keeps AQI and sunrise/sunset on separate lines", () => {
    const html = renderToStaticMarkup(<Weather data={data(calm)} place={null} locationError={null} units="metric" hour24={false} />);
    const block = html.slice(html.indexOf("t-meta"));
    expect(block).toContain("flex-col"); // stacked, not one wrapping row
    expect(block).toContain("AQI");
  });
});
