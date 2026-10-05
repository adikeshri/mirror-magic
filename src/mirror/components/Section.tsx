import { Component, type ReactNode } from "react";

// One module on the mirror. A crash inside a module blanks that module only.
export function Section({ title, className = "", children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={`materialize ${className}`}>
      {title && <h2 className="label">{title}</h2>}
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
