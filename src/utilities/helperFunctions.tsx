import { Match, State, Binary } from "../components/arena/Game";
import type { Movement } from "../components/arena/Game";
import { capturablePoints, fromBitboards, GameState } from "@/rl/engine";
import { AlphaBetaAgent } from "@/rl/agents";

const MILLS: number[][] = [
    // Outer horizontal
    [0, 1, 2],
    [5, 6, 7],

    // Outer vertical
    [0, 3, 5],
    [2, 4, 7],

    // Middle horizontal
    [8, 9, 10],
    [13, 14, 15],

    // Middle vertical
    [8, 11, 13],
    [10, 12, 15],

    // Inner horizontal
    [16, 17, 18],
    [21, 22, 23],

    // Inner vertical
    [16, 19, 21],
    [18, 20, 23],

    // Connecting lines
    [1, 9, 17],
    [3, 11, 19],
    [4, 12, 20],
    [6, 14, 22],

    // Diagonal lines
    [0, 8, 16],
    [2, 10, 18],
    [5, 13, 21],
    [7, 15, 23],
];

const ADJACENT_POINTS: Record<number, number[]> = {
    0: [1, 3, 8],
    1: [0, 2, 9],
    2: [1, 10, 4],

    3: [0, 11, 5],
    4: [2, 12, 7],
    5: [3, 13, 6],

    6: [5, 7, 14],
    7: [4, 6, 15],
    8: [0, 9, 16, 11],

    9: [1, 10, 8],
    10: [2, 9, 12, 18],
    11: [3, 8, 19, 13],

    12: [4, 10, 20, 15],
    13: [5, 11, 21, 14],
    14: [6, 13, 22, 15],
    15: [14, 23, 12, 7],
    16: [8, 17, 19],
    17: [16, 9, 18],

    18: [17, 10, 20], // was [7, 10, 20]: 18 is not next to 7
    19: [11, 16, 21],
    20: [18, 12, 23],

    21: [19, 22, 13],
    22: [21, 14, 23],
    23: [22, 15, 20],
};

export const setMillEdges = (mill: number[]) => {
    const millEdges: [number, number][] = [];
    for (let i = 0; i < mill.length - 1; i++) millEdges.push([mill[i], mill[i + 1]]);
    return millEdges;
};

class Move {
    public from: number;
    public to: number;

    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
    }
}

export const movesList = (
    moves: { turn: number; agent: string; move: string; mill: boolean; capture: string }[],
) => {
    return moves.map((m, i) => (
        <tr
            key={`${m.turn}-${i}`}
            className={`border-b border-border/50 ${i === moves.length - 1 ? "bg-info/10" : ""}`}
        >
            <td className="px-4 py-3">{m.turn}</td>
            <td className="px-4 py-3">{m.agent}</td>
            <td className="px-4 py-3 text-center">{m.move}</td>
            <td
                className={`px-4 py-3 text-center ${m.mill ? "font-semibold text-success" : "text-muted-foreground"}`}
            >
                {m.mill ? "Yes" : "No"}
            </td>
            <td
                className={`px-4 py-3 text-center ${
                    m.capture === "-" ? "text-muted-foreground" : "text-danger"
                }`}
            >
                {m.capture}
            </td>
        </tr>
    ));
};

/** Board as the engine sees it (0 empty, 1 White, 2 Black). */
function engineBoard(match: Match): Int8Array {
    const board = new Int8Array(24);
    for (let i = 0; i < 24; i++) {
        if (match.state.B0[i] === 1) board[i] = 1;
        else if (match.state.B1[i] === 1) board[i] = 2;
    }
    return board;
}

/**
 * Opponent cows `player` may capture: any cow that is not in a (current) mill,
 * or any cow at all if every one of them is in a mill.
 */
export const GenerateLegalCaptures = (match: Match, player: Binary): number[] => {
    if (!match?.state) return [];
    return capturablePoints(engineBoard(match), player === 0 ? 1 : 0);
};

/** Snapshot of the arena match in the training engine's format (start of a turn). */
export function matchToEngineState(match: Match): GameState {
    return fromBitboards(
        match.state.B0,
        match.state.B1,
        [match.White.placingCows, match.Black.placingCows],
        match.state.Player,
    );
}

