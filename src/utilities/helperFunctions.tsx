import { Match, State, Binary } from "../components/arena/Game";
import type { Movement } from "../components/arena/Game";
import { NeuralNetwork } from "@/components/arena/neuralNetwork";

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

    18: [7, 10, 20],
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

export const GenerateLegalCaptures = (match: Match, player: Binary): number[] => {
    const state = match?.state;
    const millsFormed = match?.millsFormed;

    if (!state || !millsFormed) return [];

    if (player === 0) {
        return state.B1.map((value, index) =>
            value === 1 && !millsFormed.black.some((mill) => mill.includes(index)) ? index : -1,
        ).filter((index) => index !== -1);
    } else {
        return state.B0.map((value, index) =>
            value === 1 && !millsFormed.white.some((mill) => mill.includes(index)) ? index : -1,
        ).filter((index) => index !== -1);
    }
};

export const GenerateLegalMoves = (match: Match, player: Binary): Movement[] => {
    const state = match?.state;
    const Remaining = match.getAgent(player).Remaining();
    const canPlace = match.getAgent(player).canPlace();

    const B0 = state.B0;
    const B1 = state.B1;

    const legalMoves: Movement[] = [];

    if (state.getPhase() === "Placing") {
        for (let i = 0; i < 24; i++) {
            if (B0[i] === 0 && B1[i] === 0) {
                legalMoves.push({
                    from: i,
                    to: i,
                });
            }
        }

        return legalMoves;
    }

    const currentPlayer = state.getPlayer();
    const isWhite = currentPlayer === "White";

    const currentBoard = isWhite ? B0 : B1;
    const opponentBoard = isWhite ? B1 : B0;

    if (state.getPhase() === "Moving") {
        if (canPlace) {
            for (let i = 0; i < 24; i++) {
                if (B0[i] === 0 && B1[i] === 0) {
                    legalMoves.push({
                        from: i,
                        to: i,
                    });
                }
            }
        } else {
            for (let from = 0; from < 24; from++) {
                if (currentBoard[from] !== 1) continue;

                for (const to of ADJACENT_POINTS[from]) {
                    const isEmpty = currentBoard[to] === 0 && opponentBoard[to] === 0;

                    if (isEmpty) {
                        legalMoves.push({ from, to });
                    }
                }
            }
        }

        return legalMoves;
    }

    if (state.getPhase() === "Flying") {
        if (Remaining <= 3) {
            for (let from = 0; from < 24; from++) {
                if (currentBoard[from] !== 1) continue;

                for (let to = 0; to < 24; to++) {
                    const isEmpty = currentBoard[to] === 0 && opponentBoard[to] === 0;

                    if (isEmpty) {
                        legalMoves.push({ from, to });
                    }
                }
            }
        } else {
            for (let from = 0; from < 24; from++) {
                if (currentBoard[from] !== 1) continue;

                // Only check positions adjacent to 'from'
                for (const to of ADJACENT_POINTS[from]) {
                    const isEmpty = currentBoard[to] === 0 && opponentBoard[to] === 0;

                    if (isEmpty) {
                        legalMoves.push({ from, to });
                    }
                }
            }
        }

        return legalMoves;
    }

    return legalMoves;
};

export function BasicHeuristic(match: Match): number {
    // H(s)=wp​P(s)+wm​M(s)+wt​T(s)+wo​O(s)

    const state = match.state;

    const Ps = state.B0Remaining - state.B1Remaining;
    const wP = 1;
    const Ms = match.numMillsFormed("White") - match.numMillsFormed("Black");
    const wM = 10;
    const Os = GenerateLegalMoves(match, 0).length - GenerateLegalMoves(match, 1).length;
    const wO = 0;

    return wP * Ps + wM * Ms + wO * Os;
}

export function AlphaBeta(match: Match, depth: number): MinimaxMove {
    const player = match.state.Player;
    const legalMoves = GenerateLegalMoves(match, player);

    if (legalMoves.length === 0) {
        return {
            move: {
                from: -1,
                to: -1,
            },
            capture: -1,
        };
    }

    let bestMove = legalMoves[0];
    let bestCapture = -1;

    if (player === 0) {
        let bestValue = -Infinity;
        let alpha = -Infinity;
        const beta = Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.White.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.black,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = alphaBeta(captureMatch, depth - 1, false, alpha, beta);

                    if (value > bestValue) {
                        bestValue = value;
                        bestMove = move;
                        bestCapture = capture;
                    }

                    alpha = Math.max(alpha, bestValue);

                    if (beta <= alpha) {
                        break;
                    }
                }
            } else {
                const value = alphaBeta(matchCopy, depth - 1, false, alpha, beta);

                if (value > bestValue) {
                    bestValue = value;
                    bestMove = move;
                    bestCapture = -1;
                }

                alpha = Math.max(alpha, bestValue);

                if (beta <= alpha) {
                    break;
                }
            }
        }
    } else {
        let bestValue = Infinity;
        const alpha = -Infinity;
        let beta = Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.White.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.white,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = alphaBeta(captureMatch, depth - 1, true, alpha, beta);

                    if (value < bestValue) {
                        bestValue = value;
                        bestMove = move;
                        bestCapture = capture;
                    }

                    beta = Math.min(beta, bestValue);

                    if (beta <= alpha) {
                        break;
                    }
                }
            } else {
                const value = alphaBeta(matchCopy, depth - 1, true, alpha, beta);

                if (value < bestValue) {
                    bestValue = value;
                    bestMove = move;
                    bestCapture = -1;
                }

                beta = Math.min(beta, bestValue);

                if (beta <= alpha) {
                    break;
                }
            }
        }
    }

    return {
        move: bestMove,
        capture: bestCapture,
    };
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

