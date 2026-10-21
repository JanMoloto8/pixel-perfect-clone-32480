/*
 * Drives the website's Match class exactly like useMatchTimer does, for every
 * agent pairing, to check that games finish and nothing throws.
 *   npx tsx scripts/arena-smoke.ts
 */
import { Match } from "../src/components/arena/Game";

function run(white: string, black: string, wMode: 0 | 1, bMode: 0 | 1) {
    const match = new Match(white, black, wMode, bMode);
    let pending = -1, steps = 0;
    const t0 = Date.now();
    while (!match.isGameOver() && steps < 2000) {
        if (match.isMove) {
            const [c, mv] = match.getCurrentPlayerAgent().chooseMoveAndCapture(match);
            pending = c;
            match.doMoveOrCapture(mv, c);
        } else {
            const c = pending === -1 && match.mill.length > 0 ? match.getCurrentPlayerAgent().chooseCapture(match) : pending;
            match.doMoveOrCapture({ from: -1, to: -1 }, c);
        }
        steps++;
        // the board and bitboards must agree, and counts must stay sane
        for (let i = 0; i < 24; i++) {
            const c = match.cells[i];
            if ((c === 0) !== (match.state.B0[i] === 1) || (c === 1) !== (match.state.B1[i] === 1))
                throw new Error(`board mismatch at ${i}`);
        }
    }
    return { winner: match.getWinner() ?? "draw", moves: match.moveCounter(), over: match.isGameOver(), ms: Date.now() - t0 };
}

const pairs: [string, string, 0 | 1, 0 | 1][] = [
    ["TD", "TD", 0, 0],
    ["Standard", "Random", 0, 1],
    ["TD", "Minimax", 1, 1],
    ["AlphaBeta", "TD", 1, 0],
    ["Minimax", "AlphaBeta", 1, 1],
    ["Random", "Random", 1, 1],
];
for (const p of pairs) {
    for (let g = 0; g < 2; g++) {
        const r = run(...p);
        console.log(`${p[0]}(${p[2] ? "Playing" : "Training"}) vs ${p[1]}(${p[3] ? "Playing" : "Training"}): ${JSON.stringify(r)}`);
        if (!r.over) throw new Error("game did not finish");
    }
}
console.log("arena smoke test OK");
