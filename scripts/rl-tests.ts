/*
 * Sanity checks for the engine, the TD update and the baseline agents.
 * Run:  npx tsx scripts/rl-tests.ts
 */
import * as tf from "@tensorflow/tfjs";
import {
    ADJACENT, MILLS, applyAction, capturablePoints, initialState, legalActions, mulberry32, GameState,
} from "../src/rl/engine";
import { encode, FEATURE_SIZE } from "../src/rl/features";
import { ValueNet } from "../src/rl/valueNet";
import { AlphaBetaAgent, RandomAgent, SearchTDAgent, TDAgent } from "../src/rl/agents";
import { evaluate, playGame } from "../src/rl/play";

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
    if (!ok) failed++;
}

// ---------- engine ----------
check("adjacency is symmetric", ADJACENT.every((ns, a) => ns.every((b) => ADJACENT[b].includes(a))));
check("every point has 3 or 4 neighbours", ADJACENT.every((ns) => ns.length >= 3 && ns.length <= 4));
check("point 18 is next to 17, 10, 20 (old table had 7 instead of 17)",
    ADJACENT[18].join(",") === "10,17,20", ADJACENT[18].join(","));
check("20 mills", MILLS.length === 20);

{
    // White mill on 0-1-2, White plays 16; Black has cows at 5 (free) and 8,9,10 (mill).
    const s = initialState();
    for (const p of [0, 1, 2]) s.board[p] = 1;
    for (const p of [5, 8, 9, 10]) s.board[p] = 2;
    check("cows in a mill are protected while others are free", capturablePoints(s.board, 1).join(",") === "5");
    s.board[5] = 0;
    check("if every cow is in a mill, any can be taken", capturablePoints(s.board, 1).join(",") === "8,9,10");
}

{
    const s = initialState();
    s.board[0] = 1; s.board[1] = 1; s.onBoard = [2, 1]; s.inHand = [10, 11]; s.board[20] = 2;
    const acts = legalActions(s).filter((a) => a.to === 2);
    check("completing a mill while placing gives one action per capture", acts.length === 1 && acts[0].capture === 20);
}

function consistent(s: GameState): boolean {
    let w = 0, b = 0;
    for (let i = 0; i < 24; i++) { if (s.board[i] === 1) w++; if (s.board[i] === 2) b++; }
    return w === s.onBoard[0] && b === s.onBoard[1] && s.inHand[0] >= 0 && s.inHand[1] >= 0;
}

{
    const rng = mulberry32(1);
    const results = [0, 0, 0];
    let ok = true;
    let maxPly = 0;
    for (let g = 0; g < 300; g++) {
        let s = initialState();
        while (s.result === null) {
            const acts = legalActions(s);
            s = applyAction(s, acts[Math.floor(rng() * acts.length)]);
            if (!consistent(s)) ok = false;
        }
        results[s.result]++;
        maxPly = Math.max(maxPly, s.ply);
    }
    check("300 random games all finish with consistent piece counts", ok, `W/B/draw = ${results.join("/")}, longest ${maxPly} plies`);
}

// ---------- TD update ----------
{
    const net = new ValueNet({ hidden: [64, 64], activation: "relu", seed: 3 });
    const x = encode(initialState(), 0);
    const first = net.tdStep(x, 1, 0.05);
    check("gradient is non-zero on a fresh net", first.gradNorm > 0, `|grad| = ${first.gradNorm.toFixed(3)}`);
    let last = first;
    for (let i = 0; i < 200; i++) last = net.tdStep(x, 1, 0.05);
    check("repeated TD steps move V(x) to the target", Math.abs(net.value(x) - 1) < 0.01, `V = ${net.value(x).toFixed(4)}`);
    check("no tensor leak from tdStep", (() => {
        const before = tf.memory().numTensors;
        for (let i = 0; i < 20; i++) net.tdStep(x, 0.5, 0.01);
        net.values(x, 1);
        return tf.memory().numTensors === before;
    })(), `${tf.memory().numTensors} tensors alive`);
}

{
    // Tiny chain: 5 states, reward 1 at the end, gamma 1 -> every V should reach 1.
    const net = new ValueNet({ hidden: [16], activation: "relu", seed: 7 });
    const xs = Array.from({ length: 5 }, (_, i) => { const x = new Float32Array(FEATURE_SIZE); x[i] = 1; return x; });
    for (let ep = 0; ep < 400; ep++) {
        for (let i = 0; i < 5; i++) {
            const target = i === 4 ? 1 : net.value(xs[i + 1]);
            net.tdStep(xs[i], target, 0.05);
        }
    }
    const vals = xs.map((x) => net.value(x));
    check("TD(0) learns a 5-step chain", vals.every((v) => Math.abs(v - 1) < 0.1), vals.map((v) => v.toFixed(2)).join(" "));
}