function nextMatches(match: Match, player: Binary): Match[] {
    const legalMoves = GenerateLegalMoves(match, player);

    const nextMatches: Match[] = [];

    legalMoves.forEach((move) => {
        const matchCopy = copyMatch(match);

        matchCopy.doMove(move);

        nextMatches.push(matchCopy);
    });

    return nextMatches;
}

function Value(match: Match): number {
    const state = match.state;
    return match.getCurrentPlayerAgent().network.predict(state);
}

type MinimaxMove = {
    move: Movement;
    capture: number;
};

function minimax(match: Match, depth: number, maximizing: boolean): number {

    if (depth === 0) {
        return BasicHeuristic(match);
    }

    const player: Binary = maximizing ? 0 : 1;
    const legalMoves = GenerateLegalMoves(match, player);

    if (legalMoves.length === 0) {
        return BasicHeuristic(match);
    }

    if (maximizing) {
        let bestValue = -Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.White.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.black,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = minimax(captureMatch, depth - 1, false);

                    bestValue = Math.max(bestValue, value);
                }
            } else {
                const value = minimax(matchCopy, depth - 1, false);

                bestValue = Math.max(bestValue, value);
            }
        }

        return bestValue;
    } else {
        let bestValue = Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.Black.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.white,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = minimax(captureMatch, depth - 1, true);

                    bestValue = Math.min(bestValue, value);
                }
            } else {
                const value = minimax(matchCopy, depth - 1, true);

                bestValue = Math.min(bestValue, value);
            }
        }

        return bestValue;
    }
}

export function Minimaxmove(match: Match, depth: number): MinimaxMove {
    const player = match.state.Player;
    const legalMoves = GenerateLegalMoves(match, player);
    if (legalMoves.length === 0) {
        return {
            move: {
                from: -1,
                to: -1,
            },
            capture: -1,
        };
    }

    let bestMove = legalMoves[0];
    let bestCapture = -1;

    if (player === 0) {
        let bestValue = -Infinity;
        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);
            matchCopy.doMoveOrCapture(move, -1);
            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.White.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.black,
                );
                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);
                    captureMatch.doMoveOrCapture(move, capture);

                    const value = minimax(captureMatch, depth - 1, false);

                    if (value > bestValue) {
                        bestValue = value;
                        bestMove = move;
                        bestCapture = capture;
                    }
                }
            } else {
                const value = minimax(matchCopy, depth - 1, false);

                if (value > bestValue) {
                    bestValue = value;
                    bestMove = move;
                    bestCapture = -1;
                }
            }
        }
    } else {
        let bestValue = Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.Black.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.white,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = minimax(captureMatch, depth - 1, true);

                    if (value < bestValue) {
                        bestValue = value;
                        bestMove = move;
                        bestCapture = capture;
                    }
                }
            } else {
                const value = minimax(matchCopy, depth - 1, true);

                if (value < bestValue) {
                    bestValue = value;
                    bestMove = move;
                    bestCapture = -1;
                }
            }
        }
    }

    return {
        move: bestMove,
        capture: bestCapture,
    };
}

