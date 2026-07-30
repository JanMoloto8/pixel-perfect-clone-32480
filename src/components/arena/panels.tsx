import type { ReactNode } from "react";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-card">
      <h2 className="border-b border-border bg-panel-header px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-info">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export function Row({
  label,
  value,
  icon,
  last,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-sm ${
        last ? "" : "border-b border-border/60"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
        <span className="truncate text-muted-foreground">{label}</span>
      </div>
      <div className="shrink-0 font-medium">{value}</div>
    </div>
  );
}

export function Disc({ color }: { color: "W" | "B" }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full border ${
        color === "W" ? "border-border bg-piece-white" : "border-muted-foreground bg-piece-black"
      }`}
    />
  );
}