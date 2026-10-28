/*
 * Experiment system — pure computation core.
 *
 * ExperimentRunner orchestrates multiple training runs of a TD agent, each
 * with periodic evaluation checkpoints. It is designed to run inside a Web
 * Worker (no DOM, no React) and communicate progress through callbacks.
 *
 * Reuses the existing pure functions:
 *   - playGame() / evaluate() from play.ts
 *   - ValueNet with toJSON()/loadJSON() for snapshots
 *   - TDAgent / SearchTDAgent / AlphaBetaAgent / RandomAgent from agents.ts
 *   - mulberry32() for reproducible RNG
 *   - EpisodeStats for per-episode stat collection
 */

import { mulberry32 } from "./engine";
import { ValueNet, SerializedWeights, ValueNetConfig } from "./valueNet";
import {
    Agent,
    TDAgent,
    TDOptions,
    SearchTDAgent,
    AlphaBetaAgent,
    RandomAgent,
    outcomeFor,
} from "./agents";
import { playGame, evaluate, MatchSummary } from "./play";
import { EpisodeStats, TrainingStatsRow } from "./episodeStats";
import { ActivationName } from "../types/AgentConfig";

/* ------------------------------------------------------------------ */
/*  Configuration                                                     */
/* ------------------------------------------------------------------ */

/** Which opponent to train against. */
export type TrainOpponent = "self" | "random" | "ab1" | "ab2" | "ab3";

/** Which opponents to evaluate against at checkpoints. */
export type EvalOpponent = "random" | "ab1" | "ab2" | "ab3";

/** Full experiment configuration — everything needed to reproduce a run. */
export type ExperimentConfig = {
    /** Human-readable experiment name. */
    name: string;

    /** Number of independent runs (seeds). */
    runs: number;
    /** Total training episodes per run. */
    totalEpisodes: number;
    /** Evaluate every N episodes. */
    evalInterval: number;
    /** Games per evaluation opponent at each checkpoint. */
    evalGames: number;

    /** Who the learner trains against. */
    trainOpponent: TrainOpponent;
    /** Who to evaluate against at checkpoints. */
    evalOpponents: EvalOpponent[];

    /** Learning algorithm: "TD" (greedy) or "TD_SEARCH" (negamax over V). */
    learnerAlgorithm: "TD" | "TD_SEARCH";
    /** Search depth for TD_SEARCH during training (1 = greedy TD). */
    searchDepth: number;

    /** Network architecture. */
    hiddenLayers: number[];
    activation: ActivationName;

    /** TD hyperparameters. */
    alpha: number;
    alphaFinal: number;
    gamma: number;
    lambda: number;
    epsilon: number;
    epsilonFinal: number;
    captureReward: number;

    /** Base seed — run i uses seed + i. */
    seed: number;

    /** Random opening plies (0 = none). */
    randomOpening: number;
};

export const DEFAULT_EXPERIMENT_CONFIG: ExperimentConfig = {
    name: "experiment",
    runs: 3,
    totalEpisodes: 1000,
    evalInterval: 100,
    evalGames: 100,
    trainOpponent: "self",
    evalOpponents: ["random", "ab1", "ab2"],
    learnerAlgorithm: "TD",
    searchDepth: 2,
    hiddenLayers: [64, 64],
    activation: "relu",
    alpha: 0.01,
    alphaFinal: 0.002,
    gamma: 0.99,
    lambda: 0,
    epsilon: 0.1,
    epsilonFinal: 0.01,
    captureReward: 0.05,
    seed: 1,
    randomOpening: 0,
};

/* ------------------------------------------------------------------ */
/*  Checkpoint & result types                                         */
/* ------------------------------------------------------------------ */

/** A snapshot taken at an evaluation checkpoint. */
export type Checkpoint = {
    episode: number;
    weights: SerializedWeights;
    evalResults: Record<string, MatchSummary>;
    /** Aggregate score across all eval opponents: mean of per-opponent scores. */
    avgScore: number;
};

/** Accumulated result for one training run. */
export type RunResult = {
    runIndex: number;
    seed: number;
    config: ExperimentConfig;
    trainingStats: TrainingStatsRow[];
    checkpoints: Checkpoint[];
    finalWeights: SerializedWeights;
    bestWeights: SerializedWeights;
    bestScore: number;
    elapsedMs: number;
};

/* ------------------------------------------------------------------ */
/*  Progress callbacks                                                */
/* ------------------------------------------------------------------ */

export type ExperimentProgress = {
    /** Which run (0-indexed). */
    run: number;
    /** Which episode within the run (1-indexed). */
    episode: number;
    /** "training" or "evaluating". */
    phase: "training" | "evaluating";
    /** Fraction of the entire experiment completed [0, 1]. */
    overallProgress: number;
    /** Latest training stats row, if available. */
    latestTrainingRow?: TrainingStatsRow;
    /** Latest checkpoint, if just completed. */
    latestCheckpoint?: Checkpoint;
};

