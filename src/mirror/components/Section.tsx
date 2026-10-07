import { Component, type ReactNode } from "react";

// One module on the mirror. A crash inside a module blanks that module only.
export function Section({ title, aside, className = "", children }: { title?: string; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={`materialize ${className}`}>
      {title && (
        <div className="label flex items-baseline gap-[1.4em]">
          <h2>{title}</h2>
          {aside}
        </div>
      )}
      <Boundary>{children}</Boundary>
    </section>
  );
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[mirror] module crashed", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
