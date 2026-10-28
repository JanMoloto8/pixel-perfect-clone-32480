/*
 * Experiment system test suite — 15 test cases.
 *
 *   npx tsx scripts/experiment-tests.ts
 *
 * Tests the ExperimentRunner core logic, config handling, checkpointing,
 * snapshot integrity, CSV export, and evaluation correctness.
 *
 * Performance note: uses only "random" eval opponents in most tests to
 * avoid slow AlphaBeta tree search in pure-JS tfjs. Tests that specifically
 * need AB opponents use minimal game counts.
 */

import {
    ExperimentConfig,
    ExperimentRunner,
    ExperimentProgress,
    RunResult,
    Checkpoint,
    DEFAULT_EXPERIMENT_CONFIG,
    trainingStatsToCsv,
    evalCheckpointsToCsv,
} from "../src/rl/experiment";
import { ValueNet } from "../src/rl/valueNet";
import { isTrainingRow } from "../src/rl/episodeStats";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err instanceof Error ? err.message : String(err)}`);
        failed++;
    }
}

function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg);
}

/** Small fast defaults: random-only opponents, few episodes. */
const FAST_DEFAULTS: Partial<ExperimentConfig> = {
    runs: 1,
    totalEpisodes: 10,
    evalInterval: 5,
    evalGames: 4,
    evalOpponents: ["random"],
    trainOpponent: "random",
    seed: 42,
};

/** Run a small experiment and return results + collected progress messages. */
function runSmallExperiment(overrides: Partial<ExperimentConfig> = {}): {
    results: RunResult[];
    progress: ExperimentProgress[];
    errors: string[];
} {
    const config: ExperimentConfig = {
        ...DEFAULT_EXPERIMENT_CONFIG,
        ...FAST_DEFAULTS,
        ...overrides,
    };

    const progress: ExperimentProgress[] = [];
    const errors: string[] = [];

    const runner = new ExperimentRunner(config, {
        onProgress: (p) => progress.push(p),
        onRunComplete: () => {},
        onError: (e) => errors.push(e),
    });

    const results = runner.run();
    return { results, progress, errors };
}

/* ================================================================== */
console.log("Experiment system tests");
console.log("=======================\n");

/* ------------------------------------------------------------------
 * Run one "baseline" experiment up front and reuse it across many tests.
 * This avoids re-running experiments for every test case.
 * ------------------------------------------------------------------ */
console.log("  (running baseline experiment...)");
const baseline = runSmallExperiment({ totalEpisodes: 20, evalInterval: 10 });
const baseRun = baseline.results[0];

/* ------------------------------------------------------------------ */
console.log("\n1. Configuration & setup");
/* ------------------------------------------------------------------ */

test("1.1 Default config has valid values", () => {
    const c = DEFAULT_EXPERIMENT_CONFIG;
    assert(c.runs > 0, "runs > 0");
    assert(c.totalEpisodes > 0, "totalEpisodes > 0");
    assert(c.evalInterval > 0, "evalInterval > 0");
    assert(c.evalGames > 0, "evalGames > 0");
    assert(c.evalOpponents.length > 0, "has eval opponents");
    assert(c.hiddenLayers.length > 0, "has hidden layers");
    assert(c.alpha > 0 && c.alpha <= 1, "alpha in (0,1]");
    assert(c.gamma > 0 && c.gamma <= 1, "gamma in (0,1]");
});

test("1.2 Experiment completes without errors", () => {
    assert(baseline.errors.length === 0, `Expected no errors, got: ${baseline.errors.join(", ")}`);
    assert(baseline.results.length === 1, `Expected 1 run result, got ${baseline.results.length}`);
});

test("1.3 Multiple runs produce independent results", () => {
    const { results, errors } = runSmallExperiment({ runs: 3, totalEpisodes: 6, evalInterval: 6 });
    assert(errors.length === 0, `Errors: ${errors.join(", ")}`);
    assert(results.length === 3, `Expected 3 runs, got ${results.length}`);
    const seeds = results.map((r) => r.seed);
    assert(new Set(seeds).size === 3, `Seeds not unique: ${seeds}`);
    assert(results[0].runIndex === 0 && results[1].runIndex === 1 && results[2].runIndex === 2, "Run indices wrong");
});

/* ------------------------------------------------------------------ */
console.log("\n2. Training & evaluation");
/* ------------------------------------------------------------------ */

test("2.1 Training produces correct number of stats rows", () => {
    assert(
        baseRun.trainingStats.length === 20,
        `Expected 20 training rows, got ${baseRun.trainingStats.length}`,
    );
});

test("2.2 Checkpoints are created at eval intervals", () => {
    const cpEpisodes = baseRun.checkpoints.map((c) => c.episode);
    assert(cpEpisodes.includes(0), "Missing initial checkpoint at ep 0");
    assert(cpEpisodes.includes(10), "Missing checkpoint at ep 10");
    assert(cpEpisodes.includes(20), "Missing checkpoint at ep 20");
});

test("2.3 Evaluation results cover all specified opponents", () => {
    // Run a small experiment with multiple eval opponents (ab1 only 2 games to keep fast)
    const { results } = runSmallExperiment({
        evalOpponents: ["random", "ab1"],
        totalEpisodes: 4,
        evalInterval: 4,
        evalGames: 2,
    });
    const lastCp = results[0].checkpoints[results[0].checkpoints.length - 1];
    assert("random" in lastCp.evalResults, "Missing eval vs random");
    assert("ab1" in lastCp.evalResults, "Missing eval vs ab1");
    for (const [name, summary] of Object.entries(lastCp.evalResults)) {
        assert(summary.games === 2, `${name}: expected 2 eval games, got ${summary.games}`);
        assert(summary.wins + summary.draws + summary.losses === summary.games, `${name}: w+d+l ≠ games`);
    }
});

test("2.4 Training stats rows have expected fields", () => {
    const row = baseRun.trainingStats[0];
    assert(isTrainingRow(row), "First row should be a training row");
    assert(typeof row.mean_abs_td === "number", "mean_abs_td missing");
    assert(typeof row.mean_grad_norm === "number", "mean_grad_norm missing");
    assert(typeof row.v_opening === "number", "v_opening missing");
    assert(typeof row.weight_l2 === "number", "weight_l2 missing");
    assert(typeof row.alpha === "number", "alpha missing");
    assert(typeof row.epsilon === "number", "epsilon missing");
    assert(Array.isArray(row.dead), "dead array missing");
});

test("2.5 Linear decay of alpha and epsilon", () => {
    const { results } = runSmallExperiment({
        totalEpisodes: 20,
        evalInterval: 20,
        alpha: 0.1,
        alphaFinal: 0.01,
        epsilon: 0.5,
        epsilonFinal: 0.05,
    });
    const rows = results[0].trainingStats;
    const first = rows[0];
    const last = rows[rows.length - 1];
    assert(Math.abs(first.alpha - 0.1) < 0.02, `First alpha ${first.alpha} not near 0.1`);
    assert(Math.abs(last.alpha - 0.01) < 0.02, `Last alpha ${last.alpha} not near 0.01`);
    assert(Math.abs(last.epsilon - 0.05) < 0.1, `Last epsilon ${last.epsilon} not near 0.05`);
});

/* ------------------------------------------------------------------ */
console.log("\n3. Checkpoints & snapshots");
/* ------------------------------------------------------------------ */

test("3.1 Checkpoint weights are valid SerializedWeights", () => {
    for (const cp of baseRun.checkpoints) {
        assert(Array.isArray(cp.weights), "Weights should be an array");
        assert(cp.weights.length > 0, "Weights array empty");
        for (const w of cp.weights) {
            assert(Array.isArray(w.shape), "Weight entry missing shape");
            assert(Array.isArray(w.values), "Weight entry missing values");
            assert(w.values.length > 0, "Weight values empty");
        }
    }
});

test("3.2 Checkpoint weights can be loaded into a new network", () => {
    const cp = baseRun.checkpoints[baseRun.checkpoints.length - 1];
    const net = new ValueNet({ hidden: [64, 64], activation: "relu" });
    const ok = net.loadJSON(cp.weights);
    assert(ok, "loadJSON returned false");
    const x = new Float32Array(54);
    const v = net.value(x);
    assert(Number.isFinite(v), `Loaded network value not finite: ${v}`);
    net.dispose();
});

test("3.3 Best weights track the highest-scoring checkpoint", () => {
    const maxCpScore = Math.max(...baseRun.checkpoints.map((c) => c.avgScore));
    assert(
        Math.abs(baseRun.bestScore - maxCpScore) < 1e-9,
        `bestScore (${baseRun.bestScore}) != max checkpoint score (${maxCpScore})`,
    );
    assert(baseRun.bestWeights.length > 0, "bestWeights empty");
});

test("3.4 Final weights are serialized correctly", () => {
    assert(baseRun.finalWeights.length > 0, "finalWeights empty");
    const net = new ValueNet({ hidden: [64, 64], activation: "relu" });
    assert(net.loadJSON(baseRun.finalWeights), "Can't load finalWeights");
    net.dispose();
});

/* ------------------------------------------------------------------ */
console.log("\n4. Progress & abort");
/* ------------------------------------------------------------------ */

test("4.1 Progress callbacks fire for each episode", () => {
    const trainingProgress = baseline.progress.filter((p) => p.phase === "training");
    assert(trainingProgress.length >= 20, `Expected ≥20 training progress, got ${trainingProgress.length}`);
});

test("4.2 Abort stops the experiment early", () => {
    const config: ExperimentConfig = {
        ...DEFAULT_EXPERIMENT_CONFIG,
        ...FAST_DEFAULTS,
        totalEpisodes: 500,
        evalInterval: 500,
    };

    let progressCount = 0;
    const runner = new ExperimentRunner(config, {
        onProgress: () => {
            progressCount++;
            if (progressCount >= 5) runner.abort();
        },
        onRunComplete: () => {},
        onError: () => {},
    });

    const results = runner.run();
    if (results.length > 0) {
        assert(
            results[0].trainingStats.length < 500,
            `Expected early stop, got ${results[0].trainingStats.length} episodes`,
        );
    }
});

/* ------------------------------------------------------------------ */
console.log("\n5. CSV export");
/* ------------------------------------------------------------------ */

test("5.1 Training CSV has correct header and row count", () => {
    const csv = trainingStatsToCsv(baseRun.trainingStats);
    const lines = csv.trim().split("\n");
    assert(lines.length === 21, `Expected 21 lines (header + 20 rows), got ${lines.length}`);
    const header = lines[0];
    assert(header.includes("episode"), "Header missing 'episode'");
    assert(header.includes("mean_abs_td"), "Header missing 'mean_abs_td'");
    assert(header.includes("alpha"), "Header missing 'alpha'");
});

test("5.2 Eval CSV has correct structure", () => {
    const csv = evalCheckpointsToCsv(baseRun.checkpoints);
    const lines = csv.trim().split("\n");
    // Header + (3 checkpoints × 1 opponent) = 1 + 3 = 4
    assert(lines.length >= 2, `Expected at least 2 eval CSV lines, got ${lines.length}`);
    assert(lines[0].includes("opponent"), "Header missing 'opponent'");
    assert(lines[0].includes("score"), "Header missing 'score'");
});

/* ------------------------------------------------------------------ */
console.log("\n6. Algorithm variants & seeds");
/* ------------------------------------------------------------------ */

test("6.1 Self-play training opponent works", () => {
    const { results, errors } = runSmallExperiment({
        trainOpponent: "self",
        totalEpisodes: 4,
        evalInterval: 4,
    });
    assert(errors.length === 0, `Errors: ${errors.join(", ")}`);
    assert(results.length === 1 && results[0].trainingStats.length === 4, "Expected 4 training rows");
});

test("6.2 Different seeds produce different results", () => {
    const r1 = runSmallExperiment({ seed: 1, totalEpisodes: 6, evalInterval: 6 });
    const r2 = runSmallExperiment({ seed: 99, totalEpisodes: 6, evalInterval: 6 });
    // Final weights should differ
    const w1 = r1.results[0].finalWeights[0].values;
    const w2 = r2.results[0].finalWeights[0].values;
    let diff = 0;
    for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
        diff += Math.abs(w1[i] - w2[i]);
    }
    assert(diff > 0.001, `Seeds 1 and 99 produced nearly identical weights (diff=${diff})`);
});

test("6.3 Non-default architecture (3 layers, tanh) works", () => {
    const { results, errors } = runSmallExperiment({
        hiddenLayers: [32, 16, 8],
        activation: "tanh",
        totalEpisodes: 4,
        evalInterval: 4,
    });
    assert(errors.length === 0, `Errors: ${errors.join(", ")}`);
    // tanh cannot have dead units, so dead array is empty; relu would have 3 entries
    const row = results[0].trainingStats[0];
    assert(row.dead.length === 0, `tanh should have 0 dead-unit entries, got ${row.dead.length}`);
    // Verify relu *does* produce dead-unit entries for the same architecture
    const { results: r2 } = runSmallExperiment({
        hiddenLayers: [32, 16, 8],
        activation: "relu",
        totalEpisodes: 4,
        evalInterval: 4,
    });
    const row2 = r2[0].trainingStats[0];
    assert(row2.dead.length === 3, `relu with 3 layers should have 3 dead entries, got ${row2.dead.length}`);
});

/* ================================================================== */
console.log("\n=======================");
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) {
    process.exit(1);
} else {
    console.log("All experiment tests passed!");
}
