/*
 * Turns the raw per-run CSVs into the tables you can actually put in a report.
 *
 *   npx tsx scripts/aggregate.ts
 *
 * Runs are grouped by name with the "-s<seed>" suffix stripped, so self-s1,
 * self-s2 and self-s3 are three seeds of one configuration. For each
 * configuration it reports the mean across seeds and the standard error of
 * that mean, which is what gives you error bars.
 *
 * Writes:
 *   results/summary/aggregate_eval.csv   strength per opponent, mean +/- SE
 *   results/summary/aggregate_train.csv  training diagnostics at the end
 *   results/summary/aggregate_report.txt the same thing as readable tables
 *
 * Reported twice on purpose:
 *   final = the last checkpoint. Honest.
 *   best  = the best checkpoint. Flattered, because taking a maximum over many
 *           noisy evaluations partly selects luck. Quote "final" in the report
 *           and mention "best" only as the model you shipped.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { arg, list, reportConfig } from "./cli";

const resultsDir = arg("dir", "results");
const only = list("only", "");
const outDir = path.join(resultsDir, "summary");

reportConfig({ dir: resultsDir, only: only.length ? only : ["(all runs)"], out: outDir });

type Row = Record<string, string>;

function readCsv(file: string): Row[] {
    if (!fs.existsSync(file)) return [];
    const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const head = lines[0].split(",");
    return lines.slice(1).map((l) => {
        const cells = l.split(",");
        const r: Row = {};
        head.forEach((h, i) => (r[h] = cells[i] ?? ""));
        return r;
    });
}

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
/** Standard error of the mean. Needs >= 2 seeds; one seed has no spread to report. */
function sem(a: number[]): number {
    if (a.length < 2) return NaN;
    const m = mean(a);
    const variance = a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
    return Math.sqrt(variance / a.length);
}
const f = (x: number, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : "");

/** "self-s1" -> { config: "self", seed: "1" } */
function split(run: string): { config: string; seed: string } {
    const m = /^(.*)-s(\d+)$/.exec(run);
    return m ? { config: m[1], seed: m[2] } : { config: run, seed: "" };
}

const runs = fs
    .readdirSync(resultsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "summary" && d.name !== "logs")
    .map((d) => d.name)
    .filter((n) => only.length === 0 || only.includes(n) || only.includes(split(n).config))
    .sort();

if (runs.length === 0) {
    console.error(`No run directories found in ${resultsDir}/. Train something first.`);
    process.exit(1);
}

/* ---------------- consistency check ---------------- */

/**
 * Seeds of one configuration must have been trained identically, or their mean
 * is meaningless. This catches the easy mistake of a short debug run sharing a
 * name prefix with the real runs and quietly dragging the average.
 */
const CHECKED = ["opponent", "episodes", "alpha", "alphaFinal", "gamma", "epsilon", "epsilonFinal", "lambda", "captureReward", "evalGames", "hidden", "activation"] as const;

const inconsistent: string[] = [];
{
    const byCfg = new Map<string, { run: string; cfg: Record<string, unknown> }[]>();
    for (const run of runs) {
        const file = path.join(resultsDir, run, "config.json");
        if (!fs.existsSync(file)) continue;
        try {
            const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
            const { config } = split(run);
            if (!byCfg.has(config)) byCfg.set(config, []);
            byCfg.get(config)!.push({ run, cfg });
        } catch { /* unreadable config: skip the check for this run */ }
    }
    for (const [config, entries] of byCfg) {
        if (entries.length < 2) continue;
        const base = entries[0];
        for (const other of entries.slice(1)) {
            for (const k of CHECKED) {
                const a = JSON.stringify(base.cfg[k] ?? null);
                const b = JSON.stringify(other.cfg[k] ?? null);
                if (a !== b) {
                    inconsistent.push(`${config}: ${base.run} has ${k}=${a} but ${other.run} has ${k}=${b}`);
                    break;
                }
            }
        }
    }
}

/* ---------------- strength per opponent ---------------- */

type Key = string; // `${config}|${opponent}`
const finalScores = new Map<Key, number[]>();
const bestScores = new Map<Key, number[]>();
const evalGames = new Map<Key, number>();
const seedsOf = new Map<string, Set<string>>();

for (const run of runs) {
    const { config, seed } = split(run);
    const rows = readCsv(path.join(resultsDir, run, "eval.csv"));
    if (rows.length === 0) continue;
    if (!seedsOf.has(config)) seedsOf.set(config, new Set());
    seedsOf.get(config)!.add(seed || run);

    const lastEpisode = Math.max(...rows.map((r) => +r.episode));
    for (const opp of [...new Set(rows.map((r) => r.opponent))]) {
        const mine = rows.filter((r) => r.opponent === opp);
        const key = `${config}|${opp}`;
        const final = mine.find((r) => +r.episode === lastEpisode);
        if (final) {
            if (!finalScores.has(key)) finalScores.set(key, []);
            finalScores.get(key)!.push(+final.score);
            evalGames.set(key, +final.games);
        }
        const best = Math.max(...mine.map((r) => +r.score));
        if (!bestScores.has(key)) bestScores.set(key, []);
        bestScores.get(key)!.push(best);
    }
}

