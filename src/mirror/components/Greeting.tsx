import { useClock } from "../useClock";

export function Greeting({ name }: { name: string }) {
  const now = useClock();
  const h = now.getHours();
  const greeting =
    h < 5 ? "Still up," : h < 12 ? "Good morning," : h < 18 ? "Good afternoon," : "Good evening,";
  return (
    <div className="text-normal light text-2xl fade-in-text">
      {greeting} <span className="text-bright">{name || "friend"}</span>
    </div>
  );
}
