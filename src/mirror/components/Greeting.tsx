// {name} marks where the name goes; without a name it is dropped along with its comma/space.
const GREETINGS: [untilHour: number, phrases: string[]][] = [
  [5, ["Still up, {name}?", "Hey {name}, can't sleep?", "Burning the midnight oil, {name}?", "Hello, night owl {name}", "Hey {name}, the world is asleep and you're not", "Psst {name}, the stars are out", "Hi {name}, the night is yours", "Late night, huh {name}?", "Hey {name}, the city sleeps but you don't", "Well hello, {name}, night shift today?"]],
  [8, ["Rise and shine, {name}", "Good morning, {name}", "Hey {name}, early bird", "Look who's up, {name}", "Morning, {name}, let's do this", "Top of the morning, {name}", "Hello {name}, fresh day ahead", "Up already, {name}?", "Hey {name}, coffee time", "Morning, {name}, the day is yours"]],
  [12, ["Good morning, {name}", "Morning, {name}, looking sharp", "Hey {name}, great to see you", "Hello {name}, ready to crush it", "Well good morning, {name}", "Bright and early, {name}", "Hi {name}, make it a good one", "Hey {name}, how's the morning going?", "Morning, {name}, you've got this", "Hello {name}, what's on the agenda?"]],
  [14, ["Good afternoon, {name}", "Hey {name}, lunchtime", "Hello {name}, halfway there", "Afternoon, {name}, you're glowing", "Hi {name}, fuel up", "Hey {name}, had lunch yet?", "Hello {name}, midday already", "Well hello, {name}, hungry?", "Hi {name}, take a breather", "Hey {name}, the day's flying by"]],
  [17, ["Good afternoon, {name}", "Hey {name}, keep going", "Hello again, {name}", "Afternoon, {name}, nice momentum", "Hi {name}, you're on a roll", "Well hello, {name}", "Hey {name}, how's the day treating you?", "Hello {name}, home stretch", "Afternoon, {name}, still crushing it", "Hi {name}, almost there"]],
  [21, ["Good evening, {name}", "Hey {name}, great work today", "Evening, {name}, you earned this", "Hello {name}, golden hour", "Hi {name}, time to unwind", "Welcome back, {name}", "Hey {name}, how was your day?", "Evening, {name}, put your feet up", "Hello {name}, dinner time", "Hi {name}, the day is done"]],
  [24, ["Good evening, {name}", "Hey {name}, winding down?", "Hello, night owl {name}", "Evening, {name}, cozy hours", "Hi {name}, sweet dreams soon", "Hey {name}, ready for bed?", "Hello {name}, one more episode?", "Night, {name}, almost bedtime", "Hi {name}, time to recharge", "Evening, {name}, wrap it up"]],
];

// Random per page load, then rotates every 30 minutes (the mirror re-renders every second, so no per-render randomness).
const offset = Math.floor(Math.random() * 1000);

function greetingFor(now: Date) {
  const hour = now.getHours();
  const phrases = GREETINGS.find(([until]) => hour < until)![1];
  const slot = Math.floor(now.getTime() / 1_800_000);
  return phrases[(slot + offset) % phrases.length];
}

export function Greeting({ now, name, nudge }: { now: Date; name: string; nudge?: string | null }) {
  const phrase = greetingFor(now);
  const [before, after] = (name ? phrase : phrase.replace(/,? ?\{name\}/, "")).split("{name}");
  return (
    <div>
      <p key={phrase} className="fade-in text-normal" style={{ fontSize: "2.4rem", fontWeight: 100 }}>
        {before}
        {after !== undefined && <span className="glow text-bright" style={{ fontWeight: 300 }}>{name}</span>}
        {after}
      </p>
      {nudge && (
        <p key={nudge} className="fade-in mt-[0.5rem] text-dim" style={{ fontSize: "1.15rem", fontWeight: 300 }}>
          {nudge}
        </p>
      )}
    </div>
  );
}