const evalOut = path.join(outDir, "aggregate_eval.csv");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(evalOut, "config,opponent,seeds,games_per_eval,final_mean,final_se,best_mean,best_se\n");

const configs = [...seedsOf.keys()].sort();
const opponents = [...new Set([...finalScores.keys()].map((k) => k.split("|")[1]))];

for (const config of configs) {
    for (const opp of opponents) {
        const key = `${config}|${opp}`;
        const fin = finalScores.get(key);
        if (!fin) continue;
        const best = bestScores.get(key) ?? [];
        fs.appendFileSync(
            evalOut,
            `${config},${opp},${seedsOf.get(config)!.size},${evalGames.get(key) ?? ""},` +
            `${f(mean(fin))},${f(sem(fin))},${f(mean(best))},${f(sem(best))}\n`,
        );
    }
}

/* ---------------- training diagnostics ---------------- */

const diagOut = path.join(outDir, "aggregate_train.csv");
fs.writeFileSync(diagOut, "config,seeds,episodes,abs_td,grad_norm,zero_grad_frac,dead_l1,dead_l2,weight_l2,sec\n");

const diagRows: Record<string, number[]>[] = [];
const byConfig = new Map<string, Row[]>();
for (const run of runs) {
    const { config } = split(run);
    const rows = readCsv(path.join(resultsDir, run, "train.csv"));
    if (rows.length === 0) continue;
    if (!byConfig.has(config)) byConfig.set(config, []);
    byConfig.get(config)!.push(rows[rows.length - 1]); // last checkpoint
}
void diagRows;

for (const config of configs) {
    const last = byConfig.get(config);
    if (!last || last.length === 0) continue;
    const col = (k: string) => last.map((r) => +r[k]).filter(Number.isFinite);
    fs.appendFileSync(
        diagOut,
        [
            config, last.length, Math.max(...col("episode")),
            f(mean(col("mean_abs_td")), 5), f(mean(col("mean_grad_norm"))),
            f(mean(col("zero_grad_frac")), 4),
            f(mean(col("dead_l1"))), f(mean(col("dead_l2"))),
            f(mean(col("weight_l2")), 2), Math.round(mean(col("sec"))),
        ].join(",") + "\n",
    );
}

/* ---------------- readable report ---------------- */

const pad = (s: string, n: number) => s.padEnd(n);
const lines: string[] = [];
lines.push("STRENGTH  score = (wins + 1/2 draws) / games, mean +/- standard error across seeds");
lines.push('"final" is the last checkpoint (honest). "best" is the max over checkpoints (flattered by selection).');
lines.push("");
lines.push(pad("config", 14) + pad("seeds", 7) + opponents.map((o) => pad(`vs ${o}`, 18)).join(""));
for (const config of configs) {
    let line = pad(config, 14) + pad(String(seedsOf.get(config)!.size), 7);
    for (const opp of opponents) {
        const fin = finalScores.get(`${config}|${opp}`);
        line += pad(fin ? `${f(mean(fin))} +/-${f(sem(fin))}` : "-", 18);
    }
    lines.push(line);
}

lines.push("");
lines.push("TRAINING HEALTH at the last checkpoint (zero_grad and dead_l1 near 0 is what you want)");
lines.push("");
lines.push(pad("config", 14) + pad("eps", 8) + pad("|TD|", 10) + pad("|grad|", 10) + pad("zeroGrad", 10) + pad("dead_l1", 10) + pad("dead_l2", 10) + pad("mins", 7));
for (const config of configs) {
    const last = byConfig.get(config);
    if (!last) continue;
    const col = (k: string) => last.map((r) => +r[k]).filter(Number.isFinite);
    lines.push(
        pad(config, 14) + pad(String(Math.max(...col("episode"))), 8) +
        pad(f(mean(col("mean_abs_td")), 4), 10) + pad(f(mean(col("mean_grad_norm")), 2), 10) +
        pad(f(mean(col("zero_grad_frac")), 4), 10) +
        pad(f(mean(col("dead_l1"))), 10) + pad(f(mean(col("dead_l2"))), 10) +
        pad(String(Math.round(mean(col("sec")) / 60)), 7),
    );
}

const singles = configs.filter((c) => seedsOf.get(c)!.size < 2);
if (singles.length) {
    lines.push("");
    lines.push(`NOTE: only one seed for ${singles.join(", ")} - no standard error can be computed.`);
    lines.push("Run 3 or more seeds per configuration before quoting a difference as real.");
}

if (inconsistent.length) {
    lines.push("");
    lines.push("*** WARNING: these configurations mix seeds that were trained DIFFERENTLY. ***");
    lines.push("Their means above are not valid - you are averaging runs that are not comparable.");
    for (const m of inconsistent) lines.push(`  ${m}`);
    lines.push("Delete or rename the odd run out, then aggregate again.");
}

const report = lines.join("\n") + "\n";
fs.writeFileSync(path.join(outDir, "aggregate_report.txt"), report);
console.log("\n" + report);
console.log(`-> ${evalOut}\n-> ${diagOut}\n-> ${path.join(outDir, "aggregate_report.txt")}`);
