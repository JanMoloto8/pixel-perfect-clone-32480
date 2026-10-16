/*
 * Fast, self-contained Morabaraba engine used for training and evaluation.
 *
 * One "action" is a full turn: place/move a cow AND (if a mill was formed)
 * the capture that goes with it. This keeps every RL transition a single
 * step for one player, which is what TD(0) needs.
 *
 * Board indices match src/components/arena/Constants.tsx:
 *   ring 0 (outer)  0..7, ring 1 (middle) 8..15, ring 2 (inner) 16..23
 *   inside a ring:  0 1 2 / 3 . 4 / 5 6 7
 */

export type Player = 0 | 1; // 0 = White, 1 = Black

export const MILLS: readonly (readonly [number, number, number])[] = [
    [0, 1, 2], [5, 6, 7], [0, 3, 5], [2, 4, 7],
    [8, 9, 10], [13, 14, 15], [8, 11, 13], [10, 12, 15],
    [16, 17, 18], [21, 22, 23], [16, 19, 21], [18, 20, 23],
    [1, 9, 17], [3, 11, 19], [4, 12, 20], [6, 14, 22],
    [0, 8, 16], [2, 10, 18], [5, 13, 21], [7, 15, 23],
];

/** Adjacency is derived from the mill lines, so it can never disagree with them. */
export const ADJACENT: number[][] = (() => {
    const adj: Set<number>[] = Array.from({ length: 24 }, () => new Set<number>());
    for (const [a, b, c] of MILLS) {
        adj[a].add(b); adj[b].add(a);
        adj[b].add(c); adj[c].add(b);
    }
    return adj.map((s) => [...s].sort((x, y) => x - y));
})();

/** Mills that pass through each point. */
const MILLS_AT: number[][][] = Array.from({ length: 24 }, (_, p) =>
    MILLS.filter((m) => m.includes(p)).map((m) => [...m]),
);

export const PIECES_PER_PLAYER = 12;

export type GameState = {
    /** 0 = empty, 1 = White, 2 = Black */
    board: Int8Array;
    inHand: [number, number];
    onBoard: [number, number];
    toMove: Player;
    ply: number;
    pliesSinceCapture: number;
    /** null while playing; 0/1 = winner; 2 = draw */
    result: null | Player | 2;
};

export type Action = {
    /** -1 for a placement */
    from: number;
    to: number;
    /** -1 if no capture */
    capture: number;
};

export type Rules = {
    /** Draw if this many plies pass in the moving phase without a capture. */
    noCaptureDrawPlies: number;
    /** Hard cap on game length (draw). */
    maxPlies: number;
};

export const DEFAULT_RULES: Rules = { noCaptureDrawPlies: 10000, maxPlies: 400000 };

export function initialState(): GameState {
    return {
        board: new Int8Array(24),
        inHand: [PIECES_PER_PLAYER, PIECES_PER_PLAYER],
        onBoard: [0, 0],
        toMove: 0,
        ply: 0,
        pliesSinceCapture: 0,
        result: null,
    };
}

export function cloneState(s: GameState): GameState {
    return {
        board: s.board.slice(),
        inHand: [s.inHand[0], s.inHand[1]],
        onBoard: [s.onBoard[0], s.onBoard[1]],
        toMove: s.toMove,
        ply: s.ply,
        pliesSinceCapture: s.pliesSinceCapture,
        result: s.result,
    };
}

const cell = (p: Player) => (p + 1) as 1 | 2;
export const other = (p: Player): Player => (p === 0 ? 1 : 0);

export function totalPieces(s: GameState, p: Player): number {
    return s.inHand[p] + s.onBoard[p];
}

export function isFlying(s: GameState, p: Player): boolean {
    return s.inHand[p] === 0 && s.onBoard[p] === 3;
}

/** True if `point` (occupied by colour `c`) is part of a complete mill. */
export function inMill(board: Int8Array, point: number): boolean {
    const c = board[point];
    if (c === 0) return false;
    for (const [a, b, d] of MILLS_AT[point]) {
        if (board[a] === c && board[b] === c && board[d] === c) return true;
    }
    return false;
}

