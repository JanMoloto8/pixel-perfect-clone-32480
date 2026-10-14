/*
 * Round-robin between trained agents and the baselines.
 *
 *   npx tsx scripts/compare.ts --runs self-s1,self-s2,random-s1,ab1-s1 --games 100
 *
 * Each trained agent plays greedily (no exploration, no learning) using
 * results/<run>/best-weights.json (use --final to take weights.json instead).
 * Colours alternate every game. Writes results/compare.csv with one row per
 * pairing: score = (wins + 0.5 * draws) / games for the row agent.
 * --rows a,b and --out file.csv let you split one tournament over processes.
 * --opening N (default 4) random plies start each game, so games differ.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { mulberry32 } from "../src/rl/engine";
import { ValueNet } from "../src/rl/valueNet";
import { Agent, AlphaBetaAgent, RandomAgent, TDAgent } from "../src/rl/agents";
import { evaluate } from "../src/rl/play";

function arg(name: string, def: string): string {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
}

const runs = arg("runs", "").split(",").filter(Boolean);
/** Optional subset of runs to use as the row agent (lets you split the work over processes). */
const rows = arg("rows", "").split(",").filter(Boolean);
const games = +arg("games", "100");
const baselines = arg("baselines", "random,ab1,ab2,ab3").split(",").filter(Boolean);
const useFinal = process.argv.includes("--final");
/** Random plies at the start of every game so greedy agents don't replay the same game. */
const opening = +arg("opening", "4");
const rng = mulberry32(+arg("seed", "7"));

const players: { name: string; agent: Agent }[] = [];
for (const run of runs) {
    const file = path.join("results", run, useFinal ? "weights.json" : "best-weights.json");
    const net = new ValueNet();
    if (!net.loadJSON(JSON.parse(fs.readFileSync(file, "utf8")))) throw new Error(`could not load ${file}`);
    players.push({ name: run, agent: new TDAgent(net, { epsilon: 0, learn: false }, run) });
}
const opponents: { name: string; agent: Agent }[] = [
    ...baselines.map((b) => ({
        name: b,
        agent: b === "random" ? new RandomAgent() : (new AlphaBetaAgent(+b.replace("ab", "")) as Agent),
    })),
    ...players,
];

const out = path.join("results", arg("out", "compare.csv"));
fs.writeFileSync(out, "agent,opponent,games,wins,draws,losses,score,avg_plies\n");
for (const p of players.filter((x) => rows.length === 0 || rows.includes(x.name))) {
    for (const o of opponents) {
        if (o.name === p.name) continue;
        const r = evaluate(p.agent, o.agent, games, rng, undefined, opening);
        fs.appendFileSync(out, `${p.name},${o.name},${r.games},${r.wins},${r.draws},${r.losses},${r.score.toFixed(3)},${r.avgPlies.toFixed(1)}\n`);
        console.log(`${p.name.padEnd(12)} vs ${o.name.padEnd(12)} W/D/L ${r.wins}/${r.draws}/${r.losses}  score ${r.score.toFixed(3)}`);
    }
}
console.log(`-> ${out}`);
