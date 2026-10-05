import { QUOTES } from "../quotes";
import { useRotation } from "../useRotation";

const ROTATE_MS = 60_000;

export function Quote() {
  const i = useRotation(QUOTES.length, ROTATE_MS, true);
  const q = QUOTES[i];
  return (
    <figure key={i} className="fade-in">
      <blockquote className="text-normal" style={{ fontSize: "min(1.15rem, 20px)", lineHeight: 1.45 }}>
        “{q.text}”
      </blockquote>
      <figcaption className="mt-[0.4rem] text-faint" style={{ fontSize: "min(0.95rem, 16.5px)" }}>
        {q.author}
      </figcaption>
    </figure>
  );
}
