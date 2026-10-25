import { ValueNet, DEFAULT_NET_CONFIG, SerializedWeights, ValueNetConfig } from "@/rl/valueNet";

/**
 * The arena's network is the same afterstate value network the headless
 * trainer uses (src/rl/valueNet.ts), plus browser storage helpers.
 *
 * Storage keys are versioned: weights saved by the old code (which had
 * diverged and had every ReLU dead) are ignored instead of being reloaded.
 */
export const STORAGE_VERSION = "v2";

/** Prefix shared by every saved network, so they can all be cleared at once. */
export const STORAGE_PREFIX = "morabaraba-neural-network";

export class NeuralNetwork extends ValueNet {
    constructor(config: ValueNetConfig = DEFAULT_NET_CONFIG) {
        super(config);
    }

    public saveToLocalStorage(key: string): void {
        if (typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(`${key}-${STORAGE_VERSION}`, JSON.stringify(this.toJSON()));
        } catch {
            /* storage full or blocked - training still works in memory */
        }
    }

    /**
     * Returns false when there is nothing saved, or when what is saved has a
     * different shape (because the architecture was changed since). The caller
     * then keeps the fresh random initialisation.
     */
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

}

/**
 * Forgets every network saved in this browser.
 *
 * After this the next session starts from fresh random weights, which is how
 * you begin a genuinely new training run rather than continuing the previous one.
 */
export function clearSavedNetworks(): number {
    if (typeof localStorage === "undefined") return 0;
    const doomed: string[] = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(STORAGE_PREFIX)) doomed.push(k);
        }
        doomed.forEach((k) => localStorage.removeItem(k));
    } catch {
        return 0;
    }
    return doomed.length;
}