export type ExperimentCallbacks = {
    onProgress: (p: ExperimentProgress) => void;
    onRunComplete: (result: RunResult) => void;
    onError: (err: string) => void;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function makeOpponent(name: EvalOpponent | TrainOpponent): Agent {
    if (name === "random") return new RandomAgent();
    const m = /^ab(\d)$/.exec(name);
    if (m) return new AlphaBetaAgent(+m[1]);
    throw new Error(`Unknown opponent: ${name}`);
}

function linearDecay(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/* ------------------------------------------------------------------ */
/*  ExperimentRunner                                                  */
/* ------------------------------------------------------------------ */

/**
 * Runs a complete experiment: multiple training runs, each with periodic
 * evaluation and checkpointing. Designed to run synchronously inside a
 * Worker — yields progress through callbacks.
 *
 * Call `run()` to execute. Call `abort()` to request early stop.
 */
export class ExperimentRunner {
    private aborted = false;
    private config: ExperimentConfig;
    private callbacks: ExperimentCallbacks;

    constructor(config: ExperimentConfig, callbacks: ExperimentCallbacks) {
        this.config = config;
        this.callbacks = callbacks;
    }

    abort(): void {
        this.aborted = true;
    }

    /** Execute the full experiment. Returns all run results. */
    run(): RunResult[] {
        const results: RunResult[] = [];
        const { config } = this;
        const totalWork = config.runs * config.totalEpisodes;

        for (let r = 0; r < config.runs; r++) {
            if (this.aborted) break;
            try {
                const result = this.runSingle(r, totalWork);
                results.push(result);
                this.callbacks.onRunComplete(result);
            } catch (err) {
                this.callbacks.onError(
                    `Run ${r + 1} failed: ${err instanceof Error ? err.message : String(err)}`,
                );
            }
        }
        return results;
    }

    /** Execute one training run. */
    private runSingle(runIndex: number, totalWork: number): RunResult {
        const { config } = this;
        const runSeed = config.seed + runIndex;
        const rng = mulberry32(runSeed);
        const evalRng = mulberry32(runSeed + 10000);
        const t0 = Date.now();

        // Create network
        const netConfig: ValueNetConfig = {
            hidden: config.hiddenLayers,
            activation: config.activation,
            seed: runSeed,
        };
        const net = new ValueNet(netConfig);

        // Create TD options
        const tdOpts: TDOptions = {
            alpha: config.alpha,
            gamma: config.gamma,
            epsilon: config.epsilon,
            lambda: config.lambda,
            captureReward: config.captureReward,
            learn: true,
        };

        // Create learner agents — self-play needs two that share the network
        const learnerA = new TDAgent(net, tdOpts, "td-a");
        const learnerB = new TDAgent(net, tdOpts, "td-b");
        const trainOpp: Agent | null =
            config.trainOpponent === "self" ? null : makeOpponent(config.trainOpponent);

        // Evaluation agent: greedy (no exploration, no learning)
        const evalAgent: Agent =
            config.learnerAlgorithm === "TD_SEARCH" && config.searchDepth > 1
                ? new SearchTDAgent(net, config.searchDepth, "eval-agent")
                : new TDAgent(net, { ...tdOpts, epsilon: 0, learn: false }, "eval-agent");

        // Build eval opponents
        const evalOpps = config.evalOpponents.map((name) => ({
            name,
            agent: makeOpponent(name),
        }));

        // Stats tracking
        const stats = new EpisodeStats(true);
        const checkpoints: Checkpoint[] = [];
        let bestWeights = net.toJSON();
        let bestScore = -Infinity;

        // Initial evaluation (episode 0)
        const checkpoint0 = this.runEvaluation(
            0,
            net,
            evalAgent,
            evalOpps,
            evalRng,
            config.evalGames,
        );
        checkpoints.push(checkpoint0);
        if (checkpoint0.avgScore > bestScore) {
            bestScore = checkpoint0.avgScore;
            bestWeights = net.toJSON();
        }

        // Training loop
        for (let ep = 1; ep <= config.totalEpisodes; ep++) {
            if (this.aborted) break;

            // Linear decay
            const t =
                config.totalEpisodes > 1 ? (ep - 1) / (config.totalEpisodes - 1) : 0;
            const alphaNow = linearDecay(config.alpha, config.alphaFinal, t);
            const epsNow = linearDecay(config.epsilon, config.epsilonFinal, t);
            learnerA.opts.alpha = alphaNow;
            learnerA.opts.epsilon = epsNow;
            learnerB.opts.alpha = alphaNow;
            learnerB.opts.epsilon = epsNow;

            // Play one training game
            const learnerWhite = ep % 2 === 1;
            let rec;
            let result: number;
            if (!trainOpp) {
                // Self-play: same network plays both sides
                rec = playGame(learnerA, learnerB, rng, undefined, config.randomOpening);
                result = 0; // self-play is always a draw from "our" perspective
            } else {
                rec = learnerWhite
                    ? playGame(learnerA, trainOpp, rng, undefined, config.randomOpening)
                    : playGame(trainOpp, learnerA, rng, undefined, config.randomOpening);
                result = outcomeFor(rec.final, learnerWhite ? 0 : 1);
            }

            // Collect stats
            const drainedA = learnerA.drainStats();
            const drainedB = learnerB.drainStats();
            // Merge stats from both agents (in self-play both learn)
            const mergedStats = {
                absDelta: [...drainedA.absDelta, ...drainedB.absDelta],
                gradNorm: [...drainedA.gradNorm, ...drainedB.gradNorm],
                values: [...drainedA.values, ...drainedB.values],
            };

            const row = stats.addTraining({
                result,
                plies: rec.plies,
                stats: mergedStats,
                net,
                alpha: alphaNow,
                epsilon: epsNow,
            });

            // Progress
            const completedWork = runIndex * config.totalEpisodes + ep;
            this.callbacks.onProgress({
                run: runIndex,
                episode: ep,
                phase: "training",
                overallProgress: completedWork / totalWork,
                latestTrainingRow: row,
            });

            // Checkpoint evaluation
            if (ep % config.evalInterval === 0 || ep === config.totalEpisodes) {
                this.callbacks.onProgress({
                    run: runIndex,
                    episode: ep,
                    phase: "evaluating",
                    overallProgress: completedWork / totalWork,
                });

                // Temporarily disable learning during eval
                const checkpoint = this.runEvaluation(
                    ep,
                    net,
                    evalAgent,
                    evalOpps,
                    evalRng,
                    config.evalGames,
                );
                checkpoints.push(checkpoint);

                if (checkpoint.avgScore > bestScore) {
                    bestScore = checkpoint.avgScore;
                    bestWeights = net.toJSON();
                }

                this.callbacks.onProgress({
                    run: runIndex,
                    episode: ep,
                    phase: "training",
                    overallProgress: completedWork / totalWork,
                    latestCheckpoint: checkpoint,
                });
            }
        }

        // Clean up traces
        learnerA.dispose();
        learnerB.dispose();

        const result: RunResult = {
            runIndex,
            seed: runSeed,
            config,
            trainingStats: stats.rows as TrainingStatsRow[],
            checkpoints,
            finalWeights: net.toJSON(),
            bestWeights,
            bestScore,
            elapsedMs: Date.now() - t0,
        };

        // Dispose the network
        net.dispose();

        return result;
    }

    /** Run evaluation at a checkpoint against all opponents. */
    private runEvaluation(
        episode: number,
        net: ValueNet,
        evalAgent: Agent,
        evalOpps: { name: string; agent: Agent }[],
        evalRng: () => number,
        evalGames: number,
    ): Checkpoint {
        const evalResults: Record<string, MatchSummary> = {};
        let totalScore = 0;

        for (const { name, agent } of evalOpps) {
            const summary = evaluate(evalAgent, agent, evalGames, evalRng);
            evalResults[name] = summary;
            totalScore += summary.score;
        }

        return {
            episode,
            weights: net.toJSON(),
            evalResults,
            avgScore: evalOpps.length > 0 ? totalScore / evalOpps.length : 0,
        };
    }
}

/* ------------------------------------------------------------------ */
/*  CSV export helpers                                                */
/* ------------------------------------------------------------------ */

/** Convert training stats rows to CSV string. */
export function trainingStatsToCsv(rows: TrainingStatsRow[]): string {
    if (rows.length === 0) return "";
    const layers = rows[0].dead.length;
    const deadCols = Array.from({ length: layers }, (_, i) => `dead_l${i + 1}`);
    const head = [
        "episode", "games", "result", "learner_score", "cum_score", "plies", "avg_plies",
        "mean_abs_td", "mean_grad_norm", "zero_grad_frac", "updates_per_game",
        "v_opening", "weight_l2", ...deadCols, "alpha", "epsilon", "sec",
    ];
    const body = rows.map((r) =>
        [
            r.episode, r.games, r.result, r.learner_score.toFixed(4), r.cum_score.toFixed(4),
            r.plies, r.avg_plies.toFixed(1), r.mean_abs_td.toFixed(5), r.mean_grad_norm.toFixed(5),
            r.zero_grad_frac.toFixed(4), r.updates_per_game, r.v_opening.toFixed(4),
            r.weight_l2.toFixed(3),
            ...Array.from({ length: layers }, (_, i) => (r.dead[i] ?? 0).toFixed(3)),
            r.alpha.toFixed(5), r.epsilon.toFixed(3), r.sec.toFixed(0),
        ].join(","),
    );
    return [head.join(","), ...body].join("\n") + "\n";
}

/** Convert evaluation checkpoints to CSV string. */
export function evalCheckpointsToCsv(checkpoints: Checkpoint[]): string {
    if (checkpoints.length === 0) return "";
    const head = "episode,opponent,games,wins,draws,losses,win_rate,score,avg_plies";
    const lines = [head];
    for (const cp of checkpoints) {
        for (const [name, r] of Object.entries(cp.evalResults)) {
            lines.push(
                `${cp.episode},${name},${r.games},${r.wins},${r.draws},${r.losses},${r.winRate.toFixed(3)},${r.score.toFixed(3)},${r.avgPlies.toFixed(1)}`,
            );
        }
    }
    return lines.join("\n") + "\n";
}
