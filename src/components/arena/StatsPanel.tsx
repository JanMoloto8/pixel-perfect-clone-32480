import { useCallback, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Algorithm } from "@/types/Algorithm";
import { StatsRow, TrainingStatsRow, isTrainingRow } from "@/rl/episodeStats";
import type { AgentMode, Binary } from "./Game";
import { resetStats } from "./Game";
import { Panel } from "./panels";

/** Grab the SVG inside a container, render it on a canvas, and trigger a PNG download. */
function saveSvgAsPng(container: HTMLElement, filename: string): void {
    const svg = container.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // Inline computed styles so the PNG looks the same outside the page.
    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue("--panel").trim() || "#1a1a2e";
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.style.backgroundColor = `oklch(${bg})`;
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
        const scale = 2; // retina-quality
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
            if (!b) return;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.download = filename;
            a.click();
            URL.revokeObjectURL(a.href);
        }, "image/png");
    };
    img.src = url;
}

/** Above this many episodes the charts are thinned out so they stay smooth. */
const MAX_POINTS = 300;

function downsample<T>(rows: T[]): T[] {
    if (rows.length <= MAX_POINTS) return rows;
    const step = Math.ceil(rows.length / MAX_POINTS);
    const out = rows.filter((_, i) => i % step === 0);
    // Always keep the most recent point so the chart's right edge is current.
    if (out[out.length - 1] !== rows[rows.length - 1]) out.push(rows[rows.length - 1]);
    return out;
}

/**
 * `axis: "right"` puts a series on its own scale. Without it a series measured
 * in hundreds (average plies) flattens one measured in fractions (score) into
 * the baseline and you can't read either.
 */
type SeriesSpec = { key: string; label: string; color: string; axis?: "left" | "right" };

