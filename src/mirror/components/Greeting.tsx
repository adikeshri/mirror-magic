function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ now, name }: { now: Date; name: string }) {
  return (
    <p className="text-normal" style={{ fontSize: "2.4rem", fontWeight: 100 }}>
      {greetingFor(now.getHours())}
      {name && (
        <>
          , <span className="text-bright" style={{ fontWeight: 300 }}>{name}</span>
        </>
      )}
    </p>
  );
}
