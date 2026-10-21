import {
    Action,
    DEFAULT_RULES,
    GameState,
    MILLS,
    Player,
    Rules,
    ADJACENT,
    applyAction,
    legalActions,
    other,
    totalPieces,
} from "./engine";
import * as tf from "@tensorflow/tfjs";
import { encode, FEATURE_SIZE } from "./features";
import { ValueNet } from "./valueNet";

export interface Agent {
    name: string;
    /** Called once per game with the colour this agent plays. */
    startGame(me: Player): void;
    selectAction(s: GameState, rng: () => number): Action;
    /** Called once when the game is over (also for the side that made the last move). */
    endGame(final: GameState): void;
}

/** +1 for a win, -1 for a loss, 0 for a draw, from `me`'s point of view. */
export function outcomeFor(s: GameState, me: Player): number {
    if (s.result === null || s.result === 2) return 0;
    return s.result === me ? 1 : -1;
}

/* ------------------------------------------------------------------ */
/* Random                                                             */
/* ------------------------------------------------------------------ */

export class RandomAgent implements Agent {
    name = "random";
    startGame(): void {}
    endGame(): void {}
    selectAction(s: GameState, rng: () => number): Action {
        const acts = legalActions(s);
        return acts[Math.floor(rng() * acts.length)];
    }
}

/* ------------------------------------------------------------------ */
/* Alpha-beta (negamax) with a hand-written heuristic                 */
/* ------------------------------------------------------------------ */

function countMoves(s: GameState, p: Player): number {
    if (s.inHand[p] > 0) return 0;
    const c = p + 1;
    let n = 0;
    for (let i = 0; i < 24; i++) {
        if (s.board[i] !== c) continue;
        for (const j of ADJACENT[i]) if (s.board[j] === 0) n++;
    }
    return n;
}

/** Heuristic value of `s` for player `p` (material, mills, open twos, mobility). */
export function heuristic(s: GameState, p: Player): number {
    const o = other(p);
    const cp = p + 1, co = o + 1;
    let mills = 0, twos = 0;
    for (const [a, b, c] of MILLS) {
        const v = [s.board[a], s.board[b], s.board[c]];
        const mine = v.filter((x) => x === cp).length;
        const theirs = v.filter((x) => x === co).length;
        if (mine === 3) mills++;
        else if (theirs === 3) mills--;
        else if (mine === 2 && theirs === 0) twos++;
        else if (theirs === 2 && mine === 0) twos--;
    }
    const material = totalPieces(s, p) - totalPieces(s, o);
    const mobility = countMoves(s, p) - countMoves(s, o);
    return 12 * material + 12 * mills + 0.4 * twos + 0.2 * mobility;
}

const WIN = 10000;

export class AlphaBetaAgent implements Agent {
    name: string;
    /** prune = false gives plain minimax (same choices, slower). */
    constructor(public depth: number, private rules: Rules = DEFAULT_RULES, private prune = true) {
        this.name = `${prune ? "alphabeta" : "minimax"}-d${depth}`;
    }
    startGame(): void {}
    endGame(): void {}

    private negamax(s: GameState, depth: number, alpha: number, beta: number): number {
        if (s.result !== null) {
            if (s.result === 2) return 0;
            // s.toMove is the side that just lost (the winner moved last).
            return s.result === s.toMove ? WIN + depth : -(WIN + depth);
        }
        if (depth === 0) return heuristic(s, s.toMove);
        const acts = legalActions(s);
        acts.sort((x, y) => (y.capture >= 0 ? 1 : 0) - (x.capture >= 0 ? 1 : 0));
        let best = -Infinity;
        for (const a of acts) {
            const v = -this.negamax(applyAction(s, a, this.rules), depth - 1, -beta, -alpha);
            if (v > best) best = v;
            if (v > alpha) alpha = v;
            if (this.prune && alpha >= beta) break;
        }
        return best;
    }

    selectAction(s: GameState, rng: () => number): Action {
        const acts = legalActions(s);
        let best = -Infinity;
        let bestActs: Action[] = [];
        for (const a of acts) {
            // Full window at the root so ties are real ties (lets us break them randomly).
            const nextState = applyAction(s, a, this.rules);
            const v = -this.negamax(nextState, this.depth - 1, -Infinity, Infinity);
            if (v > best + 1e-9) {
                best = v;
                bestActs = [a];
            } else if (Math.abs(v - best) <= 1e-9) {
                bestActs.push(a);
            }
        }

         return bestActs[Math.floor(rng() * bestActs.length)];
    }
}