function alphaBeta(
    match: Match,
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number,
): number {
    if (depth === 0) {
        return BasicHeuristic(match);
    }

    const player: Binary = maximizing ? 0 : 1;
    const legalMoves = GenerateLegalMoves(match, player);

    if (legalMoves.length === 0) {
        return BasicHeuristic(match);
    }

    if (maximizing) {
        let bestValue = -Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.White.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.black,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = alphaBeta(captureMatch, depth - 1, false, alpha, beta);

                    bestValue = Math.max(bestValue, value);
                    alpha = Math.max(alpha, bestValue);

                    if (beta <= alpha) {
                        break;
                    }
                }
            } else {
                const value = alphaBeta(matchCopy, depth - 1, false, alpha, beta);

                bestValue = Math.max(bestValue, value);
                alpha = Math.max(alpha, bestValue);
            }

            if (beta <= alpha) {
                break;
            }
        }

        return bestValue;
    } else {
        let bestValue = Infinity;

        for (const move of legalMoves) {
            const matchCopy = copyMatch(match);

            matchCopy.doMoveOrCapture(move, -1);

            if (matchCopy.mill.length > 0) {
                const captures = matchCopy.Black.GenerateLegalCaptures(
                    matchCopy.state,
                    matchCopy.millsFormed.white,
                );

                for (const capture of captures) {
                    const captureMatch = copyMatch(matchCopy);

                    captureMatch.doMoveOrCapture(move, capture);

                    const value = alphaBeta(captureMatch, depth - 1, true, alpha, beta);

                    bestValue = Math.min(bestValue, value);
                    beta = Math.min(beta, bestValue);

                    if (beta <= alpha) {
                        break;
                    }
                }
            } else {
                const value = alphaBeta(matchCopy, depth - 1, true, alpha, beta);

                bestValue = Math.min(bestValue, value);
                beta = Math.min(beta, bestValue);
            }

            if (beta <= alpha) {
                break;
            }
        }

        return bestValue;
    }
}

export function V(
    network: NeuralNetwork,
    match: Match,
): number {
    return network.predict(match.state);
}

export const chooseTDMove = (
    network: NeuralNetwork,
    match: Match,
    player: Binary,
    epsilon: number = 0.1,
): [number, Movement] => {

    if(match.getCurrentPlayerAgent().mode==0){
        if(epsilon>Math.random()){
            const randomMove = getRandomMove(match);
            const randomCapture = getRandomCapture(match);
            return [randomCapture, randomMove];
        }
    }

    const legalMoves = GenerateLegalMoves(match, player);
    const actionvalues: { move: Movement; capture: number; value: number }[] = [];

    let bestMove = legalMoves[0];
    let bestCapture = -1;

    let bestValue: number;

    const firstMatchCopy = copyMatch(match);

    firstMatchCopy.doMoveOrCapture(
        bestMove,
        -1,
    );

    const firstCaptures =
        GenerateLegalCaptures(firstMatchCopy, player);

    if (firstCaptures.length === 0) {

        bestValue = V(network, firstMatchCopy);
        actionvalues.push({
            move: bestMove,
            capture: -1,
            value: bestValue,
        });

    } else {

        const firstCapture =
            firstCaptures[0];

        const captureMatchCopy = copyMatch(firstMatchCopy);

        captureMatchCopy.doMoveOrCapture(bestMove, firstCapture);

        bestValue = V(network, captureMatchCopy);

        bestCapture = firstCapture;
        actionvalues.push({
            move: bestMove,
            capture: bestCapture,
            value: bestValue,
        });
    }

    /*
     * Evaluate every other legal move.
     */
    for (let i = 1; i < legalMoves.length; i++) {

        const move = legalMoves[i];

        const matchCopy = copyMatch(match);

        /*
         * First make the movement.
         */
        matchCopy.doMoveOrCapture(move, -1);

        /*
         * Now check whether a capture is available.
         */
        const captures = GenerateLegalCaptures(matchCopy, player);

        /*
         * No capture required.
         */
        if (captures.length === 0) {

            const value = V(network, matchCopy);

            actionvalues.push({
                move: move,
                capture: -1,
                value: value,
            });

            if (value >= bestValue) {
                bestValue = value;
                bestMove = move;
                bestCapture = -1;
            }

            continue;
        }

        /*
         * A mill was formed.
         *
         * We must consider every legal capture.
         */
        for (let j = 0; j < captures.length; j++) {
            const captureMatchCopy = copyMatch(matchCopy);

            const capture = captures[j];
            captureMatchCopy.doMoveOrCapture(move, capture);

            const value = V(network, captureMatchCopy);           

            if (value >= bestValue) {
                bestValue = value;
                bestMove = move;
                bestCapture = capture;
            }

            actionvalues.push({
                move: move,
                capture: capture,
                value: value,
            });
        }
    }
    return [bestCapture, bestMove];
};

export function makeTDTrainingMove(
    network: NeuralNetwork,
    match: Match,
    gamma: number,
    alpha: number,
    selectedMove?: [number, Movement],
): number {

    const currentState = match.state;

    const player = currentState.Player;
    

    const [capture, move] = selectedMove ?? chooseTDMove(network, match, player);

    if (move === null) {
        return 0;
    }

    const matchCopy = copyMatch(match);

    matchCopy.doMoveOrCapture(move, -1);
    matchCopy.doMoveOrCapture(move, capture);

    const nextState = matchCopy.state;
    const terminal = matchCopy.isGameOver();

    let reward = matchCopy.mill.length > 0 ? 1 : -1;

    if (matchCopy.winner !== null) {
        reward = matchCopy.winner === player ? 5 : 0;
    }

    const tdError = network.tdZeroUpdate(
        currentState,
        nextState,
        reward,
        gamma,
        alpha,
        terminal,
    );

    return tdError;
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
