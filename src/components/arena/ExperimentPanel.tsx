/*
 * Experiment configuration UI + dashboard.
 *
 * Lets the user configure an experiment (runs, episodes, hyperparams, opponents),
 * start it, watch progress, and download results as a ZIP.
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useExperiment, bestRunResult } from "@/hooks/useExperiment";
import type { ExperimentConfig, TrainOpponent, EvalOpponent, RunResult, Checkpoint } from "@/rl/experiment";
import { DEFAULT_EXPERIMENT_CONFIG, trainingStatsToCsv, evalCheckpointsToCsv } from "@/rl/experiment";
import { ACTIVATIONS, type ActivationName } from "@/types/AgentConfig";
import { Brain, Trash2, X } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    type SavedArchitecture,
    saveWeightsToLocalStorage,
    listSavedArchitectures,
    deleteSavedArchitecture,
} from "./savedArchitectures";

/* ------------------------------------------------------------------ */
/*  Config form                                                       */
/* ------------------------------------------------------------------ */

const EVAL_OPPONENT_OPTIONS: { value: EvalOpponent; label: string }[] = [
    { value: "random", label: "Random" },
    { value: "ab1", label: "Minimax d1" },
    { value: "ab2", label: "Minimax d2" },
    { value: "ab3", label: "Minimax d3" },
];

const TRAIN_OPPONENT_OPTIONS: { value: TrainOpponent; label: string }[] = [
    { value: "self", label: "Self-play" },
    { value: "random", label: "Random" },
    { value: "ab1", label: "Minimax d1" },
    { value: "ab2", label: "Minimax d2" },
    { value: "ab3", label: "Minimax d3" },
];

