import { ValueNet, DEFAULT_NET_CONFIG, SerializedWeights } from "@/rl/valueNet";

/**
 * The arena's network is the same afterstate value network the headless
 * trainer uses (src/rl/valueNet.ts), plus browser storage helpers.
 *
 * Storage keys are versioned: weights saved by the old code (which had
 * diverged and had every ReLU dead) are ignored instead of being reloaded.
 */
export const STORAGE_VERSION = "v2";

/** Trained weights shipped with the site (see scripts/train.ts). */
export const PRETRAINED_URL = "/models/td-agent.json";

export class NeuralNetwork extends ValueNet {
    constructor() {
        super(DEFAULT_NET_CONFIG);
    }

    public saveToLocalStorage(key: string): void {
        if (typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(`${key}-${STORAGE_VERSION}`, JSON.stringify(this.toJSON()));
        } catch {
            /* storage full or blocked - training still works in memory */
        }
    }

    public loadFromLocalStorage(key: string): boolean {
        if (typeof localStorage === "undefined") return false;
        try {
            const raw = localStorage.getItem(`${key}-${STORAGE_VERSION}`);
            if (!raw) return false;
            return this.loadJSON(JSON.parse(raw) as SerializedWeights);
        } catch {
            return false;
        }
    }

    /** Loads the shipped pre-trained weights. Resolves false if they are missing. */
    public async loadPretrained(url: string = PRETRAINED_URL): Promise<boolean> {
        if (typeof fetch === "undefined") return false;
        try {
            const res = await fetch(url);
            if (!res.ok) return false;
            return this.loadJSON((await res.json()) as SerializedWeights);
        } catch {
            return false;
        }
    }
}