/** Opponent cows that may be captured: not in a mill, unless all of them are. */
export function capturablePoints(board: Int8Array, victim: Player): number[] {
    const c = cell(victim);
    const all: number[] = [];
    const free: number[] = [];
    for (let i = 0; i < 24; i++) {
        if (board[i] !== c) continue;
        all.push(i);
        if (!inMill(board, i)) free.push(i);
    }
    return free.length > 0 ? free : all;
}

/** Base moves (no capture info) for the side to move. */
function baseMoves(s: GameState): [number, number][] {
    const p = s.toMove;
    const c = cell(p);
    const out: [number, number][] = [];
    if (s.inHand[p] > 0) {
        for (let i = 0; i < 24; i++) if (s.board[i] === 0) out.push([-1, i]);
        return out;
    }
    const flying = s.onBoard[p] === 3;
    for (let from = 0; from < 24; from++) {
        if (s.board[from] !== c) continue;
        if (flying) {
            for (let to = 0; to < 24; to++) if (s.board[to] === 0) out.push([from, to]);
        } else {
            for (const to of ADJACENT[from]) if (s.board[to] === 0) out.push([from, to]);
        }
    }
    return out;
}

export function legalActions(s: GameState): Action[] {
    if (s.result !== null) return [];

    const p = s.toMove;
    const c = cell(p);
    const opp = other(p);
    const actions: Action[] = []; 
    const board = s.board;
    for (const [from, to] of baseMoves(s)) {

        if (from >= 0) board[from] = 0;
        board[to] = c;
        const formsMill = inMill(board, to);
        if (formsMill && s.onBoard[opp] > 0) {
            for (const cap of capturablePoints(board, opp)) {
                actions.push({ from, to, capture: cap });
            }
        } else {
            actions.push({ from, to, capture: -1 });
        }
        board[to] = 0;
        if (from >= 0) board[from] = c;
    }
    return actions;
}

/** Applies an action in place and resolves game-over. */
export function applyActionInPlace(s: GameState, a: Action, rules: Rules = DEFAULT_RULES): void {
    const p = s.toMove;
    const opp = other(p);
    const c = cell(p);
    if (a.from >= 0) {
        s.board[a.from] = 0;
    } else {
        s.inHand[p] -= 1;
        s.onBoard[p] += 1;
    }
    s.board[a.to] = c;
    if (a.capture >= 0) {
        s.board[a.capture] = 0;
        s.onBoard[opp] -= 1;
        s.pliesSinceCapture = 0;
    } else if (s.inHand[0] === 0 && s.inHand[1] === 0) {
        s.pliesSinceCapture += 1;
    }
    s.ply += 1;
    s.toMove = opp;

    // Game over checks, from the point of view of the side now to move.
    if (totalPieces(s, opp) < 3) {
        s.result = p;
    } else if (baseMoves(s).length === 0) {
        s.result = p; // opponent is blocked and loses
    } else if (s.pliesSinceCapture >= rules.noCaptureDrawPlies || s.ply >= rules.maxPlies) {
        s.result = 2;
    }
}

export function applyAction(s: GameState, a: Action, rules: Rules = DEFAULT_RULES): GameState {
    const sClone = cloneState(s);
    applyActionInPlace(sClone, a, rules);
    return sClone;
}

/** Build an engine state from the arena's per-colour bitboards. */
export function fromBitboards(
    B0: number[],
    B1: number[],
    inHand: [number, number],
    toMove: Player,
): GameState {
    const s = initialState();
    let w = 0, b = 0;
    for (let i = 0; i < 24; i++) {
        if (B0[i] === 1) { s.board[i] = 1; w++; }
        else if (B1[i] === 1) { s.board[i] = 2; b++; }
    }
    s.onBoard = [w, b];
    s.inHand = [inHand[0], inHand[1]];
    s.toMove = toMove;
    return s;
}

/** Small seedable RNG so experiments are repeatable. */
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
