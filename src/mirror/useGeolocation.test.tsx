import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./useGeolocation";
import type { Coords, Settings } from "./config";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CONFIG: Settings["location"] = { lat: 1, lon: 1, name: "Config" };
const GPS = { coords: { latitude: 2, longitude: 2 } };
const IP = { lat: 3, lon: 3, name: "IP City" };

type Result = ReturnType<typeof useGeolocation>;
let root: Root;
let result: Result;
let geo: { getCurrentPosition: ReturnType<typeof vi.fn> };
let fetchMock: ReturnType<typeof vi.fn>;

function Probe({ location, auto }: { location: Settings["location"]; auto: boolean }): ReactNode {
  result = useGeolocation(location, auto);
  return null;
}

async function mount(location: Settings["location"], auto = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () => {
    root.render(createElement(QueryClientProvider, { client }, createElement(Probe, { location, auto })));
  });
}

// react-query batches its notifications on a zero-delay timer, so give it a few ticks.
const flush = () =>
  act(async () => {
    for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(10);
  });
const coords = (): Coords | null => result.coords;

beforeEach(() => {
  vi.useFakeTimers();
  root = createRoot(document.createElement("div"));
  geo = { getCurrentPosition: vi.fn() };
  Object.defineProperty(navigator, "geolocation", { value: geo, configurable: true });
  fetchMock = vi.fn(async () => new Response(JSON.stringify(IP), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  // jsdom has no AbortSignal.timeout (every real browser does).
  Object.defineProperty(AbortSignal, "timeout", { value: () => new AbortController().signal, configurable: true });
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (AbortSignal as { timeout?: unknown }).timeout;
});

describe("useGeolocation priority", () => {
  it("1. uses config and asks nobody", async () => {
    await mount(CONFIG);
    expect(coords()).toEqual(CONFIG);
    expect(geo.getCurrentPosition).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("2. prefers the browser over IP, and never calls the IP service", async () => {
    geo.getCurrentPosition.mockImplementation((ok) => ok(GPS));
    await mount(null);
    await flush();
    expect(coords()).toEqual({ lat: 2, lon: 2 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("3. falls back to IP when the browser fails", async () => {
    geo.getCurrentPosition.mockImplementation((_ok, fail) => fail({ message: "denied" }));
    await mount(null);
    await flush();
    expect(coords()).toEqual(IP);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/location$/), expect.anything());
  });

  it("falls back to IP when the browser never answers, and a late browser fix wins", async () => {
    let answer: (p: typeof GPS) => void = () => {};
    geo.getCurrentPosition.mockImplementation((ok) => (answer = ok));
    await mount(null);
    await flush();
    expect(coords()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled(); // still being patient

    await act(async () => void (await vi.advanceTimersByTimeAsync(12_100)));
    await flush();
    expect(coords()).toEqual(IP);

    await act(async () => answer(GPS));
    expect(coords()).toEqual({ lat: 2, lon: 2 });
  });

  it("never uses IP when autoLocation is off", async () => {
    geo.getCurrentPosition.mockImplementation((_ok, fail) => fail({ message: "denied" }));
    await mount(null, false);
    await flush();
    await act(async () => void (await vi.advanceTimersByTimeAsync(20_000)));
    expect(coords()).toBeNull();
    expect(result.error).toBe("Location unavailable");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an error when both the browser and IP fail", async () => {
    geo.getCurrentPosition.mockImplementation((_ok, fail) => fail({ message: "denied" }));
    fetchMock.mockImplementation(async () => new Response("{}", { status: 502 }));
    await mount(null);
    await flush();
    await act(async () => void (await vi.advanceTimersByTimeAsync(5_000))); // the hook retries twice
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(coords()).toBeNull();
    expect(result.error).toBe("Location unavailable");
  });
});
