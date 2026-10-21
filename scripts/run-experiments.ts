/*
 * Runs a whole training matrix in one go, then aggregates it.
 *
 *   npx tsx scripts/run-experiments.ts                        # the default matrix
 *   npx tsx scripts/run-experiments.ts --seeds "1,2,3"
 *   npx tsx scripts/run-experiments.ts --opponents "self" --lambdas "0,0.7,1"
 *   npx tsx scripts/run-experiments.ts --dry-run              # just list the plan
 *
 * Runs are sequential on purpose: training is CPU-bound and running several at
 * once makes all of them slower without finishing sooner.
 *
 * Already-completed runs are skipped, so if you stop this half way (Ctrl-C) you
 * can start it again and it picks up where it left off. Use --force to redo
 * everything.
 *
 * Naming: <opponent>[-lam<NN>]-s<seed>, e.g. self-s1, self-lam07-s2. The
 * aggregator strips the "-s<seed>" part, so seeds of one setting group together.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { arg, flag, list, reportConfig } from "./cli";

const seeds = list("seeds", "1,2,3");
const opponents = list("opponents", "self,random,ab1,ab2");
const lambdas = list("lambdas", "0").map(Number);
const episodes = +arg("episodes", "2000");
const evalEvery = +arg("eval-every", "250");
const evalGames = +arg("eval-games", "100");
const evalVs = list("eval-vs", "random,ab1,ab2");
const alphaFinal = arg("alpha-final", "0.002");
const epsilonFinal = arg("epsilon-final", "0.02");
const dryRun = flag("dry-run");
const force = flag("force");

reportConfig({ seeds, opponents, lambdas, episodes, evalEvery, evalGames, evalVs, alphaFinal, epsilonFinal, dryRun, force });

/** lambda 0 keeps the plain name; anything else gets a -lamNN tag. */
function runName(opponent: string, lambda: number, seed: string): string {
    const tag = lambda === 0 ? "" : `-lam${String(Math.round(lambda * 10)).padStart(2, "0")}`;
    return `${opponent}${tag}-s${seed}`;
}

type Job = { name: string; args: string[] };
const jobs: Job[] = [];
for (const opponent of opponents) {
    for (const lambda of lambdas) {
        for (const seed of seeds) {
            const name = runName(opponent, lambda, seed);
            jobs.push({
                name,
                args: [
                    "scripts/train.ts",
                    "--opponent", opponent,
                    "--episodes", String(episodes),
                    "--eval-every", String(evalEvery),
                    "--eval-games", String(evalGames),
                    "--eval-vs", evalVs.join(","),
                    "--lambda", String(lambda),
                    "--alpha-final", alphaFinal,
                    "--epsilon-final", epsilonFinal,
                    "--seed", seed,
                    "--name", name,
                ],
            });
        }
    }
}

/**
 * Settings that have to match for two runs to belong in the same table. An
 * existing run trained with different ones is not reusable: mixing a 5000-episode
 * run with a 2000-episode run in one comparison is a silent methodology bug.
 */
const COMPARED_FIELDS = ["opponent", "episodes", "alpha", "alphaFinal", "gamma", "epsilon", "epsilonFinal", "lambda", "captureReward", "evalGames", "seed"] as const;

/** Rebuilds the config this job would produce, for comparison with one on disk. */
function wantedConfig(job: Job): Record<string, unknown> {
    const get = (k: string) => {
        const i = job.args.indexOf(`--${k}`);
        return i >= 0 ? job.args[i + 1] : undefined;
    };
    return {
        opponent: get("opponent"),
        episodes: +get("episodes")!,
        alpha: 0.01,
        alphaFinal: +alphaFinal,
        gamma: 0.99,
        epsilon: 0.1,
        epsilonFinal: +epsilonFinal,
        lambda: +get("lambda")!,
        captureReward: 0.05,
        evalGames: +get("eval-games")!,
        seed: +get("seed")!,
    };
}

type State = { done: boolean; mismatch: string[] };

