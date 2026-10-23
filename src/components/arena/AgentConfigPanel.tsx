import { useState } from "react";
import { Algorithm, IMPLEMENTED_ALGORITHMS } from "@/types/Algorithm";
import {
    ACTIVATIONS,
    AgentConfig,
    MAX_HIDDEN_LAYERS,
    MAX_HIDDEN_UNITS,
    MIN_HIDDEN_UNITS,
    usesNetwork,
    usesSearchDepth,
} from "@/types/AgentConfig";
import type { AgentMode } from "./Game";
import { Panel } from "./panels";

const fieldClass =
    "w-full rounded-md border border-border bg-panel px-3 py-2 text-sm outline-none transition focus:border-info focus:ring-1 focus:ring-info/40 disabled:opacity-50";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

function NumberField({
    label,
    hint,
    value,
    onChange,
    min,
    max,
    step,
    disabled,
}: {
    label: string;
    hint?: string;
    value: number;
    onChange: (n: number) => void;
    min: number;
    max: number;
    step: number;
    disabled?: boolean;
}) {
    return (
        <label className="block">
            <span className={labelClass}>{label}</span>
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={fieldClass}
            />
            {hint ? <span className="mt-1 block text-[11px] leading-snug text-muted-foreground/70">{hint}</span> : null}
        </label>
    );
}