export const GenerateLegalMoves = (match: Match, player: Binary): Movement[] => {
    const state = match?.state;
    const agent = match.getAgent(player);
    const B0 = state.B0;
    const B1 = state.B1;
    const own = player === 0 ? B0 : B1;
    const legalMoves: Movement[] = [];

    // Still has cows in hand: place on any empty point (encoded as from === to).
    if (agent.canPlace()) {
        for (let i = 0; i < 24; i++) {
            if (B0[i] === 0 && B1[i] === 0) legalMoves.push({ from: i, to: i });
        }
        return legalMoves;
    }

    // Exactly 3 cows left: may fly anywhere. Otherwise move to an adjacent point.
    const flying = agent.Remaining() <= 3;
    for (let from = 0; from < 24; from++) {
        if (own[from] !== 1) continue;
        const targets = flying ? [...Array(24).keys()] : ADJACENT_POINTS[from];
        for (const to of targets) {
            if (B0[to] === 0 && B1[to] === 0) legalMoves.push({ from, to });
        }
    }
    return legalMoves;
};

type MinimaxMove = {
    move: Movement;
    capture: number;
};

/*
 * Minimax / alpha-beta for the arena run on the fast training engine
 * (src/rl/engine.ts) with its heuristic (material, mills, open twos,
 * mobility). Searching through copyMatch() was far too slow at depth 3
 * once the search correctly plays the opponent's replies.
 */
function engineSearch(match: Match, depth: number, prune: boolean): MinimaxMove {
    const state = matchToEngineState(match);
    const action = new AlphaBetaAgent(depth, undefined, prune).selectAction(state, Math.random);
    if (!action) return { move: { from: -1, to: -1 }, capture: -1 };
    const from = action.from < 0 ? action.to : action.from; // arena encodes a placement as from === to
    return { move: { from, to: action.to }, capture: action.capture };
}

export function AlphaBeta(match: Match, depth: number): MinimaxMove {
    return engineSearch(match, depth, true);
}

export function Minimaxmove(match: Match, depth: number): MinimaxMove {
    return engineSearch(match, depth, false);
}

export function getRandomMove(match: Match): Movement {
    const legalMoves = GenerateLegalMoves(match, match.state.Player);

    if (legalMoves.length === 0) {
        return {
            from: -1,
            to: -1,
        };
    }

    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
}

export function getRandomCapture(match: Match): number {
    const legalCaptures = GenerateLegalCaptures(match, match.state.Player);

    if (legalCaptures.length === 0) {
        return -1;
    }

    const randomIndex = Math.floor(Math.random() * legalCaptures.length);
    return legalCaptures[randomIndex];
}

export function copyMatch(match: Match): Match {
    const matchCopy = Object.create(Object.getPrototypeOf(match)) as Match;

    // Copy White Agent without structuredClone
    matchCopy.White = Object.create(Object.getPrototypeOf(match.White));

    Object.assign(matchCopy.White, match.White);

    // Copy Black Agent without structuredClone
    matchCopy.Black = Object.create(Object.getPrototypeOf(match.Black));

    Object.assign(matchCopy.Black, match.Black);

    // Copy State
    matchCopy.state = Object.create(Object.getPrototypeOf(match.state));

    Object.assign(matchCopy.state, structuredClone(match.state));

    // Copy other Match data
    matchCopy.score = structuredClone(match.score);
    matchCopy.moves = structuredClone(match.moves);
    matchCopy.cells = structuredClone(match.cells);
    matchCopy.moveHistory = structuredClone(match.moveHistory);
    matchCopy.mill = structuredClone(match.mill);
    matchCopy.millsFormed = structuredClone(match.millsFormed);
    matchCopy.lastMove = structuredClone(match.lastMove);
    matchCopy.winner = match.winner;
    matchCopy.isMove = match.isMove;

    return matchCopy;
}

export function isMillFormed(position: number, B: Binary[]): boolean {
    const item = B[position];

    if (item === null) {
        return false;
    }

    return MILLS.some(([a, b, c]) => {
        if (a !== position && b !== position && c !== position) {
            return false;
        }

        return B[a] === item && B[b] === item && B[c] === item;
    });
}

export function getMillFormed(position: number, B: Binary[]): number[] | null {
    const item = B[position];

    if (item === null) {
        return null;
    }

    const mill = MILLS.find(([a, b, c]) => {
        if (a !== position && b !== position && c !== position) {
            return false;
        }

        return B[a] === item && B[b] === item && B[c] === item;
    });

    return mill ?? null;
}