/* ------------------------------------------------------------------ */
/* TD(0) afterstate agent                                             */
/* ------------------------------------------------------------------ */

export type TDOptions = {
    alpha: number;
    gamma: number;
    epsilon: number;
    /**
     * Eligibility-trace decay. 0 = plain TD(0) (only the previous afterstate
     * is updated). Higher values push the outcome back over earlier moves in
     * the game, which matters here because the only real reward arrives at the
     * very end.
     */
    lambda: number;
    /** Small reward for each capture made (and penalty for each cow lost). 0 = only win/loss. */
    captureReward: number;
    learn: boolean;
};

export const DEFAULT_TD: TDOptions = {
    alpha: 0.01,
    gamma: 0.99,
    epsilon: 0.1,
    lambda: 0,
    captureReward: 0.15,
    learn: true,
};

export type TDStats = { absDelta: number[]; gradNorm: number[]; values: number[] };

/**
 * Learns V(afterstate) = value of the position right after my move, from my
 * point of view. Every time I move again (or the game ends) I update the
 * previous afterstate towards  r + gamma * V(new afterstate).
 */
export class TDAgent implements Agent {
    name: string;
    me: Player = 0;
    opts: TDOptions;
    stats: TDStats = { absDelta: [], gradNorm: [], values: [] };

    private prevX: Float32Array | null = null;
    private prevMyTotal = 0;
    private buf = new Float32Array(FEATURE_SIZE * 64);
    /** This agent's own eligibility traces (see ValueNet.createTraces). */
    private traces: tf.Tensor[] | null = null;

    constructor(public net: ValueNet, opts: Partial<TDOptions> = {}, name = "td", private rules: Rules = DEFAULT_RULES) {
        this.opts = { ...DEFAULT_TD, ...opts };
        this.name = name;
    }

    startGame(me: Player): void {
        this.me = me;
        this.prevX = null;
        this.prevMyTotal = 12;
        // Traces are per-episode: last game's credit must not leak into this one.
        if (this.opts.lambda > 0 && this.opts.learn) {
            ValueNet.disposeTraces(this.traces);
            this.traces = this.net.createTraces();
        }
    }

    private update(target: number): void {
        if (!this.prevX) return;
        const info = this.opts.lambda > 0 && this.traces
            ? this.net.tdStepTraces(
                this.prevX,
                target,
                this.opts.alpha,
                this.opts.gamma * this.opts.lambda,
                this.traces,
            )
            : this.net.tdStep(this.prevX, target, this.opts.alpha);
        this.stats.absDelta.push(Math.abs(info.delta));
        this.stats.gradNorm.push(info.gradNorm);
        this.stats.values.push(info.value);
    }

    /** Frees trace tensors. Call when the agent is finished with. */
    dispose(): void {
        ValueNet.disposeTraces(this.traces);
        this.traces = null;
    }

    selectAction(s: GameState, rng: () => number): Action {
        const acts = legalActions(s);
        const n = acts.length;
        if (this.buf.length < n * FEATURE_SIZE) this.buf = new Float32Array(n * FEATURE_SIZE * 2);
        const afters = acts.map((a) => applyAction(s, a, this.rules));
        afters.forEach((after, i) => encode(after, this.me, this.buf, i * FEATURE_SIZE));

        const v = this.net.values(this.buf, n);
        const score = afters.map((after, i) => (after.result !== null ? outcomeFor(after, this.me) : v[i]));
        let idx: number;
        if (this.opts.epsilon > 0 && rng() < this.opts.epsilon) {
            idx = Math.floor(rng() * n);
        } else {
            let best = -Infinity;
            const ties: number[] = [];
            for (let i = 0; i < n; i++) {
                if (score[i] > best + 1e-9) { best = score[i]; ties.length = 0; ties.push(i); }
                else if (Math.abs(score[i] - best) <= 1e-9) ties.push(i);
            }
            idx = ties[Math.floor(rng() * ties.length)];
        }
        const chosen = acts[idx];
        const after = afters[idx];

        if (this.opts.learn) {
            const lost = this.prevMyTotal - totalPieces(s, this.me);
            const r = this.opts.captureReward * ((chosen.capture >= 0 ? 1 : 0) - lost);
            if (after.result !== null) {
                this.update(r + outcomeFor(after, this.me));
                this.prevX = null;
            } else {
                this.update(r + this.opts.gamma * score[idx]);
                this.prevX = this.buf.slice(idx * FEATURE_SIZE, (idx + 1) * FEATURE_SIZE);
            }
        }
        
        this.prevMyTotal = totalPieces(after, this.me);
        return chosen;
    }

