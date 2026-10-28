/*
 * React hook managing the experiment system's Web Worker lifecycle.
 *
 * Exposes a simple API: configure → start → watch progress → get results.
 * All heavy computation runs in the worker; this hook only collects messages.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
    ExperimentConfig,
    ExperimentProgress,
    RunResult,
    Checkpoint,
} from "../rl/experiment";
import { DEFAULT_EXPERIMENT_CONFIG } from "../rl/experiment";

export type ExperimentStatus =
    | "idle"
    | "running"
    | "paused"     // reserved for future use
    | "completed"
    | "error"
    | "aborted";

export type ExperimentState = {
    status: ExperimentStatus;
    config: ExperimentConfig;
    progress: ExperimentProgress | null;
    /** Completed run results, in order. */
    completedRuns: RunResult[];
    /** All results once the experiment finishes. */
    allResults: RunResult[] | null;
    errors: string[];
};

export function useExperiment() {
    const workerRef = useRef<Worker | null>(null);
    const [state, setState] = useState<ExperimentState>({
        status: "idle",
        config: DEFAULT_EXPERIMENT_CONFIG,
        progress: null,
        completedRuns: [],
        allResults: null,
        errors: [],
    });

    // Clean up worker on unmount
    useEffect(() => {
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    const setConfig = useCallback((config: ExperimentConfig) => {
        setState((prev) => ({ ...prev, config }));
    }, []);

    const updateConfig = useCallback((partial: Partial<ExperimentConfig>) => {
        setState((prev) => ({
            ...prev,
            config: { ...prev.config, ...partial },
        }));
    }, []);

    const start = useCallback(() => {
        // Clean up any existing worker
        workerRef.current?.terminate();

        setState((prev) => ({
            ...prev,
            status: "running",
            progress: null,
            completedRuns: [],
            allResults: null,
            errors: [],
        }));

        // Create worker using Vite's ?worker syntax
        const worker = new Worker(
            new URL("../rl/experiment-worker.ts", import.meta.url),
            { type: "module" },
        );
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent) => {
            const msg = e.data;

            switch (msg.type) {
                case "progress":
                    setState((prev) => ({
                        ...prev,
                        progress: msg.data as ExperimentProgress,
                    }));
                    break;

                case "runComplete":
                    setState((prev) => ({
                        ...prev,
                        completedRuns: [...prev.completedRuns, msg.data as RunResult],
                    }));
                    break;

                case "done":
                    setState((prev) => ({
                        ...prev,
                        status: "completed",
                        allResults: msg.data as RunResult[],
                    }));
                    workerRef.current = null;
                    break;

                case "error":
                    setState((prev) => ({
                        ...prev,
                        errors: [...prev.errors, msg.message as string],
                    }));
                    break;
            }
        };

        worker.onerror = (e: ErrorEvent) => {
            setState((prev) => ({
                ...prev,
                status: "error",
                errors: [...prev.errors, e.message || "Worker error"],
            }));
            workerRef.current = null;
        };

        // Start the experiment
        setState((prev) => {
            worker.postMessage({ type: "start", config: prev.config });
            return prev;
        });
    }, []);

    const abort = useCallback(() => {
        workerRef.current?.postMessage({ type: "abort" });
        setState((prev) => ({ ...prev, status: "aborted" }));
    }, []);

    const reset = useCallback(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
        setState((prev) => ({
            ...prev,
            status: "idle",
            progress: null,
            completedRuns: [],
            allResults: null,
            errors: [],
        }));
    }, []);

    return {
        ...state,
        setConfig,
        updateConfig,
        start,
        abort,
        reset,
    };
}

/* ------------------------------------------------------------------ */
/*  Helper: get the latest checkpoint across all completed runs       */
/* ------------------------------------------------------------------ */

export function latestCheckpoints(runs: RunResult[]): Checkpoint[] {
    return runs.flatMap((r) => r.checkpoints);
}

export function bestRunResult(runs: RunResult[]): RunResult | null {
    if (runs.length === 0) return null;
    return runs.reduce((best, r) => (r.bestScore > best.bestScore ? r : best));
}
