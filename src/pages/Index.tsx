import { useSettings } from "@/mirror/useSettings";
import { useGeolocation } from "@/mirror/useGeolocation";
import { useWeather } from "@/mirror/useWeather";
import { useCalendar } from "@/mirror/useCalendar";
import { useNews } from "@/mirror/useNews";
import { Greeting } from "@/mirror/components/Greeting";
import { Clock } from "@/mirror/components/Clock";
import { Weather } from "@/mirror/components/Weather";
import { Forecast } from "@/mirror/components/Forecast";
import { AQI } from "@/mirror/components/AQI";
import { SunTimes } from "@/mirror/components/SunTimes";
import { Calendar } from "@/mirror/components/Calendar";
import { Reminders } from "@/mirror/components/Reminders";
import { Ticker } from "@/mirror/components/Ticker";
import { SettingsPanel } from "@/mirror/components/SettingsPanel";

const Index = () => {
  const { settings, update } = useSettings();
  const { coords } = useGeolocation(settings);
  const weather = useWeather(coords, settings);
  const { events } = useCalendar(settings.icalUrl);
  const headlines = useNews();

  return (
    <main className="min-h-screen w-screen bg-background text-foreground overflow-hidden relative">
      <h1 className="sr-only">Magic Mirror — {settings.name}</h1>

      {/* Top-left column */}
      <section className="absolute top-12 left-12 max-w-md">
        <Greeting name={settings.name} />
        <div className="mt-4">
          <Clock use24h={settings.use24h} />
        </div>
        <Calendar events={events} />
        <Reminders events={events} />
      </section>

      {/* Top-right column */}
      <section className="absolute top-12 right-12 max-w-sm">
        <Weather data={weather} unit={settings.unit} />
        <AQI data={weather} />
        <SunTimes data={weather} />
        <Forecast data={weather} />
      </section>

      {/* Bottom-center ticker */}
      <section className="absolute bottom-12 left-0 right-0 flex justify-center">
        <Ticker headlines={headlines} />
      </section>

      <SettingsPanel settings={settings} onChange={update} />
    </main>
  );
};

export default Index;
