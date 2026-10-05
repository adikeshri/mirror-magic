import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSettings } from "@/mirror/useSettings";
import { useGeolocation } from "@/mirror/useGeolocation";
import { usePlaceName, useWeather } from "@/mirror/useWeather";
import { useMarkets } from "@/mirror/useMarkets";
import { useNews } from "@/mirror/useNews";
import { useOnThisDay } from "@/mirror/useOnThisDay";
import { useNow } from "@/mirror/useClock";
import { Section } from "@/mirror/components/Section";
import { Clock } from "@/mirror/components/Clock";
import { nudgeFor } from "@/mirror/nudge";
import { Greeting } from "@/mirror/components/Greeting";
import { Weather } from "@/mirror/components/Weather";
import { Forecast } from "@/mirror/components/Forecast";
import { Calendar, type CalendarEvent } from "@/mirror/components/Calendar";
import { Markets } from "@/mirror/components/Markets";
import { Headlines } from "@/mirror/components/Headlines";
import { Quote } from "@/mirror/components/Quote";
import { OnThisDay } from "@/mirror/components/OnThisDay";
import { InternetSpeed } from "@/mirror/components/InternetSpeed";
import { SettingsPanel } from "@/mirror/components/SettingsPanel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (n) => Math.min(30_000, 2_000 * 2 ** n),
      refetchOnWindowFocus: false,
      // The mirror is always on screen; keep refreshing even if the tab
      // thinks it's hidden (some kiosk browsers report that).
      refetchIntervalInBackground: true,
    },
  },
});

// No calendar source is wired up yet; the view renders nothing without events.
const NO_EVENTS: CalendarEvent[] = [];

// Hides the cursor after a few seconds without mouse movement.
function useIdle(ms = 3000) {
  const [idle, setIdle] = useState(true);
  useEffect(() => {
    let id: number;
    const wake = () => {
      setIdle(false);
      window.clearTimeout(id);
      id = window.setTimeout(() => setIdle(true), ms);
    };
    window.addEventListener("pointermove", wake);
    return () => {
      window.removeEventListener("pointermove", wake);
      window.clearTimeout(id);
    };
  }, [ms]);
  return idle;
}

function Mirror() {
  const { settings, update, reset, ready } = useSettings();
  const { modules: on, units, hour24 } = settings;
  const locale = settings.locale || undefined;
  const now = useNow(60_000);
  const idle = useIdle();

  const { coords, error: locationError } = useGeolocation(settings.location, settings.autoLocation);
  const weather = useWeather(on.weather || on.forecast ? coords : null, units);
  const place = usePlaceName(on.weather ? coords : null);
  const markets = useMarkets(settings.markets, on.markets);
  const news = useNews(settings.news.feeds, on.news);
  const localNews = useNews(settings.news.local, on.news, settings.news.feeds.length);
  const history = useOnThisDay(now, on.onThisDay);

  useEffect(() => {
    document.title = settings.name ? `Mirror · ${settings.name}` : "Mirror";
  }, [settings.name]);

  // Black until config.json has loaded, so nothing flashes with defaults.
  if (!ready) return null;

  return (
    <main data-idle={idle} className="mirror drift">
      <h1 className="sr-only">Magic mirror</h1>

      <div className="flex flex-col gap-[3.5rem]" style={{ gridArea: "tl" }}>
        {on.clock && (
          <Section>
            <Clock hour24={hour24} locale={locale} />
          </Section>
        )}
        <Calendar events={NO_EVENTS} locale={locale} />
        {on.markets && markets.length > 0 && (
          <Section title="Markets">
            <Markets rows={markets} locale={locale} />
          </Section>
        )}
      </div>

      <div className="flex flex-col items-end gap-[2.5rem]" style={{ gridArea: "tr" }}>
        {on.weather && (
          <Section>
            <Weather data={weather} place={place} locationError={locationError} units={units} hour24={hour24} locale={locale} />
          </Section>
        )}
        {on.forecast && weather && (
          <Section title="Forecast" className="text-right">
            <Forecast daily={weather.daily} locale={locale} />
          </Section>
        )}
        {on.network && (
          <Section>
            <InternetSpeed />
          </Section>
        )}
      </div>

      <div className="max-w-[30rem] self-end" style={{ gridArea: "bl" }}>
        {on.onThisDay && history.length > 0 && (
          <Section title="On this day">
            <OnThisDay events={history} />
          </Section>
        )}
      </div>

      <div className="mx-auto flex max-w-[44rem] flex-col items-center gap-[1.6rem] self-end text-center" style={{ gridArea: "bc" }}>
        {on.greeting && (
          <Section>
            <Greeting now={now} name={settings.name} nudge={weather ? nudgeFor(weather, units) : null} />
          </Section>
        )}
        {on.quote && (
          <Section>
            <Quote />
          </Section>
        )}
      </div>

      <div className="ml-auto max-w-[30rem] self-end text-right" style={{ gridArea: "br" }}>
        {on.news && settings.news.feeds.length + settings.news.local.length > 0 && (
          <Section title="Headlines">
            <div className="flex flex-col gap-[1.4rem]">
              {settings.news.feeds.length > 0 && <Headlines items={news} scope="World" locale={locale} />}
              {settings.news.local.length > 0 && <Headlines items={localNews} scope="Local" locale={locale} />}
            </div>
          </Section>
        )}
      </div>

      <SettingsPanel settings={settings} onChange={update} onReset={reset} />
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Mirror />
    </QueryClientProvider>
  );
}