// ---------- baselines ----------
{
    const rng = mulberry32(2);
    const r1 = evaluate(new AlphaBetaAgent(1), new RandomAgent(), 40, rng);
    check("alpha-beta depth 1 beats random", r1.score > 0.85, JSON.stringify(r1));
    const t0 = Date.now();
    const r2 = evaluate(new AlphaBetaAgent(2), new AlphaBetaAgent(1), 20, rng);
    check("alpha-beta depth 2 is at least as strong as depth 1", r2.score >= 0.5, `${JSON.stringify(r2)} in ${Date.now() - t0} ms`);
}

{
    // A learning TD agent must actually change its weights during a game.
    const net = new ValueNet({ hidden: [64, 64], activation: "relu", seed: 1 });
    const before = net.toJSON().flatMap((w) => w.values);
    const td = new TDAgent(net, { epsilon: 0.1 });
    playGame(td, new RandomAgent(), mulberry32(5));
    const after = net.toJSON().flatMap((w) => w.values);
    const changed = after.filter((v, i) => v !== before[i]).length;
    const st = td.drainStats();
    check("weights change during a training game", changed > 0,
        `${changed}/${after.length} weights changed, ${st.gradNorm.length} updates, zero-grad updates: ${st.gradNorm.filter((g) => g === 0).length}`);
}

// ---------- TD(lambda) ----------
{
    const net = new ValueNet({ hidden: [64, 64], activation: "relu", seed: 1 });
    const before = net.toJSON().flatMap((w) => w.values);
    const a = new TDAgent(net, { lambda: 0.7 }, "a");
    const b = new TDAgent(net, { lambda: 0.7 }, "b");
    const t0 = tf.memory().numTensors;
    const rng = mulberry32(3);
    for (let i = 0; i < 10; i++) playGame(a, b, rng);
    const growth = tf.memory().numTensors - t0;
    const after = net.toJSON().flatMap((w) => w.values);
    const changed = after.filter((v, i) => v !== before[i]).length;
    const st = a.drainStats();
    check("TD(lambda) trains and logs non-zero gradients", changed > 0 && st.gradNorm.every((g) => g > 0),
        `${changed}/${after.length} weights changed, ${st.gradNorm.length} updates`);
    // Each agent holds one trace tensor per trainable tensor; nothing else may accumulate.
    const perAgent = net.toJSON().length;
    check("TD(lambda) traces do not leak over 10 games", growth <= 2 * perAgent + 4, `tensor growth ${growth}, 2 agents x ${perAgent} traces`);
    a.dispose();
    b.dispose();
    check("disposing a TD(lambda) agent frees its traces", tf.memory().numTensors - t0 <= 4, `${tf.memory().numTensors - t0} left`);
}

// ---------- search over V ----------
{
    const net = new ValueNet({ hidden: [64, 64], activation: "relu", seed: 4 });
    const greedy = new TDAgent(net, { epsilon: 0, learn: false }, "greedy");
    const d1 = new SearchTDAgent(net, 1);
    greedy.startGame(0);
    d1.startGame(0);
    let same = 0, n = 0;
    const r = mulberry32(11);
    for (let g = 0; g < 10; g++) {
        let s = initialState();
        while (s.result === null && n < 150) {
            if (s.toMove === 0) {
                const x = greedy.selectAction(s, mulberry32(7));
                const y = d1.selectAction(s, mulberry32(7));
                n++;
                if (x.from === y.from && x.to === y.to && x.capture === y.capture) same++;
            }
            const acts = legalActions(s);
            s = applyAction(s, acts[Math.floor(r() * acts.length)]);
        }
    }
    check("search depth 1 reduces to the greedy agent", same === n, `${same}/${n} positions agree`);

    // Deeper search over the same V should not be weaker against a random opponent.
    const rng = mulberry32(6);
    const s1 = evaluate(new SearchTDAgent(net, 1), new RandomAgent(), 30, rng, undefined, 4);
    const s2 = evaluate(new SearchTDAgent(net, 2), new RandomAgent(), 30, rng, undefined, 4);
    check("search depth 2 is not worse than depth 1 on an untrained net", s2.score >= s1.score - 0.25,
        `d1 ${s1.score.toFixed(2)} vs d2 ${s2.score.toFixed(2)}`);
}

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
