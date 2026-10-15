/*
 * Does searching over the learned V help, without retraining anything?
 *
 *   npx tsx scripts/search-eval.ts --weights public/models/td-agent.json --games 100
 *
 * Takes an already-trained value net and plays it at several search depths
 * against the baselines. Depth 1 is the plain greedy agent, so the depth-1 row
 * reproduces the original result and every row above it isolates the value of
 * search alone.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { mulberry32, initialState, legalActions, applyAction } from "../src/rl/engine";
import { ValueNet } from "../src/rl/valueNet";
import { Agent, AlphaBetaAgent, RandomAgent, SearchTDAgent, TDAgent } from "../src/rl/agents";
import { evaluate } from "../src/rl/play";

function arg(name: string, def: string): string {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
}

const weightsFile = arg("weights", "public/models/td-agent.json");
const games = +arg("games", "100");
const depths = arg("depths", "1,2,3").split(",").map(Number);
const baselines = arg("baselines", "random,ab1,ab2,ab3").split(",").filter(Boolean);
const opening = +arg("opening", "4");
const out = arg("out", "results/summary/search_eval.csv");

const net = new ValueNet();
const raw = JSON.parse(fs.readFileSync(weightsFile, "utf8"));
if (!net.loadJSON(raw.weights ?? raw)) throw new Error(`could not load ${weightsFile}`);
console.log(`loaded ${weightsFile}`);

function baseline(n: string): Agent {
    if (n === "random") return new RandomAgent();
    return new AlphaBetaAgent(+n.replace("ab", ""));
}

/* Sanity check: depth 1 must choose exactly what the greedy agent chooses. */
{
    const greedy = new TDAgent(net, { epsilon: 0, learn: false }, "greedy");
    const d1 = new SearchTDAgent(net, 1);
    const r = mulberry32(42);
    let checked = 0, same = 0;
    for (let g = 0; g < 20; g++) {
        let s = initialState();
        greedy.startGame(0);
        d1.startGame(0);
        while (s.result === null && checked < 400) {
            if (s.toMove === 0) {
                // Same rng seed for both so random tie-breaks line up.
                const a = greedy.selectAction(s, mulberry32(7));
                const b = d1.selectAction(s, mulberry32(7));
                checked++;
                if (a.from === b.from && a.to === b.to && a.capture === b.capture) same++;
            }
            const acts = legalActions(s);
            s = applyAction(s, acts[Math.floor(r() * acts.length)]);
        }
    }
    console.log(`depth-1 agrees with greedy on ${same}/${checked} positions`);
    if (same !== checked) throw new Error("depth 1 should reduce to greedy selection");
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "depth,opponent,games,wins,draws,losses,score,se,avg_plies,sec_per_game\n");

for (const depth of depths) {
    const agent = new SearchTDAgent(net, depth);
    for (const b of baselines) {
        const rng = mulberry32(7); // same games for every depth, so rows are comparable
        const t0 = Date.now();
        const r = evaluate(agent, baseline(b), games, rng, undefined, opening);
        const secPerGame = (Date.now() - t0) / 1000 / games;
        // Standard error of the score, for honest error bars.
        const se = Math.sqrt((r.score * (1 - r.score)) / games);
        fs.appendFileSync(
            out,
            `${depth},${b},${r.games},${r.wins},${r.draws},${r.losses},${r.score.toFixed(3)},${se.toFixed(3)},${r.avgPlies.toFixed(1)},${secPerGame.toFixed(2)}\n`,
        );
        console.log(
            `depth ${depth}  vs ${b.padEnd(7)} W/D/L ${String(r.wins).padStart(3)}/${String(r.draws).padStart(3)}/${String(r.losses).padStart(3)}` +
            `  score ${r.score.toFixed(3)} +/- ${se.toFixed(3)}  (${secPerGame.toFixed(2)}s/game)`,
        );
    }
}
console.log(`-> ${out}`);