function MiniChart({
    title,
    hint,
    data,
    series,
    domain,
    zeroLine,
}: {
    title: string;
    hint?: string;
    data: Record<string, number>[];
    series: SeriesSpec[];
    domain?: [number | "auto", number | "auto"];
    zeroLine?: boolean;
}) {
    const chartRef = useRef<HTMLDivElement>(null);
    const hasRight = series.some((s) => s.axis === "right");
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return (
        <div className="rounded-lg border border-border/70 bg-panel/50 p-3">
            <div className="mb-1 flex items-baseline justify-between gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{title}</h4>
                <div className="flex shrink-0 items-center gap-2">
                    {series.map((s) => (
                        <span key={s.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="h-1.5 w-3 rounded-full" style={{ background: s.color }} />
                            {s.label}
                        </span>
                    ))}
                    <button
                        type="button"
                        title="Save chart as PNG"
                        onClick={() => chartRef.current && saveSvgAsPng(chartRef.current, `${slug}.png`)}
                        className="ml-1 rounded p-0.5 text-muted-foreground/60 transition hover:text-info"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                </div>
            </div>
            <div ref={chartRef} className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                        <XAxis
                            dataKey="episode"
                            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                            stroke="var(--border)"
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                            stroke="var(--border)"
                            tickLine={false}
                            domain={domain ?? ["auto", "auto"]}
                            width={44}
                        />
                        {hasRight ? (
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                                stroke="var(--border)"
                                tickLine={false}
                                width={38}
                            />
                        ) : null}
                        {zeroLine ? <ReferenceLine yAxisId="left" y={0} stroke="var(--border)" strokeWidth={1} /> : null}
                        <Tooltip
                            contentStyle={{
                                background: "var(--panel)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                fontSize: 11,
                            }}
                            labelFormatter={(v) => `Episode ${v}`}
                            formatter={(v: number, name) => [typeof v === "number" ? v.toFixed(4) : v, name]}
                        />
                        {series.map((s) => (
                            <Line
                                key={s.key}
                                yAxisId={s.axis ?? "left"}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color}
                                strokeWidth={1.6}
                                // One or two episodes draw no visible curve, so show the
                                // points instead until there is enough of a line to see.
                                dot={data.length <= 2 ? { r: 2.5, fill: s.color } : false}
                                isAnimationActive={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {hint ? <p className="mt-1 text-[10px] leading-snug text-muted-foreground/70">{hint}</p> : null}
        </div>
    );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | "warn" }) {
    const toneClass =
        tone === "good" ? "text-success" : tone === "bad" ? "text-danger" : tone === "warn" ? "text-warning" : "";
    return (
        <div className="rounded-md border border-border/60 bg-panel/40 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
            <div className={`font-mono text-sm font-semibold ${toneClass}`}>{value}</div>
        </div>
    );
}

function download(name: string, text: string) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

function TrainingCharts({ rows }: { rows: TrainingStatsRow[] }) {
    const data = useMemo(
        () =>
            downsample(rows).map((r) => ({
                episode: r.episode,
                mean_abs_td: r.mean_abs_td,
                mean_grad_norm: r.mean_grad_norm,
                zero_grad_frac: r.zero_grad_frac,
                dead_l1: r.dead[0] ?? 0,
                dead_last: r.dead.length ? r.dead[r.dead.length - 1] : 0,
                v_opening: r.v_opening,
                weight_l2: r.weight_l2,
                learner_score: r.learner_score,
                avg_plies: r.avg_plies,
                alpha: r.alpha,
                epsilon: r.epsilon,
            })),
        // rows is mutated in place by EpisodeStats, so its identity never
        // changes; without rows.length here the charts freeze on episode 1.
        [rows, rows.length],
    );
    const hasDead = rows[rows.length - 1].dead.length > 0;

    return (
        <div className="space-y-2.5">
            <MiniChart
                title="TD error & gradient"
                hint="|TD error| falling means the value function is settling. A flat line means it never converges."
                data={data}
                series={[
                    { key: "mean_abs_td", label: "|TD|", color: "var(--info)" },
                    { key: "mean_grad_norm", label: "|grad|", color: "var(--chart-2)", axis: "right" },
                ]}
            />
            <MiniChart
                title={hasDead ? "Zero gradients & dead units" : "Zero gradients"}
                hint="Both should stay at or near 0. This is the pair that would have caught the original dying-ReLU bug."
                data={data}
                domain={[0, 1]}
                series={
                    hasDead
                        ? [
                              { key: "zero_grad_frac", label: "zero grad", color: "var(--danger)" },
                              { key: "dead_l1", label: "dead L1", color: "var(--warning)" },
                              { key: "dead_last", label: "dead last", color: "var(--mill)" },
                          ]
                        : [{ key: "zero_grad_frac", label: "zero grad", color: "var(--danger)" }]
                }
            />
            <MiniChart
                title="V(opening) & weight norm"
                hint="V(opening) near 0 is right for a fair position. A climbing weight norm means the network is blowing up."
                data={data}
                zeroLine
                series={[
                    { key: "v_opening", label: "V(open)", color: "var(--success)" },
                    { key: "weight_l2", label: "‖w‖", color: "var(--chart-5)", axis: "right" },
                ]}
            />
            <MiniChart
                title="Outcomes"
                hint="Rolling score over the last 20 episodes (left), and average game length (right)."
                data={data}
                domain={[0, 1]}
                series={[
                    { key: "learner_score", label: "score", color: "var(--success)" },
                    { key: "avg_plies", label: "plies", color: "var(--muted-foreground)", axis: "right" },
                ]}
            />
            <MiniChart
                title="Decay schedule"
                hint="Confirms α and ε are actually decaying across the session."
                data={data}
                series={[
                    { key: "alpha", label: "α", color: "var(--info)" },
                    { key: "epsilon", label: "ε", color: "var(--warning)", axis: "right" },
                ]}
            />
        </div>
    );
}

function PlayCharts({ rows }: { rows: StatsRow[] }) {
    const data = useMemo(
        () =>
            downsample(rows).map((r) => ({
                episode: r.episode,
                learner_score: r.learner_score,
                cum_score: r.cum_score,
                avg_plies: r.avg_plies,
            })),
        [rows, rows.length],
    );
    return (
        <div className="space-y-2.5">
            <MiniChart
                title="Score"
                hint="(wins + ½ draws) / games. Rolling over the last 20 episodes, and over the whole session."
                data={data}
                domain={[0, 1]}
                series={[
                    { key: "learner_score", label: "rolling", color: "var(--success)" },
                    { key: "cum_score", label: "overall", color: "var(--info)" },
                ]}
            />
            <MiniChart
                title="Average game length"
                data={data}
                series={[{ key: "avg_plies", label: "plies", color: "var(--muted-foreground)" }]}
            />
        </div>
    );
}

function SideStats({
    side,
    algorithm,
    mode,
    rows,
    onClear,
}: {
    side: "White" | "Black";
    algorithm: Algorithm;
    mode: AgentMode;
    rows: StatsRow[];
    onClear: () => void;
}) {
    if (rows.length === 0) {
        return (
            <p className="rounded-md border border-border/60 bg-panel/50 px-3 py-6 text-center text-xs text-muted-foreground">
                No episodes finished yet. Stats appear here as {side} plays.
            </p>
        );
    }

    const latest = rows[rows.length - 1];
    const training = isTrainingRow(latest);
    const wins = rows.filter((r) => r.result > 0).length;
    const losses = rows.filter((r) => r.result < 0).length;
    const draws = rows.length - wins - losses;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {algorithm} · {mode === 0 ? "training" : "playing"} · {rows.length} episode
                    {rows.length === 1 ? "" : "s"}
                </p>
                <div className="flex shrink-0 gap-1.5">
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-md border border-danger/50 bg-danger/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-danger transition hover:bg-danger/20"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const csv = csvFor(rows);
                            download(`${side.toLowerCase()}-${training ? "training" : "play"}-stats.csv`, csv);
                        }}
                        className="rounded-md border border-info/50 bg-info/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-info transition hover:bg-info/20"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <Metric label="W / D / L" value={`${wins}/${draws}/${losses}`} />
                <Metric label="Score" value={latest.cum_score.toFixed(3)} />
                <Metric label="Avg plies" value={latest.avg_plies.toFixed(1)} />
                {training ? (
                    <>
                        <Metric label="|TD error|" value={latest.mean_abs_td.toFixed(4)} />
                        <Metric label="|grad|" value={latest.mean_grad_norm.toFixed(3)} />
                        <Metric
                            label="Zero grad"
                            value={latest.zero_grad_frac.toFixed(3)}
                            tone={latest.zero_grad_frac > 0.01 ? "bad" : "good"}
                        />
                        <Metric label="Updates/game" value={String(latest.updates_per_game)} />
                        <Metric label="V(opening)" value={latest.v_opening.toFixed(4)} />
                        <Metric label="‖w‖" value={latest.weight_l2.toFixed(2)} />
                        <Metric
                            label="Dead units"
                            value={
                                latest.dead.length
                                    ? latest.dead.map((d) => d.toFixed(2)).join(" / ")
                                    : "n/a"
                            }
                            tone={latest.dead.length && latest.dead.some((d) => d > 0.2) ? "warn" : undefined}
                        />
                        <Metric label="α" value={latest.alpha.toFixed(5)} />
                        <Metric label="ε" value={latest.epsilon.toFixed(3)} />
                        <Metric label="Elapsed" value={`${Math.round(latest.sec)}s`} />
                    </>
                ) : (
                    <>
                        <Metric label="Last result" value={latest.result > 0 ? "win" : latest.result < 0 ? "loss" : "draw"} />
                        <Metric label="Rolling" value={latest.learner_score.toFixed(3)} />
                        <Metric label="Elapsed" value={`${Math.round(latest.sec)}s`} />
                    </>
                )}
            </div>

            {training ? (
                <TrainingCharts rows={rows as TrainingStatsRow[]} />
            ) : (
                <PlayCharts rows={rows} />
            )}
        </div>
    );
}

