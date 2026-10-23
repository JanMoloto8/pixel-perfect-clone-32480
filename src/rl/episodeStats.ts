/*
 * Per-episode statistics for agents playing in the browser arena.
 *
 * The headless trainer logs one row per `--eval-every` block; here one row is
 * one episode, because the whole point is watching it move. The columns are the
 * same ones scripts/train.ts writes, so a session exported from the arena lines
 * up with a session run from the terminal.
 */
import { GameState, Player, applyAction, initialState, legalActions, mulberry32 } from "./engine";
import { FEATURE_SIZE, encode } from "./features";
import { TDStats } from "./agents";
import { ValueNet } from "./valueNet";

/** How many recent episodes the rolling score averages over. */
export const SCORE_WINDOW = 20;

/** One episode of a *training* agent. Mirrors scripts/train.ts train.csv. */
export type TrainingStatsRow = {
    episode: number;
    /** Episodes played so far (the arena plays exactly one game per episode). */
    games: number;
    /** +1 win, 0 draw, -1 loss, for this episode. */
    result: number;
    /** Rolling (wins + 1/2 draws) / games over the last SCORE_WINDOW episodes. */
    learner_score: number;
    /** Same thing over every episode so far. */
    cum_score: number;
    avg_plies: number;
    plies: number;
    mean_abs_td: number;
    mean_grad_norm: number;
    zero_grad_frac: number;
    updates_per_game: number;
    v_opening: number;
    weight_l2: number;
    /** One entry per hidden layer. Empty when the activation cannot go dead. */
    dead: number[];
    alpha: number;
    epsilon: number;
    sec: number;
};

/** One episode of a *playing* agent: no learning, so only performance. */
export type PlayStatsRow = {
    episode: number;
    games: number;
    result: number;
    learner_score: number;
    cum_score: number;
    plies: number;
    avg_plies: number;
    wins: number;
    draws: number;
    losses: number;
    sec: number;
};

export type StatsRow = TrainingStatsRow | PlayStatsRow;
export const isTrainingRow = (r: StatsRow): r is TrainingStatsRow => "mean_abs_td" in r;

/**
 * A fixed set of positions used to measure dead units and V(opening)
 * consistently across episodes. Built once, from seeded random play, so the
 * numbers are comparable from one episode to the next rather than depending on
 * whatever happened to be on the board.
 */
let probeCache: { xs: Float32Array; n: number } | null = null;
function probe(): { xs: Float32Array; n: number } {
    if (probeCache) return probeCache;
    const n = 100;
    const xs = new Float32Array(FEATURE_SIZE * n);
    const r = mulberry32(99);
    let k = 0;
    while (k < n) {
        let s: GameState = initialState();
        while (s.result === null && k < n) {
            const acts = legalActions(s);
            s = applyAction(s, acts[Math.floor(r() * acts.length)]);
            // Encode from the side that just moved: that is the afterstate
            // distribution the network is trained on.
            if (r() < 0.2) encode(s, (1 - s.toMove) as Player, xs, FEATURE_SIZE * k++);
        }
    }
    probeCache = { xs, n };
    return probeCache;
}

/** The position after White's first placement, encoded for White. */
let openingCache: Float32Array | null = null;
function openingX(): Float32Array {
    if (!openingCache) {
        openingCache = encode(applyAction(initialState(), { from: -1, to: 0, capture: -1 }), 0);
    }
    return openingCache;
}

/**
 * Accumulates one row per finished episode for a single agent.
 *
 * Kept outside React state so adding a row never costs a re-render of the
 * board; the UI reads `rows` when it refreshes.
 */
export class EpisodeStats {
    rows: StatsRow[] = [];
    private wins = 0;
    private draws = 0;
    private losses = 0;
    private plies = 0;
    private results: number[] = [];
    private startedAt = Date.now();

    constructor(public readonly training: boolean) {}

    reset(): void {
        this.rows = [];
        this.wins = this.draws = this.losses = this.plies = 0;
        this.results = [];
        this.startedAt = Date.now();
    }

    private tally(result: number, plies: number) {
        if (result > 0) this.wins++;
        else if (result < 0) this.losses++;
        else this.draws++;
        this.plies += plies;
        this.results.push(result > 0 ? 1 : result < 0 ? 0 : 0.5);
        const games = this.wins + this.draws + this.losses;
        const window = this.results.slice(-SCORE_WINDOW);
        return {
            games,
            rolling: window.reduce((a, b) => a + b, 0) / window.length,
            cumulative: this.results.reduce((a, b) => a + b, 0) / games,
            avgPlies: this.plies / games,
            sec: (Date.now() - this.startedAt) / 1000,
        };
    }