/** Editor for the hidden-layer stack: how many layers, and units in each. */
function HiddenLayers({
    layers,
    onChange,
    disabled,
}: {
    layers: number[];
    onChange: (l: number[]) => void;
    disabled?: boolean;
}) {
    const setCount = (n: number) => {
        const next = layers.slice(0, n);
        while (next.length < n) next.push(next[next.length - 1] ?? 64);
        onChange(next);
    };
    return (
        <div>
            <span className={labelClass}>Hidden layers</span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={disabled || layers.length <= 1}
                    onClick={() => setCount(layers.length - 1)}
                    className="h-9 w-9 shrink-0 rounded-md border border-border bg-panel text-sm font-bold transition hover:border-info disabled:opacity-40"
                    aria-label="Remove a hidden layer"
                >
                    −
                </button>
                <div className="flex min-w-0 flex-1 gap-1.5">
                    {layers.map((units, i) => (
                        <input
                            key={i}
                            type="number"
                            min={MIN_HIDDEN_UNITS}
                            max={MAX_HIDDEN_UNITS}
                            step={1}
                            disabled={disabled}
                            value={units}
                            onChange={(e) => {
                                const next = [...layers];
                                next[i] = Number(e.target.value);
                                onChange(next);
                            }}
                            className="min-w-0 flex-1 rounded-md border border-border bg-panel px-2 py-2 text-center text-sm outline-none transition focus:border-info disabled:opacity-50"
                            aria-label={`Units in hidden layer ${i + 1}`}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    disabled={disabled || layers.length >= MAX_HIDDEN_LAYERS}
                    onClick={() => setCount(layers.length + 1)}
                    className="h-9 w-9 shrink-0 rounded-md border border-border bg-panel text-sm font-bold transition hover:border-info disabled:opacity-40"
                    aria-label="Add a hidden layer"
                >
                    +
                </button>
            </div>
            <span className="mt-1 block text-[11px] leading-snug text-muted-foreground/70">
                54 inputs → {layers.join(" → ")} → 1. Changing this starts a separate network; the old
                weights are kept and come back if you switch the shape back.
            </span>
        </div>
    );
}

function AgentFields({
    algorithm,
    setAlgorithm,
    mode,
    setMode,
    config,
    setConfig,
    locked,
}: {
    algorithm: Algorithm;
    setAlgorithm: (a: Algorithm) => void;
    mode: AgentMode;
    setMode: (m: AgentMode) => void;
    config: AgentConfig;
    setConfig: (c: AgentConfig) => void;
    locked: boolean;
}) {
    const patch = (p: Partial<AgentConfig>) => setConfig({ ...config, ...p });
    const hasNet = usesNetwork(algorithm);
    const training = mode === 0;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <label className="block">
                    <span className={labelClass}>Agent</span>
                    <select
                        disabled={locked}
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                        className={fieldClass}
                    >
                        {IMPLEMENTED_ALGORITHMS.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block">
                    <span className={labelClass}>Mode</span>
                    <select
                        disabled={locked || !hasNet}
                        value={mode}
                        onChange={(e) => setMode(Number(e.target.value) as AgentMode)}
                        className={fieldClass}
                    >
                        <option value={0}>Training</option>
                        <option value={1}>Playing</option>
                    </select>
                </label>
            </div>

            {!hasNet ? (
                <p className="rounded-md border border-border/60 bg-panel/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    {algorithm} has no value network, so it has nothing to learn. Only its search depth
                    applies, and its panel will show results rather than learning curves.
                </p>
            ) : null}

            {usesSearchDepth(algorithm) ? (
                <NumberField
                    label="Search depth (plies)"
                    hint="1 picks greedily. 2 is a few hundred ms per move. 3 is much stronger but noticeably slower."
                    value={config.searchDepth}
                    onChange={(n) => patch({ searchDepth: n })}
                    min={1}
                    max={4}
                    step={1}
                    disabled={locked}
                />
            ) : null}

            {hasNet ? (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <NumberField
                            label="Learning rate α"
                            value={config.alpha}
                            onChange={(n) => patch({ alpha: n })}
                            min={0}
                            max={1}
                            step={0.001}
                            disabled={locked || !training}
                        />
                        <NumberField
                            label="Final α"
                            value={config.alphaFinal}
                            onChange={(n) => patch({ alphaFinal: n })}
                            min={0}
                            max={1}
                            step={0.001}
                            disabled={locked || !training}
                        />
                    </div>
                    <span className="-mt-2 block text-[11px] leading-snug text-muted-foreground/70">
                        α decays linearly from the first episode to the last. Set both the same for no decay.
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                        <NumberField
                            label="Discount γ"
                            value={config.gamma}
                            onChange={(n) => patch({ gamma: n })}
                            min={0}
                            max={1}
                            step={0.01}
                            disabled={locked || !training}
                        />
                        <NumberField
                            label="Lambda λ"
                            hint="0 = TD(0). 1 credits the whole episode (close to Monte Carlo)."
                            value={config.lambda}
                            onChange={(n) => patch({ lambda: n })}
                            min={0}
                            max={1}
                            step={0.05}
                            disabled={locked || !training}
                        />
                    </div>

                    <NumberField
                        label="Epsilon ε"
                        hint="Exploration while training. Playing agents are always greedy."
                        value={config.epsilon}
                        onChange={(n) => patch({ epsilon: n })}
                        min={0}
                        max={1}
                        step={0.01}
                        disabled={locked || !training}
                    />

                    <label className="block">
                        <span className={labelClass}>Activation</span>
                        <select
                            disabled={locked}
                            value={config.activation}
                            onChange={(e) => patch({ activation: e.target.value as AgentConfig["activation"] })}
                            className={fieldClass}
                        >
                            {ACTIVATIONS.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>
                        {config.activation !== "relu" ? (
                            <span className="mt-1 block text-[11px] leading-snug text-muted-foreground/70">
                                Dead-unit tracking only means something for ReLU, so it is reported as n/a here.
                            </span>
                        ) : null}
                    </label>

                    <HiddenLayers layers={config.hiddenLayers} onChange={(l) => patch({ hiddenLayers: l })} disabled={locked} />
                </>
            ) : null}
        </div>
    );
}

export function AgentConfigPanel({
    locked,
    whiteAlgorithm,
    blackAlgorithm,
    setWhiteAlgorithm,
    setBlackAlgorithm,
    whiteMode,
    blackMode,
    setWhiteMode,
    setBlackMode,
    whiteConfig,
    blackConfig,
    setWhiteConfig,
    setBlackConfig,
}: {
    locked: boolean;
    whiteAlgorithm: Algorithm;
    blackAlgorithm: Algorithm;
    setWhiteAlgorithm: (a: Algorithm) => void;
    setBlackAlgorithm: (a: Algorithm) => void;
    whiteMode: AgentMode;
    blackMode: AgentMode;
    setWhiteMode: (m: AgentMode) => void;
    setBlackMode: (m: AgentMode) => void;
    whiteConfig: AgentConfig;
    blackConfig: AgentConfig;
    setWhiteConfig: (c: AgentConfig) => void;
    setBlackConfig: (c: AgentConfig) => void;
}) {
    const [side, setSide] = useState<"white" | "black">("white");
    const isWhite = side === "white";

    return (
        <Panel title="Agent Configuration">
            <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-panel/70 p-1">
                    {(["white", "black"] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setSide(s)}
                            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition ${
                                side === s
                                    ? "bg-info/15 text-info shadow-[0_0_14px_hsl(var(--info)/0.25)]"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full border ${
                                    s === "white" ? "border-border bg-piece-white" : "border-muted-foreground bg-piece-black"
                                }`}
                            />
                            {s}
                        </button>
                    ))}
                </div>

                {locked ? (
                    <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                        Locked while a session is running. Changing settings mid-run would split it across two
                        configurations. Reset to edit.
                    </p>
                ) : null}

                {isWhite ? (
                    <AgentFields
                        algorithm={whiteAlgorithm}
                        setAlgorithm={setWhiteAlgorithm}
                        mode={whiteMode}
                        setMode={setWhiteMode}
                        config={whiteConfig}
                        setConfig={setWhiteConfig}
                        locked={locked}
                    />
                ) : (
                    <AgentFields
                        algorithm={blackAlgorithm}
                        setAlgorithm={setBlackAlgorithm}
                        mode={blackMode}
                        setMode={setBlackMode}
                        config={blackConfig}
                        setConfig={setBlackConfig}
                        locked={locked}
                    />
                )}
            </div>
        </Panel>
    );
}
