/*
 * Web Worker entry point for the experiment system.
 *
 * Runs ExperimentRunner off the main thread so the UI stays responsive
 * during long training sessions. Communicates via postMessage.
 *
 * Messages IN  (main → worker):
 *   { type: "start", config: ExperimentConfig }
 *   { type: "abort" }
 *
 * Messages OUT (worker → main):
 *   { type: "progress", data: ExperimentProgress }
 *   { type: "runComplete", data: RunResult }
 *   { type: "done", data: RunResult[] }
 *   { type: "error", message: string }
 */

import { ExperimentConfig, ExperimentRunner, ExperimentProgress, RunResult } from "./experiment";

let runner: ExperimentRunner | null = null;

self.onmessage = (e: MessageEvent) => {
    const msg = e.data;

    if (msg.type === "abort") {
        runner?.abort();
        return;
    }

    if (msg.type === "start") {
        const config: ExperimentConfig = msg.config;

        // Throttle progress messages — send at most once per 100ms to
        // avoid flooding the main thread's message queue.
        let lastProgressTime = 0;
        let pendingProgress: ExperimentProgress | null = null;

        const flushProgress = () => {
            if (pendingProgress) {
                self.postMessage({ type: "progress", data: pendingProgress });
                pendingProgress = null;
            }
        };

        runner = new ExperimentRunner(config, {
            onProgress: (p: ExperimentProgress) => {
                const now = Date.now();
                // Always send checkpoint completions immediately
                if (p.latestCheckpoint || p.phase === "evaluating") {
                    flushProgress();
                    self.postMessage({ type: "progress", data: p });
                    lastProgressTime = now;
                    return;
                }
                // Throttle training progress
                if (now - lastProgressTime >= 100) {
                    self.postMessage({ type: "progress", data: p });
                    lastProgressTime = now;
                    pendingProgress = null;
                } else {
                    pendingProgress = p;
                }
            },
            onRunComplete: (result: RunResult) => {
                flushProgress();
                self.postMessage({ type: "runComplete", data: result });
            },
            onError: (message: string) => {
                flushProgress();
                self.postMessage({ type: "error", message });
            },
        });

        try {
            const results = runner.run();
            flushProgress();
            self.postMessage({ type: "done", data: results });
        } catch (err) {
            flushProgress();
            self.postMessage({
                type: "error",
                message: err instanceof Error ? err.message : String(err),
            });
        }
        runner = null;
    }
};
