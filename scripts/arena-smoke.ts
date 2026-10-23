/*
 * Drives the website's Match class exactly like useMatchTimer does, for every
 * agent pairing, to check that games finish, nothing throws, and the per-episode
 * stats rows are produced.
 *   npx tsx scripts/arena-smoke.ts
 */
import { AgentSetup, Match, sessionStats } from "../src/components/arena/Game";
import { Algorithm } from "../src/types/Algorithm";
import { AgentConfig, DEFAULT_AGENT_CONFIG } from "../src/types/AgentConfig";
import { isTrainingRow } from "../src/rl/episodeStats";

type Mode = 0 | 1; // 0 = training, 1 = playing

function setup(algorithm: Algorithm, mode: Mode, config: Partial<AgentConfig> = {}): AgentSetup {
    return { algorithm, mode, config: { ...DEFAULT_AGENT_CONFIG, ...config } };
}

function run(white: AgentSetup, black: AgentSetup, episode: number, total: number) {
    const match = new Match(white, black, episode, total);
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

const label = (s: AgentSetup) => `${s.algorithm}(${s.mode ? "Playing" : "Training"})`;

const pairs: [AgentSetup, AgentSetup][] = [
    [setup(Algorithm.TD, 0), setup(Algorithm.TD, 0)],
    [setup(Algorithm.TD, 0), setup(Algorithm.RANDOM, 1)],
    [setup(Algorithm.TD_SEARCH, 0, { searchDepth: 2 }), setup(Algorithm.MINIMAX, 1, { searchDepth: 2 })],
    [setup(Algorithm.MINIMAX, 1, { searchDepth: 2 }), setup(Algorithm.TD, 1)],
    [setup(Algorithm.RANDOM, 1), setup(Algorithm.RANDOM, 1)],
    // Non-default architecture and activation: catches shape or activation bugs.
    [setup(Algorithm.TD, 0, { hiddenLayers: [32, 16, 8], activation: "tanh", lambda: 0.7 }), setup(Algorithm.RANDOM, 1)],
];

for (const [white, black] of pairs) {
    for (let g = 0; g < 2; g++) {
        const r = run(white, black, g, 2);
        console.log(`${label(white)} vs ${label(black)}: ${JSON.stringify(r)}`);
        if (!r.over) throw new Error("game did not finish");
    }
}

/* Every finished episode must have produced a stats row for both sides. */
for (const player of [0, 1] as const) {
    const stats = sessionStats(player);
    if (!stats || stats.rows.length === 0) throw new Error(`no stats rows for player ${player}`);
    const last = stats.rows[stats.rows.length - 1];
    const kind = isTrainingRow(last) ? "training" : "playing";
    if (isTrainingRow(last) && !(last.updates_per_game > 0)) {
        throw new Error(`training row for player ${player} logged no updates`);
    }
    console.log(`player ${player}: ${stats.rows.length} ${kind} rows, last episode ${last.episode}`);
    const csv = stats.toCsv().trim().split("\n");
    console.log(`  csv header: ${csv[0]}`);
}

console.log("arena smoke test OK");
