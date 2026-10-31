/**
 * CLI experiment runner â€” runs one experiment config and saves results to disk.
 *
 * Usage: npx tsx run-experiment.ts <experiment-number>
 *
 * Reads config from the EXPERIMENT_CONFIGS array, runs via ExperimentRunner,
 * writes CSVs, weights JSON, and a summary JSON to the output directory.
 */

import {
    ExperimentConfig,
    ExperimentRunner,
    ExperimentProgress,
    RunResult,
    DEFAULT_EXPERIMENT_CONFIG,
    trainingStatsToCsv,
    evalCheckpointsToCsv,
} from "../src/rl/experiment";
import * as fs from "fs";
import * as path from "path";

const EXPERIMENT_CONFIGS: ExperimentConfig[] = [
    {
        // Experiment 1: 100k, [40], sigmoid
        ...DEFAULT_EXPERIMENT_CONFIG,
        name: "exp1-40-sigmoid-100k",
        runs: 5,
        totalEpisodes: 20000,
        evalInterval: 10000,
        evalGames: 100,
        trainOpponent: "self",
        evalOpponents: ["random", "ab1", "ab2", "ab3"],
        learnerAlgorithm: "TD",
        searchDepth: 2,
        hiddenLayers: [40],
        activation: "sigmoid",
        alpha: 0.1,
        alphaFinal: 0.1,
        gamma: 0.99,
        lambda: 0.6,
        epsilon: 0.6,
        epsilonFinal: 0.1,
        captureReward: 0.05,
        seed: 1,
        randomOpening: 0,
    },
    {
        // Experiment 2: 100k, [80], sigmoid
        ...DEFAULT_EXPERIMENT_CONFIG,
        name: "exp2-80-sigmoid-100k",
        runs: 5,
        totalEpisodes: 20000,
        evalInterval: 10000,
        evalGames: 100,
        trainOpponent: "self",
        evalOpponents: ["random", "ab1", "ab2", "ab3"],
        learnerAlgorithm: "TD",
        searchDepth: 2,
        hiddenLayers: [80],
        activation: "sigmoid",
        alpha: 0.1,
        alphaFinal: 0.1,
        gamma: 0.99,
        lambda: 0.6,
        epsilon: 0.6,
        epsilonFinal: 0.1,
        captureReward: 0.05,
        seed: 1,
        randomOpening: 0,
    },
    {
        // Experiment 3: 300k, [40], sigmoid
        ...DEFAULT_EXPERIMENT_CONFIG,
        name: "exp3-40-sigmoid-300k",
        runs: 5,
        totalEpisodes: 60000,
        evalInterval: 30000,
        evalGames: 100,
        trainOpponent: "self",
        evalOpponents: ["random", "ab1", "ab2", "ab3"],
        learnerAlgorithm: "TD",
        searchDepth: 2,
        hiddenLayers: [40],
        activation: "sigmoid",
        alpha: 0.1,
        alphaFinal: 0.1,
        gamma: 0.99,
        lambda: 0.6,
        epsilon: 0.6,
        epsilonFinal: 0.1,
        captureReward: 0.05,
        seed: 1,
        randomOpening: 0,
    },
    {
        // Experiment 4: 300k, [80], sigmoid
        ...DEFAULT_EXPERIMENT_CONFIG,
        name: "exp4-80-sigmoid-300k",
        runs: 5,
        totalEpisodes: 60000,
        evalInterval: 30000,
        evalGames: 100,
        trainOpponent: "self",
        evalOpponents: ["random", "ab1", "ab2", "ab3"],
        learnerAlgorithm: "TD",
        searchDepth: 2,
        hiddenLayers: [80],
        activation: "sigmoid",
        alpha: 0.1,
        alphaFinal: 0.1,
        gamma: 0.99,
        lambda: 0.6,
        epsilon: 0.6,
        epsilonFinal: 0.1,
        captureReward: 0.05,
        seed: 1,
        randomOpening: 0,
    },
];

