/*
 * Headless TD(0) trainer with periodic evaluation.
 *
 *   npx tsx scripts/train.ts --opponent self --episodes 3000 --name selfplay
 *   npx tsx scripts/train.ts --opponent ab1  --episodes 3000 --name vs-ab1
 *
 * --opponent       self | random | ab1 | ab2 | ab3   (who the agent trains against)
 * --episodes       training games                    (default 2000)
 * --eval-every     evaluate every N episodes         (default 100)
 * --eval-games     games per evaluation opponent     (default 40, colours alternate)
 * --eval-vs        comma list of eval opponents      (default random,ab1,ab2)
 * --alpha --gamma --epsilon --capture-reward          TD settings
 * --hidden 64,64   --activation relu|tanh   --seed N  --name run-name
 *
 * Writes results/<name>/{config.json, train.csv, eval.csv, weights.json, best-weights.json}
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { mulberry32 } from "../src/rl/engine";
import { encode, FEATURE_SIZE } from "../src/rl/features";
import { ValueNet } from "../src/rl/valueNet";
import { Agent, AlphaBetaAgent, RandomAgent, TDAgent, outcomeFor } from "../src/rl/agents";
import { evaluate, playGame } from "../src/rl/play";
import { initialState, legalActions, applyAction } from "../src/rl/engine";

function arg(name: string, def: string): string {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
}

const cfg = {
    name: arg("name", `run-${Date.now()}`),
    opponent: arg("opponent", "self"),
    episodes: +arg("episodes", "2000"),
    evalEvery: +arg("eval-every", "100"),
    evalGames: +arg("eval-games", "40"),
    evalVs: arg("eval-vs", "random,ab1,ab2").split(","),
    alpha: +arg("alpha", "0.01"),
    gamma: +arg("gamma", "0.99"),
    epsilon: +arg("epsilon", "0.1"),
    captureReward: +arg("capture-reward", "0.05"),
    hidden: arg("hidden", "64,64").split(",").map(Number),
    activation: arg("activation", "relu") as "relu" | "tanh",
    seed: +arg("seed", "1"),
};

const outDir = path.join("results", cfg.name);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "config.json"), JSON.stringify(cfg, null, 2));

function makeBaseline(name: string): Agent {
    if (name === "random") return new RandomAgent();
    const m = /^ab(\d)$/.exec(name);
    if (m) return new AlphaBetaAgent(+m[1]);
    throw new Error(`unknown opponent ${name}`);
}

const rng = mulberry32(cfg.seed);
const evalRng = mulberry32(cfg.seed + 1000);
const net = new ValueNet({ hidden: cfg.hidden, activation: cfg.activation, seed: cfg.seed });
const tdOpts = { alpha: cfg.alpha, gamma: cfg.gamma, epsilon: cfg.epsilon, captureReward: cfg.captureReward, learn: true };

// Self-play: the same network plays (and learns from) both colours.
const learnerA = new TDAgent(net, tdOpts, "td");
const learnerB = new TDAgent(net, tdOpts, "td");
const trainOpponent: Agent | null = cfg.opponent === "self" ? null : makeBaseline(cfg.opponent);
const greedy = new TDAgent(net, { ...tdOpts, epsilon: 0, learn: false }, "td-greedy");
const evalOpponents = cfg.evalVs.map((n) => ({ name: n, agent: makeBaseline(n) }));

// A fixed set of positions to watch V(s) and dead ReLUs on.
const probe = (() => {
    const r = mulberry32(99);
    const xs = new Float32Array(FEATURE_SIZE * 200);
    let k = 0;
    while (k < 200) {
        let s = initialState();
        while (s.result === null && k < 200) {
            const acts = legalActions(s);
            s = applyAction(s, acts[Math.floor(r() * acts.length)]);
            if (r() < 0.2) encode(s, (1 - s.toMove) as 0 | 1, xs, FEATURE_SIZE * k++);
        }
    }
    return xs;
})();
const startX = encode(applyAction(initialState(), { from: -1, to: 0, capture: -1 }), 0);

const trainCsv = path.join(outDir, "train.csv");
const evalCsv = path.join(outDir, "eval.csv");
fs.writeFileSync(trainCsv, "episode,games,learner_score,avg_plies,mean_abs_td,mean_grad_norm,zero_grad_frac,updates_per_game,v_opening,weight_l2,dead_l1,dead_l2,sec\n");
fs.writeFileSync(evalCsv, "episode,opponent,games,wins,draws,losses,win_rate,score,avg_plies\n");

function runEval(ep: number): number {
    let total = 0;
    for (const { name, agent } of evalOpponents) {
        const r = evaluate(greedy, agent, cfg.evalGames, evalRng);
        fs.appendFileSync(evalCsv, `${ep},${name},${r.games},${r.wins},${r.draws},${r.losses},${r.winRate.toFixed(3)},${r.score.toFixed(3)},${r.avgPlies.toFixed(1)}\n`);
        total += r.score;
    }
    return total / evalOpponents.length;
}

let best = runEval(0);
fs.writeFileSync(path.join(outDir, "best-weights.json"), JSON.stringify(net.toJSON()));
const t0 = Date.now();
let window = { games: 0, score: 0, plies: 0 };

for (let ep = 1; ep <= cfg.episodes; ep++) {
    const learnerWhite = ep % 2 === 1;
    let rec;
    if (!trainOpponent) {
        rec = playGame(learnerA, learnerB, rng);
        window.score += 0.5; // self-play: always half
    } else {
        rec = learnerWhite ? playGame(learnerA, trainOpponent, rng) : playGame(trainOpponent, learnerA, rng);
        const o = outcomeFor(rec.final, learnerWhite ? 0 : 1);
        window.score += o > 0 ? 1 : o === 0 ? 0.5 : 0;
    }
    window.games++;
    window.plies += rec.plies;

    if (ep % cfg.evalEvery === 0 || ep === cfg.episodes) {
        const st = [learnerA.drainStats(), learnerB.drainStats()];
        const deltas = st.flatMap((s) => s.absDelta);
        const grads = st.flatMap((s) => s.gradNorm);
        const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
        const dead = net.deadUnitFraction(probe, 200);
        fs.appendFileSync(
            trainCsv,
            [
                ep, window.games, (window.score / window.games).toFixed(3), (window.plies / window.games).toFixed(1),
                mean(deltas).toFixed(5), mean(grads).toFixed(5),
                (grads.filter((g) => g === 0).length / Math.max(1, grads.length)).toFixed(4),
                (grads.length / window.games).toFixed(1), net.value(startX).toFixed(4), net.weightL2().toFixed(3),
                dead[0]?.toFixed(3) ?? "", dead[1]?.toFixed(3) ?? "", ((Date.now() - t0) / 1000).toFixed(0),
            ].join(",") + "\n",
        );
        const avgScore = runEval(ep);
        if (avgScore > best) {
            best = avgScore;
            fs.writeFileSync(path.join(outDir, "best-weights.json"), JSON.stringify(net.toJSON()));
        }
        console.log(
            `[${cfg.name}] ep ${ep}  |td|=${mean(deltas).toFixed(4)}  |grad|=${mean(grads).toFixed(3)}  ` +
            `zeroGrad=${(grads.filter((g) => g === 0).length / Math.max(1, grads.length)).toFixed(3)}  ` +
            `dead=${dead.map((d) => d.toFixed(2)).join("/")}  evalScore=${avgScore.toFixed(3)}  ${((Date.now() - t0) / 1000).toFixed(0)}s`,
        );
        window = { games: 0, score: 0, plies: 0 };
    }
}

fs.writeFileSync(path.join(outDir, "weights.json"), JSON.stringify(net.toJSON()));
console.log(`done -> ${outDir}`);
