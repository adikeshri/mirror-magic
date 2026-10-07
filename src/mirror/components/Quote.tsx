import { QUOTES } from "../quotes";
import { useRotation } from "../useRotation";

const ROTATE_MS = 60_000;

export function Quote() {
  const i = useRotation(QUOTES.length, ROTATE_MS, true);
  const q = QUOTES[i];
  return (
    <figure key={i} className="fade-in">
      <blockquote className="t-text text-normal">
        “{q.text}”
      </blockquote>
      <figcaption className="t-meta mt-[0.4rem] text-faint">
        {q.author}
      </figcaption>
    </figure>
  );
}