function main() {
    const expNum = parseInt(process.argv[2], 10);
    if (isNaN(expNum) || expNum < 1 || expNum > 4) {
        console.error("Usage: npx tsx run-experiment.ts <1|2|3|4>");
        process.exit(1);
    }

    const config = EXPERIMENT_CONFIGS[expNum - 1];
    const outDir = path.join(process.cwd(), "results", config.name);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`\n=== Experiment ${expNum}: ${config.name} ===`);
    console.log(`  ${config.runs} runs Ã— ${config.totalEpisodes} episodes = ${config.runs * config.totalEpisodes} total`);
    console.log(`  Architecture: [${config.hiddenLayers.join(",")}] ${config.activation}`);
    console.log(`  Eval opponents: ${config.evalOpponents.join(", ")}`);
    console.log(`  Output: ${outDir}\n`);

    const t0 = Date.now();
    let lastProgressLog = 0;

    const runner = new ExperimentRunner(config, {
        onProgress: (p: ExperimentProgress) => {
            const now = Date.now();
            // Log progress every 30 seconds
            if (now - lastProgressLog > 30_000) {
                const pct = (p.overallProgress * 100).toFixed(1);
                const elapsed = ((now - t0) / 1000).toFixed(0);
                console.log(`  [${elapsed}s] Run ${p.run + 1}/${config.runs}, ep ${p.episode}/${config.totalEpisodes} (${pct}% overall) â€” ${p.phase}`);
                lastProgressLog = now;
            }
        },
        onRunComplete: (result: RunResult) => {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
            console.log(`  [${elapsed}s] Run ${result.runIndex + 1} complete (${(result.elapsedMs / 1000).toFixed(1)}s, best score ${result.bestScore.toFixed(3)})`);

            // Save per-run CSVs
            const trainCsv = trainingStatsToCsv(result.trainingStats);
            fs.writeFileSync(path.join(outDir, `run${result.runIndex + 1}-training.csv`), trainCsv);

            const evalCsv = evalCheckpointsToCsv(result.checkpoints);
            fs.writeFileSync(path.join(outDir, `run${result.runIndex + 1}-eval.csv`), evalCsv);
        },
        onError: (err: string) => {
            console.error(`  ERROR: ${err}`);
        },
    });

    const results = runner.run();
    const totalMs = Date.now() - t0;

    console.log(`\n  Finished in ${(totalMs / 1000).toFixed(1)}s`);

    // Save final weights (from last run, which has the continuously-trained weights)
    const lastRun = results[results.length - 1];
    fs.writeFileSync(
        path.join(outDir, "final-weights.json"),
        JSON.stringify(lastRun.finalWeights),
    );

    // Save best weights across all runs
    let bestRun = results[0];
    for (const r of results) {
        if (r.bestScore > bestRun.bestScore) bestRun = r;
    }
    fs.writeFileSync(
        path.join(outDir, "best-weights.json"),
        JSON.stringify(bestRun.bestWeights),
    );

    // Save summary
    const summary = {
        experiment: expNum,
        name: config.name,
        config: {
            runs: config.runs,
            totalEpisodes: config.totalEpisodes,
            globalEpisodes: config.runs * config.totalEpisodes,
            hiddenLayers: config.hiddenLayers,
            activation: config.activation,
            alpha: config.alpha,
            alphaFinal: config.alphaFinal,
            gamma: config.gamma,
            lambda: config.lambda,
            epsilon: config.epsilon,
            epsilonFinal: config.epsilonFinal,
            trainOpponent: config.trainOpponent,
            evalOpponents: config.evalOpponents,
            captureReward: config.captureReward,
            seed: config.seed,
        },
        totalTimeMs: totalMs,
        totalTimeSec: +(totalMs / 1000).toFixed(1),
        runs: results.map((r) => ({
            runIndex: r.runIndex,
            seed: r.seed,
            elapsedMs: r.elapsedMs,
            bestScore: r.bestScore,
            finalCheckpoint: r.checkpoints[r.checkpoints.length - 1],
            trainingStatsCount: r.trainingStats.length,
        })),
        bestOverall: {
            runIndex: bestRun.runIndex,
            bestScore: bestRun.bestScore,
        },
    };
    fs.writeFileSync(
        path.join(outDir, "summary.json"),
        JSON.stringify(summary, null, 2),
    );

    // Combined eval CSV with global episode numbering
    const combinedEvalLines = ["run,global_episode,opponent,games,wins,draws,losses,win_rate,score,avg_plies"];
    for (const r of results) {
        const offset = r.runIndex * config.totalEpisodes;
        for (const cp of r.checkpoints) {
            for (const [name, s] of Object.entries(cp.evalResults)) {
                combinedEvalLines.push(
                    `${r.runIndex + 1},${cp.episode + offset},${name},${s.games},${s.wins},${s.draws},${s.losses},${s.winRate.toFixed(3)},${s.score.toFixed(3)},${s.avgPlies.toFixed(1)}`
                );
            }
        }
    }
    fs.writeFileSync(path.join(outDir, "combined-eval.csv"), combinedEvalLines.join("\n") + "\n");

    // Combined training CSV with global episode numbering
    const firstRow = results[0].trainingStats[0];
    const layers = firstRow.dead.length;
    const deadCols = Array.from({ length: layers }, (_, i) => `dead_l${i + 1}`);
    const trainHead = [
        "run", "global_episode", "episode", "games", "result", "learner_score", "cum_score", "plies", "avg_plies",
        "mean_abs_td", "mean_grad_norm", "zero_grad_frac", "updates_per_game",
        "v_opening", "weight_l2", ...deadCols, "alpha", "epsilon", "sec",
    ];
    const combinedTrainLines = [trainHead.join(",")];
    for (const r of results) {
        const offset = r.runIndex * config.totalEpisodes;
        for (const row of r.trainingStats) {
            combinedTrainLines.push([
                r.runIndex + 1, row.episode + offset, row.episode, row.games, row.result,
                row.learner_score.toFixed(4), row.cum_score.toFixed(4),
                row.plies, row.avg_plies.toFixed(1), row.mean_abs_td.toFixed(5), row.mean_grad_norm.toFixed(5),
                row.zero_grad_frac.toFixed(4), row.updates_per_game, row.v_opening.toFixed(4),
                row.weight_l2.toFixed(3),
                ...Array.from({ length: layers }, (_, i) => (row.dead[i] ?? 0).toFixed(3)),
                row.alpha.toFixed(5), row.epsilon.toFixed(3), row.sec.toFixed(0),
            ].join(","));
        }
    }
    fs.writeFileSync(path.join(outDir, "combined-training.csv"), combinedTrainLines.join("\n") + "\n");

    console.log(`\n  Files written to ${outDir}/`);
    console.log(`  Best overall: Run ${bestRun.runIndex + 1} with score ${bestRun.bestScore.toFixed(3)}`);
    console.log(`  Done.\n`);
}

main();