    endGame(final: GameState): void {
        if (!this.opts.learn || !this.prevX) return;
        const lost = this.prevMyTotal - totalPieces(final, this.me);
        this.update(-this.opts.captureReward * lost + outcomeFor(final, this.me));
        this.prevX = null;
    }

    drainStats(): TDStats {
        const s = this.stats;
        this.stats = { absDelta: [], gradNorm: [], values: [] };
        return s;
    }
}

/* ------------------------------------------------------------------ */
/* Search over V: negamax using the learned value net as leaf eval    */
/* ------------------------------------------------------------------ */

/**
 * The same learned V, but chosen through a negamax search instead of greedily.
 *
 * Why this helps: TDAgent picks the best *immediate* afterstate, so it cannot
 * see a reply that loses a cow next ply. Searching d plies and only calling V
 * at the frontier keeps the learned evaluation but adds tactics.
 *
 * Perspective matters. V was trained only on afterstates - positions right
 * after the learner moved, where `toMove` is the opponent, so feature 52
 * ("it is my turn") is always 0. Evaluating a position from the side whose
 * turn it is would set that feature to 1 and put the network off-distribution.
 * So every leaf is scored as V(encode(leaf, side that just moved)).
 *
 * depth = 1 reduces exactly to TDAgent's greedy choice.
 */
export class SearchTDAgent implements Agent {
    name: string;
    me: Player = 0;
    /** Positions evaluated on the last move, for cost reporting. */
    lastNodes = 0;

    private buf = new Float32Array(FEATURE_SIZE * 64);

    constructor(
        public net: ValueNet,
        public depth = 2,
        name = `td-search-d${depth}`,
        private rules: Rules = DEFAULT_RULES,
    ) {
        this.name = name;
    }

    startGame(me: Player): void {
        this.me = me;
    }
    endGame(): void {}

    /** Value of `s` for `s.toMove`, searching `depth` more plies. */
    private negamax(s: GameState, depth: number, alpha: number, beta: number): number {
        const p = s.toMove;
        if (s.result !== null) {
            if (s.result === 2) return 0;
            return s.result === p ? 1 : -1;
        }
        if (depth <= 0) {
            // Score from the side that just moved, then flip: keeps V on-distribution.
            this.lastNodes++;
            return -this.net.value(encode(s, other(p), new Float32Array(FEATURE_SIZE), 0));
        }

        const acts = legalActions(s);
        const n = acts.length;
        const afters = acts.map((a) => applyAction(s, a, this.rules));

        // At the frontier, score every child in one batched forward pass.
        if (depth === 1) {
            if (this.buf.length < n * FEATURE_SIZE) this.buf = new Float32Array(n * FEATURE_SIZE * 2);
            let needNet = false;
            for (let i = 0; i < n; i++) {
                encode(afters[i], p, this.buf, i * FEATURE_SIZE);
                if (afters[i].result === null) needNet = true;
            }
            const v = needNet ? this.net.values(this.buf, n) : null;
            this.lastNodes += n;
            let best = -Infinity;
            for (let i = 0; i < n; i++) {
                const score = afters[i].result !== null ? outcomeFor(afters[i], p) : v![i];
                if (score > best) best = score;
            }
            return best;
        }

        // Captures first: better move ordering means alpha-beta prunes more.
        const order = acts.map((_, i) => i).sort((x, y) => (acts[y].capture >= 0 ? 1 : 0) - (acts[x].capture >= 0 ? 1 : 0));
        let best = -Infinity;
        for (const i of order) {
            const v = -this.negamax(afters[i], depth - 1, -beta, -alpha);
            if (v > best) best = v;
            if (v > alpha) alpha = v;
            if (alpha >= beta) break;
        }
        return best;
    }

    selectAction(s: GameState, rng: () => number): Action {
        this.lastNodes = 0;
        const acts = legalActions(s);
        let best = -Infinity;
        let ties: Action[] = [];
        for (const a of acts) {
            const after = applyAction(s, a, this.rules);
            // Full window at the root so equal moves really are equal.
            const score = after.result !== null
                ? outcomeFor(after, this.me)
                : -this.negamax(after, this.depth - 1, -Infinity, Infinity);
            if (score > best + 1e-9) {
                best = score;
                ties = [a];
            } else if (Math.abs(score - best) <= 1e-9) {
                ties.push(a);
            }
        }
        return ties[Math.floor(rng() * ties.length)];
    }
}
