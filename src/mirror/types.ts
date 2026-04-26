export type Settings = {
  name: string;
  icalUrl: string;
  use24h: boolean;
  unit: "fahrenheit" | "celsius";
  manualLat?: number;
  manualLon?: number;
  manualCity?: string;
};

export const DEFAULT_SETTINGS: Settings = {
  name: "Aditya",
  icalUrl: "",
  use24h: false,
  unit: "celsius",
};

export type Coords = { lat: number; lon: number; city?: string };

export type CalendarEvent = {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  isReminder: boolean;
  allDay: boolean;
};
