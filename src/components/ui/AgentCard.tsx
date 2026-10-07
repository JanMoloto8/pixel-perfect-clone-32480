import { Bot } from "lucide-react";

export function AgentCard({
    side,
    name,
    algorithm,
    mode,
    color,
}: {
    side: string;
    name: string;
    algorithm: string;
    mode: "Training" | "Playing";
    color: "W" | "B";
}) {
    return (
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border bg-secondary/40 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-background">
                <Bot
                    className={`h-8 w-8 ${color === "W" ? "text-piece-white" : "text-muted-foreground"}`}
                />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {side}
                </p>
                <p className="truncate font-display text-xl font-bold">{name}</p>
                <p className="text-xs text-muted-foreground">Algorithm: {algorithm}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    Mode:
                    <span
                        className={`agent-mode-indicator ${mode === "Playing" ? "agent-mode-playing" : "agent-mode-training"}`}
                    >
                        {mode}
                    </span>
                </p>
            </div>
            <span
                className={`h-5 w-5 shrink-0 rounded-full border ${
                    color === "W"
                        ? "border-border bg-piece-white"
                        : "border-muted-foreground bg-piece-black"
                }`}
            />
        </div>
    );
}