function ConfigForm({
    config,
    onUpdate,
    locked,
}: {
    config: ExperimentConfig;
    onUpdate: (partial: Partial<ExperimentConfig>) => void;
    locked: boolean;
}) {
    const numField = (
        key: keyof ExperimentConfig,
        label: string,
        opts?: { min?: number; max?: number; step?: number },
    ) => (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input
                type="number"
                disabled={locked}
                value={config[key] as number}
                min={opts?.min}
                max={opts?.max}
                step={opts?.step ?? 1}
                onChange={(e) => onUpdate({ [key]: +e.target.value })}
                className="h-8 text-sm"
            />
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Experiment identity */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                    disabled={locked}
                    value={config.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="h-8 text-sm"
                />
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-2">
                {numField("runs", "Runs", { min: 1, max: 100 })}
                {numField("totalEpisodes", "Episodes per run", { min: 10, max: 100000 })}
                {numField("evalInterval", "Eval interval", { min: 1, max: 10000 })}
                {numField("evalGames", "Eval games", { min: 10, max: 1000 })}
            </div>

            {/* Opponents */}
            <div className="space-y-2">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Train opponent</Label>
                    <Select
                        disabled={locked}
                        value={config.trainOpponent}
                        onValueChange={(v) => onUpdate({ trainOpponent: v as TrainOpponent })}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TRAIN_OPPONENT_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Eval opponents</Label>
                    <div className="flex flex-wrap gap-2">
                        {EVAL_OPPONENT_OPTIONS.map((o) => {
                            const checked = config.evalOpponents.includes(o.value);
                            return (
                                <label key={o.value} className="flex items-center gap-1 text-xs">
                                    <Checkbox
                                        disabled={locked}
                                        checked={checked}
                                        onCheckedChange={(v) => {
                                            const next = v
                                                ? [...config.evalOpponents, o.value]
                                                : config.evalOpponents.filter((x) => x !== o.value);
                                            onUpdate({ evalOpponents: next });
                                        }}
                                    />
                                    {o.label}
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Learner algorithm */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Learner algorithm</Label>
                <Select
                    disabled={locked}
                    value={config.learnerAlgorithm}
                    onValueChange={(v) => onUpdate({ learnerAlgorithm: v as "TD" | "TD_SEARCH" })}
                >
                    <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TD">TD (greedy)</SelectItem>
                        <SelectItem value="TD_SEARCH">TD + Minimax (search)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {config.learnerAlgorithm === "TD_SEARCH" &&
                numField("searchDepth", "Search depth", { min: 1, max: 4 })}

            {/* Network architecture */}
            <div className="space-y-2">
                <Label className="text-xs font-medium">Network</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Hidden layers</Label>
                        <Input
                            disabled={locked}
                            value={config.hiddenLayers.join(",")}
                            onChange={(e) => {
                                const layers = e.target.value
                                    .split(",")
                                    .map((s) => parseInt(s.trim(), 10))
                                    .filter((n) => !isNaN(n) && n > 0);
                                if (layers.length > 0) onUpdate({ hiddenLayers: layers });
                            }}
                            className="h-8 text-sm"
                            placeholder="64,64"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Activation</Label>
                        <Select
                            disabled={locked}
                            value={config.activation}
                            onValueChange={(v) => onUpdate({ activation: v as ActivationName })}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ACTIVATIONS.map((a) => (
                                    <SelectItem key={a} value={a}>
                                        {a}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Hyperparameters */}
            <div className="space-y-2">
                <Label className="text-xs font-medium">Hyperparameters</Label>
                <div className="grid grid-cols-2 gap-2">
                    {numField("alpha", "α (initial)", { min: 0, max: 1, step: 0.001 })}
                    {numField("alphaFinal", "α (final)", { min: 0, max: 1, step: 0.001 })}
                    {numField("gamma", "γ", { min: 0, max: 1, step: 0.01 })}
                    {numField("lambda", "λ", { min: 0, max: 1, step: 0.01 })}
                    {numField("epsilon", "ε (initial)", { min: 0, max: 1, step: 0.01 })}
                    {numField("epsilonFinal", "ε (final)", { min: 0, max: 1, step: 0.01 })}
                    {numField("captureReward", "Capture reward", { min: 0, max: 1, step: 0.01 })}
                    {numField("seed", "Base seed", { min: 0 })}
                </div>
            </div>

            {numField("randomOpening", "Random opening plies", { min: 0, max: 20 })}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Progress display                                                  */
/* ------------------------------------------------------------------ */

function ProgressDisplay({
    status,
    progress,
    config,
    errors,
}: {
    status: string;
    progress: ReturnType<typeof useExperiment>["progress"];
    config: ExperimentConfig;
    errors: string[];
}) {
    const pct = progress ? Math.round(progress.overallProgress * 100) : 0;
    const runLabel = progress
        ? `Run ${progress.run + 1}/${config.runs} — Episode ${progress.episode}/${config.totalEpisodes}`
        : "";
    const phaseLabel = progress?.phase === "evaluating" ? "Evaluating…" : "Training…";

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{runLabel}</span>
                <Badge variant={status === "running" ? "default" : "secondary"}>
                    {status === "running" ? phaseLabel : status}
                </Badge>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{pct}%</p>
            {errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((e, i) => (
                        <p key={i} className="text-xs text-destructive">
                            {e}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Results dashboard                                                 */
/* ------------------------------------------------------------------ */

const CHART_COLORS = [
    "oklch(0.65 0.2 250)", // blue
    "oklch(0.65 0.2 150)", // green
    "oklch(0.65 0.2 25)",  // orange
    "oklch(0.65 0.2 330)", // pink
    "oklch(0.65 0.2 60)",  // yellow
];

function EvalScoreChart({ runs }: { runs: RunResult[] }) {
    if (runs.length === 0) return null;

    // Build data: one row per checkpoint, with global episode numbering.
    // Each run's checkpoints are offset by the total episodes of prior runs.
    const allOpponents = runs[0].config.evalOpponents;
    const epsPerRun = runs[0].config.totalEpisodes;

    const data: Record<string, number>[] = [];
    runs.forEach((run, ri) => {
        const offset = ri * epsPerRun;
        for (const cp of run.checkpoints) {
            const row: Record<string, number> = { episode: cp.episode + offset };
            for (const opp of allOpponents) {
                const key = runs.length > 1 ? `R${ri + 1} vs ${opp}` : `vs ${opp}`;
                row[key] = cp.evalResults[opp]?.score ?? 0;
            }
            const avgKey = runs.length > 1 ? `R${ri + 1} avg` : "avg";
            row[avgKey] = cp.avgScore;
            data.push(row);
        }
    });

    // Derive line keys
    const lineKeys: string[] = [];
    runs.forEach((_, ri) => {
        const avgKey = runs.length > 1 ? `R${ri + 1} avg` : "avg";
        lineKeys.push(avgKey);
    });

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="episode" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {lineKeys.map((key, i) => (
                        <Line
                            key={key}
                            dataKey={key}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function TrainingChart({ runs }: { runs: RunResult[] }) {
    if (runs.length === 0) return null;

    // Show mean |TD| for each run with global episode numbering.
    // Each run's episodes are offset by the total episodes of prior runs.
    const epsPerRun = runs[0].config.totalEpisodes;
    const data: Record<string, number>[] = [];
    runs.forEach((run, ri) => {
        const offset = ri * epsPerRun;
        run.trainingStats.forEach((stat) => {
            const row: Record<string, number> = { episode: stat.episode + offset };
            row[`R${ri + 1} |δ|`] = stat.mean_abs_td;
            data.push(row);
        });
    });

    // Downsample if too many points
    const maxPoints = 300;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    const sampled = step === 1 ? data : data.filter((_, i) => i % step === 0 || i === data.length - 1);

    const lineKeys = runs.map((_, ri) => `R${ri + 1} |δ|`);

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampled}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="episode" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {lineKeys.map((key, i) => (
                        <Line
                            key={key}
                            dataKey={key}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={1.5}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function CheckpointTable({ checkpoints, opponents }: { checkpoints: Checkpoint[]; opponents: string[] }) {
    return (
        <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b text-muted-foreground">
                        <th className="px-2 py-1 text-left">Episode</th>
                        {opponents.map((o) => (
                            <th key={o} className="px-2 py-1 text-right">
                                vs {o}
                            </th>
                        ))}
                        <th className="px-2 py-1 text-right font-bold">Avg</th>
                    </tr>
                </thead>
                <tbody>
                    {checkpoints.map((cp) => (
                        <tr key={cp.episode} className="border-b border-border/50">
                            <td className="px-2 py-1">{cp.episode}</td>
                            {opponents.map((o) => (
                                <td key={o} className="px-2 py-1 text-right tabular-nums">
                                    {cp.evalResults[o]
                                        ? `${cp.evalResults[o].score.toFixed(3)} (${cp.evalResults[o].wins}W/${cp.evalResults[o].draws}D/${cp.evalResults[o].losses}L)`
                                        : "—"}
                                </td>
                            ))}
                            <td className="px-2 py-1 text-right font-bold tabular-nums">
                                {cp.avgScore.toFixed(3)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RunSummary({ run }: { run: RunResult }) {
    return (
        <Card>
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                    Run {run.runIndex + 1} — seed {run.seed}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <span className="text-muted-foreground">Best score</span>
                        <p className="font-mono font-bold">{run.bestScore.toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Episodes</span>
                        <p className="font-mono">{run.trainingStats.length}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Time</span>
                        <p className="font-mono">{(run.elapsedMs / 1000).toFixed(0)}s</p>
                    </div>
                </div>
                <CheckpointTable
                    checkpoints={run.checkpoints}
                    opponents={run.config.evalOpponents}
                />
            </CardContent>
        </Card>
    );
}

function ResultsDashboard({ runs }: { runs: RunResult[] }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (runs.length === 0) return null;

    const best = bestRunResult(runs);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Results</h3>
                {best && (
                    <Badge variant="outline" className="text-xs">
                        Best: Run {best.runIndex + 1} ({best.bestScore.toFixed(3)})
                    </Badge>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-7">
                    <TabsTrigger value="overview" className="text-xs px-2 h-6">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="training" className="text-xs px-2 h-6">
                        Training
                    </TabsTrigger>
                    {runs.map((_, i) => (
                        <TabsTrigger key={i} value={`run-${i}`} className="text-xs px-2 h-6">
                            Run {i + 1}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview" className="mt-2 space-y-3">
                    <EvalScoreChart runs={runs} />
                </TabsContent>

                <TabsContent value="training" className="mt-2 space-y-3">
                    <TrainingChart runs={runs} />
                </TabsContent>

                {runs.map((run, i) => (
                    <TabsContent key={i} value={`run-${i}`} className="mt-2">
                        <RunSummary run={run} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Download helpers                                                  */
/* ------------------------------------------------------------------ */

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadJson(data: unknown, filename: string) {
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}

function downloadCsv(csv: string, filename: string) {
    downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

async function downloadAllAsZip(runs: RunResult[], config: ExperimentConfig) {
    // Dynamically import JSZip
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Config
    zip.file("config.json", JSON.stringify(config, null, 2));

    // Per-run files
    for (const run of runs) {
        const dir = `run-${run.runIndex + 1}`;
        zip.file(`${dir}/config.json`, JSON.stringify({ ...config, seed: run.seed }, null, 2));
        zip.file(`${dir}/train.csv`, trainingStatsToCsv(run.trainingStats));
        zip.file(`${dir}/eval.csv`, evalCheckpointsToCsv(run.checkpoints));
        zip.file(`${dir}/weights.json`, JSON.stringify(run.finalWeights));
        zip.file(`${dir}/best-weights.json`, JSON.stringify(run.bestWeights));

        // Checkpoint weights
        for (const cp of run.checkpoints) {
            zip.file(
                `${dir}/checkpoints/ep${cp.episode}-weights.json`,
                JSON.stringify(cp.weights),
            );
        }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${config.name}-results.zip`);
}

/* ------------------------------------------------------------------ */
/*  Saved architectures picker                                        */
/* ------------------------------------------------------------------ */

function ArchitecturePicker({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [archs, setArchs] = useState<SavedArchitecture[]>([]);

    const refresh = useCallback(() => {
        setArchs(listSavedArchitectures());
    }, []);

    useEffect(() => {
        if (open) refresh();
    }, [open, refresh]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Saved Network Architectures
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4 overflow-y-auto">
                    {archs.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Nothing in local storage.
                            <p className="mt-1 text-xs">
                                Run an experiment to train and save a network architecture.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {archs.map((arch) => {
                                const archKey = `${arch.hiddenLayers.join("x")}-${arch.activation}`;
                                return (
                                    <div
                                        key={archKey}
                                        className="flex items-start justify-between gap-2 rounded-md border border-border p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {arch.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                [{arch.hiddenLayers.join(", ")}] · {arch.activation}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {arch.totalEpisodes.toLocaleString()} episodes ({arch.runs} run{arch.runs !== 1 ? "s" : ""})
                                                · best score {arch.bestScore.toFixed(3)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/70">
                                                Saved {new Date(arch.savedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                            onClick={() => {
                                                deleteSavedArchitecture(arch);
                                                refresh();
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                );
                            })}
                            <p className="text-[10px] text-muted-foreground text-center pt-1">
                                These weights are loaded automatically when an arena agent uses a matching architecture.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main panel                                                        */
/* ------------------------------------------------------------------ */

export function ExperimentPanel() {
    const experiment = useExperiment();
    const {
        status,
        config,
        progress,
        completedRuns,
        allResults,
        errors,
        updateConfig,
        start,
        abort,
        reset,
    } = experiment;

    const [pickerOpen, setPickerOpen] = useState(false);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);

    const locked = status === "running";
    const hasResults = completedRuns.length > 0 || (allResults && allResults.length > 0);
    const displayRuns = allResults ?? completedRuns;

    // Auto-save weights to localStorage when experiment completes
    useEffect(() => {
        if (status === "completed" && allResults && allResults.length > 0) {
            const lastRun = allResults[allResults.length - 1];
            const best = bestRunResult(allResults);
            saveWeightsToLocalStorage(
                config,
                lastRun.finalWeights,
                best?.bestScore ?? lastRun.bestScore,
            );
            setSavedMsg(`Weights saved to arena as [${config.hiddenLayers.join(", ")}]-${config.activation}`);
        }
    }, [status, allResults, config]);

    // Clear saved message on reset
    useEffect(() => {
        if (status === "idle") setSavedMsg(null);
    }, [status]);

    return (
        <div className="space-y-4">
            {/* Architecture picker button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                className="w-full flex items-center gap-2"
            >
                <Brain className="h-4 w-4" />
                Saved Architectures
            </Button>
            <ArchitecturePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />

            {/* Configuration */}
            <Card>
                <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center justify-between">
                        Experiment Configuration
                        <Badge variant="outline" className="text-xs font-normal">
                            {config.runs} run{config.runs !== 1 ? "s" : ""} × {config.totalEpisodes} episodes
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <ConfigForm config={config} onUpdate={updateConfig} locked={locked} />
                </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex gap-2">
                {status === "idle" && (
                    <Button onClick={start} size="sm" className="flex-1">
                        Start Experiment
                    </Button>
                )}
                {status === "running" && (
                    <Button onClick={abort} size="sm" variant="destructive" className="flex-1">
                        Abort
                    </Button>
                )}
                {(status === "completed" || status === "aborted" || status === "error") && (
                    <>
                        <Button onClick={reset} size="sm" variant="outline" className="flex-1">
                            New Experiment
                        </Button>
                        <Button onClick={start} size="sm" className="flex-1">
                            Re-run
                        </Button>
                    </>
                )}
            </div>

            {/* Saved weights confirmation */}
            {savedMsg && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                    ✓ {savedMsg}
                </p>
            )}

            {/* Progress */}
            {status === "running" && (
                <ProgressDisplay
                    status={status}
                    progress={progress}
                    config={config}
                    errors={errors}
                />
            )}

            {/* Error display for non-running states */}
            {status !== "running" && errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((e, i) => (
                        <p key={i} className="text-xs text-destructive">
                            {e}
                        </p>
                    ))}
                </div>
            )}

            {/* Results */}
            {hasResults && (
                <>
                    <ResultsDashboard runs={displayRuns} />

                    {/* Download buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAllAsZip(displayRuns, config)}
                        >
                            Download All (ZIP)
                        </Button>
                        {displayRuns.map((run, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    downloadCsv(
                                        trainingStatsToCsv(run.trainingStats),
                                        `${config.name}-run${i + 1}-train.csv`,
                                    );
                                }}
                            >
                                Run {i + 1} CSV
                            </Button>
                        ))}
                        {displayRuns.length > 0 && bestRunResult(displayRuns) && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    const best = bestRunResult(displayRuns)!;
                                    downloadJson(
                                        best.bestWeights,
                                        `${config.name}-best-weights.json`,
                                    );
                                }}
                            >
                                Best Weights
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