/** Rebuilds a CSV from rows the panel already holds. */
function csvFor(rows: StatsRow[]): string {
    const first = rows[0];
    if (isTrainingRow(first)) {
        const layers = first.dead.length;
        const head = [
            "episode", "games", "result", "learner_score", "cum_score", "plies", "avg_plies",
            "mean_abs_td", "mean_grad_norm", "zero_grad_frac", "updates_per_game",
            "v_opening", "weight_l2", ...Array.from({ length: layers }, (_, i) => `dead_l${i + 1}`),
            "alpha", "epsilon", "sec",
        ];
        const body = (rows as TrainingStatsRow[]).map((r) =>
            [
                r.episode, r.games, r.result, r.learner_score.toFixed(4), r.cum_score.toFixed(4), r.plies,
                r.avg_plies.toFixed(1), r.mean_abs_td.toFixed(5), r.mean_grad_norm.toFixed(5),
                r.zero_grad_frac.toFixed(4), r.updates_per_game, r.v_opening.toFixed(4), r.weight_l2.toFixed(3),
                ...Array.from({ length: layers }, (_, i) => (r.dead[i] ?? 0).toFixed(3)),
                r.alpha.toFixed(5), r.epsilon.toFixed(3), r.sec.toFixed(0),
            ].join(","),
        );
        return [head.join(","), ...body].join("\n") + "\n";
    }
    const head = ["episode", "games", "result", "learner_score", "cum_score", "plies", "avg_plies", "sec"];
    const body = rows.map((r) =>
        [r.episode, r.games, r.result, r.learner_score.toFixed(4), r.cum_score.toFixed(4), r.plies, r.avg_plies.toFixed(1), r.sec.toFixed(0)].join(","),
    );
    return [head.join(","), ...body].join("\n") + "\n";
}

export function StatsPanel({
    whiteAlgorithm,
    blackAlgorithm,
    whiteMode,
    blackMode,
    whiteStats,
    blackStats,
    onClearStats,
}: {
    whiteAlgorithm: Algorithm;
    blackAlgorithm: Algorithm;
    whiteMode: AgentMode;
    blackMode: AgentMode;
    whiteStats: StatsRow[];
    blackStats: StatsRow[];
    onClearStats: (player: Binary) => void;
}) {
    // Open on whichever side is learning: that is the one worth watching.
    const [side, setSide] = useState<"white" | "black">(whiteMode === 0 ? "white" : blackMode === 0 ? "black" : "white");
    const isWhite = side === "white";

    return (
        <Panel title="Live Statistics">
            <div className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-panel/70 p-1">
                    {(["white", "black"] as const).map((s) => {
                        const mode = s === "white" ? whiteMode : blackMode;
                        const count = (s === "white" ? whiteStats : blackStats).length;
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSide(s)}
                                className={`rounded-md px-2 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition ${
                                    side === s
                                        ? "bg-info/15 text-info shadow-[0_0_14px_hsl(var(--info)/0.25)]"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {s} · {mode === 0 ? "train" : "play"}
                                {count ? ` · ${count}` : ""}
                            </button>
                        );
                    })}
                </div>

                {isWhite ? (
                    <SideStats side="White" algorithm={whiteAlgorithm} mode={whiteMode} rows={whiteStats} onClear={() => onClearStats(0)} />
                ) : (
                    <SideStats side="Black" algorithm={blackAlgorithm} mode={blackMode} rows={blackStats} onClear={() => onClearStats(1)} />
                )}
            </div>
        </Panel>
    );
}
