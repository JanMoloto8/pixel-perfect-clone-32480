/**
 * Shared helpers for listing / saving / deleting experiment architectures
 * stored in localStorage.  Used by both ExperimentPanel (write) and
 * AgentConfigPanel (read + apply).
 */

import { STORAGE_PREFIX, STORAGE_VERSION } from "./neuralNetwork";
import type { SerializedWeights } from "@/rl/valueNet";

export const EXPERIMENT_ARCH_PREFIX = "morabaraba-experiment-arch";

export type SavedArchitecture = {
    name: string;
    hiddenLayers: number[];
    activation: string;
    savedAt: number;
    totalEpisodes: number;
    runs: number;
    bestScore: number;
};

/** Save final weights + metadata so the arena can pick them up. */
export function saveWeightsToLocalStorage(
    config: { name: string; hiddenLayers: number[]; activation: string; totalEpisodes: number; runs: number },
    weights: SerializedWeights,
    bestScore: number,
): void {
    if (typeof localStorage === "undefined") return;
    try {
        const archKey = `${config.hiddenLayers.join("x")}-${config.activation}`;
        const weightsJson = JSON.stringify(weights);
        for (const side of ["white", "black"]) {
            const key = `${STORAGE_PREFIX}-${side}-${archKey}-${STORAGE_VERSION}`;
            localStorage.setItem(key, weightsJson);
        }
        const meta: SavedArchitecture = {
            name: config.name,
            hiddenLayers: config.hiddenLayers,
            activation: config.activation,
            savedAt: Date.now(),
            totalEpisodes: config.totalEpisodes * config.runs,
            runs: config.runs,
            bestScore,
        };
        localStorage.setItem(
            `${EXPERIMENT_ARCH_PREFIX}-${archKey}`,
            JSON.stringify(meta),
        );
    } catch { /* storage full or blocked */ }
}

/** List all saved experiment architectures, newest first. */
export function listSavedArchitectures(): SavedArchitecture[] {
    if (typeof localStorage === "undefined") return [];
    const results: SavedArchitecture[] = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(EXPERIMENT_ARCH_PREFIX)) {
                const raw = localStorage.getItem(k);
                if (raw) results.push(JSON.parse(raw) as SavedArchitecture);
            }
        }
    } catch { /* ignore */ }
    results.sort((a, b) => b.savedAt - a.savedAt);
    return results;
}

/** Delete a saved architecture's weights and metadata. */
export function deleteSavedArchitecture(arch: SavedArchitecture): void {
    if (typeof localStorage === "undefined") return;
    try {
        const archKey = `${arch.hiddenLayers.join("x")}-${arch.activation}`;
        localStorage.removeItem(`${EXPERIMENT_ARCH_PREFIX}-${archKey}`);
        for (const side of ["white", "black"]) {
            localStorage.removeItem(`${STORAGE_PREFIX}-${side}-${archKey}-${STORAGE_VERSION}`);
        }
    } catch { /* ignore */ }
}