    /** Records a finished episode for a learning agent. */
    addTraining(args: {
        result: number;
        plies: number;
        stats: TDStats;
        net: ValueNet;
        alpha: number;
        epsilon: number;
    }): TrainingStatsRow {
        const t = this.tally(args.result, args.plies);
        const { absDelta, gradNorm } = args.stats;
        const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
        const p = probe();
        const row: TrainingStatsRow = {
            episode: t.games,
            games: t.games,
            result: args.result,
            learner_score: t.rolling,
            cum_score: t.cumulative,
            plies: args.plies,
            avg_plies: t.avgPlies,
            mean_abs_td: mean(absDelta),
            mean_grad_norm: mean(gradNorm),
            zero_grad_frac: gradNorm.length ? gradNorm.filter((g) => g === 0).length / gradNorm.length : 0,
            updates_per_game: gradNorm.length,
            v_opening: args.net.value(openingX()),
            weight_l2: args.net.weightL2(),
            dead: args.net.measuresDeadUnits() ? args.net.deadUnitFraction(p.xs, p.n) : [],
            alpha: args.alpha,
            epsilon: args.epsilon,
            sec: t.sec,
        };
        this.rows.push(row);
        return row;
    }

    /** Records a finished episode for a non-learning agent. */
    addPlay(result: number, plies: number): PlayStatsRow {
        const t = this.tally(result, plies);
        const row: PlayStatsRow = {
            episode: t.games,
            games: t.games,
            result,
            learner_score: t.rolling,
            cum_score: t.cumulative,
            plies,
            avg_plies: t.avgPlies,
            wins: this.wins,
            draws: this.draws,
            losses: this.losses,
            sec: t.sec,
        };
        this.rows.push(row);
        return row;
    }

    get latest(): StatsRow | null {
        return this.rows.length ? this.rows[this.rows.length - 1] : null;
    }

    get record(): { wins: number; draws: number; losses: number } {
        return { wins: this.wins, draws: this.draws, losses: this.losses };
    }

    /**
     * CSV of everything collected. Dead-unit columns are named dead_l1,
     * dead_l2, ... one per hidden layer, so a two-layer network produces
     * exactly the header scripts/train.ts writes.
     */
    toCsv(): string {
        if (this.rows.length === 0) return "";
        const first = this.rows[0];
        if (isTrainingRow(first)) {
            const layers = first.dead.length;
            const deadCols = Array.from({ length: layers }, (_, i) => `dead_l${i + 1}`);
            const head = [
                "episode", "games", "result", "learner_score", "cum_score", "plies", "avg_plies",
                "mean_abs_td", "mean_grad_norm", "zero_grad_frac", "updates_per_game",
                "v_opening", "weight_l2", ...deadCols, "alpha", "epsilon", "sec",
            ];
            const body = (this.rows as TrainingStatsRow[]).map((r) =>
                [
                    r.episode, r.games, r.result, r.learner_score.toFixed(4), r.cum_score.toFixed(4),
                    r.plies, r.avg_plies.toFixed(1), r.mean_abs_td.toFixed(5), r.mean_grad_norm.toFixed(5),
                    r.zero_grad_frac.toFixed(4), r.updates_per_game, r.v_opening.toFixed(4),
                    r.weight_l2.toFixed(3), ...Array.from({ length: layers }, (_, i) => (r.dead[i] ?? 0).toFixed(3)),
                    r.alpha.toFixed(5), r.epsilon.toFixed(3), r.sec.toFixed(0),
                ].join(","),
            );
            return [head.join(","), ...body].join("\n") + "\n";
        }
        const head = ["episode", "games", "result", "learner_score", "cum_score", "plies", "avg_plies", "wins", "draws", "losses", "sec"];
        const body = (this.rows as PlayStatsRow[]).map((r) =>
            [r.episode, r.games, r.result, r.learner_score.toFixed(4), r.cum_score.toFixed(4), r.plies, r.avg_plies.toFixed(1), r.wins, r.draws, r.losses, r.sec.toFixed(0)].join(","),
        );
        return [head.join(","), ...body].join("\n") + "\n";
    }
}