function inspect(job: Job): State {
    const dir = path.join("results", job.name);
    if (!fs.existsSync(path.join(dir, "weights.json"))) return { done: false, mismatch: [] };
    const cfgFile = path.join(dir, "config.json");
    if (!fs.existsSync(cfgFile)) return { done: true, mismatch: ["(no config.json to check)"] };
    let onDisk: Record<string, unknown>;
    try {
        onDisk = JSON.parse(fs.readFileSync(cfgFile, "utf8"));
    } catch {
        return { done: true, mismatch: ["(unreadable config.json)"] };
    }
    const want = wantedConfig(job);
    const mismatch: string[] = [];
    for (const k of COMPARED_FIELDS) {
        const a = onDisk[k];
        const b = want[k];
        // A run from before a field existed records undefined; treat that as a mismatch
        // only when the value we want is not the field's old default.
        if (a === undefined && (k === "lambda" ? b === 0 : k === "alphaFinal" ? b === onDisk.alpha : k === "epsilonFinal" ? b === onDisk.epsilon : false)) continue;
        if (String(a) !== String(b)) mismatch.push(`${k}: on disk ${a}, want ${b}`);
    }
    return { done: true, mismatch };
}

const states = new Map<string, State>(jobs.map((j) => [j.name, inspect(j)]));
const reusable = jobs.filter((j) => states.get(j.name)!.done && states.get(j.name)!.mismatch.length === 0);
const stale = jobs.filter((j) => states.get(j.name)!.done && states.get(j.name)!.mismatch.length > 0);
const missing = jobs.filter((j) => !states.get(j.name)!.done);

// Stale runs are redone by default: they cannot be compared against the new ones.
const todo = force ? jobs : [...missing, ...stale];

console.log(`\n${jobs.length} run(s) in the matrix:`);
for (const j of todo) console.log(`  ${j.name}${states.get(j.name)!.done ? "  (redo - settings differ)" : ""}`);
if (reusable.length && !force) {
    console.log(`\n${reusable.length} run(s) already match these settings and will be reused:`);
    for (const j of reusable) console.log(`  ${j.name}`);
}
if (stale.length && !force) {
    console.log(`\n${stale.length} existing run(s) were trained with DIFFERENT settings and will be overwritten,`);
    console.log(`because a run trained differently cannot share a table with these:`);
    for (const j of stale) {
        console.log(`  ${j.name}`);
        for (const m of states.get(j.name)!.mismatch.slice(0, 4)) console.log(`      ${m}`);
    }
    console.log(`  Move results/ aside first if you want to keep the old numbers.`);
}

if (dryRun) {
    console.log("\n--dry-run: nothing was executed.");
    process.exit(0);
}
if (todo.length === 0) {
    console.log("\nNothing to do. Aggregating what is already there.");
}

const t0 = Date.now();
const durations: number[] = [];
let failed = 0;

for (let i = 0; i < todo.length; i++) {
    const job = todo[i];
    const eta = durations.length
        ? `  ~${Math.round(((todo.length - i) * (durations.reduce((a, b) => a + b, 0) / durations.length)) / 60000)} min left`
        : "";
    console.log(`\n[${i + 1}/${todo.length}] ${job.name}${eta}`);
    const started = Date.now();
    const r = spawnSync("npx", ["tsx", ...job.args], { stdio: "inherit", shell: process.platform === "win32" });
    const took = Date.now() - started;
    if (r.status !== 0) {
        failed++;
        console.error(`  FAILED (exit ${r.status}). Continuing with the rest.`);
    } else {
        durations.push(took);
        console.log(`  done in ${Math.round(took / 1000)}s`);
    }
}

console.log(`\nMatrix finished in ${Math.round((Date.now() - t0) / 60000)} min` + (failed ? `, ${failed} run(s) failed` : "") + ".");

console.log("\nAggregating...\n");
spawnSync("npx", ["tsx", "scripts/aggregate.ts"], { stdio: "inherit", shell: process.platform === "win32" });

if (failed) process.exit(1);
