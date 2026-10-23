import { Algorithm } from "./Algorithm";

/**
 * Activation functions offered in the arena.
 *
 * These are all tfjs activation strings, so they can be passed straight to
 * tf.layers.dense. leakyReLU is deliberately absent: tfjs implements it as a
 * separate layer rather than an activation name.
 */
export const ACTIVATIONS = ["relu", "tanh", "sigmoid", "elu", "selu", "softplus", "swish", "linear"] as const;
export type ActivationName = (typeof ACTIVATIONS)[number];

/** Activations that can leave a unit outputting exactly 0 forever. */
export const RELU_FAMILY: ActivationName[] = ["relu"];

/** Everything one side of the board can be configured with. */
export type AgentConfig = {
    /** Learning rate at the first episode. */
    alpha: number;
    /** Learning rate at the last episode; linearly interpolated in between. */
    alphaFinal: number;
    /** Discount factor. */
    gamma: number;
    /** Eligibility-trace decay. 0 = TD(0); 1 credits the whole episode. */
    lambda: number;
    /** Exploration rate while training. */
    epsilon: number;
    /** Plies of lookahead. Only used by TD + Minimax and Minimax. */
    searchDepth: number;
    activation: ActivationName;
    /** One entry per hidden layer, giving that layer's unit count. */
    hiddenLayers: number[];
};

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
    alpha: 0.01,
    alphaFinal: 0.002,
    gamma: 0.99,
    lambda: 0,
    epsilon: 0.1,
    searchDepth: 2,
    activation: "relu",
    hiddenLayers: [64, 64],
};

/** True when this algorithm's move choice involves a search depth. */
export function usesSearchDepth(algorithm: Algorithm): boolean {
    return algorithm === Algorithm.TD_SEARCH || algorithm === Algorithm.MINIMAX;
}

/** True when this algorithm has a value network at all (so learning settings apply). */
export function usesNetwork(algorithm: Algorithm): boolean {
    return algorithm === Algorithm.TD || algorithm === Algorithm.TD_SEARCH;
}

/**
 * Identifies a network architecture. Weights saved for one architecture cannot
 * be loaded into another, so this is part of the storage key - switching to
 * 32,32 does not clobber the 64,64 network you trained earlier.
 */
export function architectureKey(cfg: AgentConfig): string {
    return `${cfg.hiddenLayers.join("x")}-${cfg.activation}`;
}

export const MIN_HIDDEN_UNITS = 1;
export const MAX_HIDDEN_UNITS = 512;
export const MAX_HIDDEN_LAYERS = 5;

/** Keeps a user-entered config inside workable bounds. */
export function clampConfig(cfg: AgentConfig): AgentConfig {
    const clamp = (x: number, lo: number, hi: number, fallback: number) =>
        Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fallback;
    const layers = cfg.hiddenLayers
        .slice(0, MAX_HIDDEN_LAYERS)
        .map((u) => Math.round(clamp(u, MIN_HIDDEN_UNITS, MAX_HIDDEN_UNITS, 64)));
    return {
        alpha: clamp(cfg.alpha, 0, 1, 0.01),
        alphaFinal: clamp(cfg.alphaFinal, 0, 1, 0.002),
        gamma: clamp(cfg.gamma, 0, 1, 0.99),
        lambda: clamp(cfg.lambda, 0, 1, 0),
        epsilon: clamp(cfg.epsilon, 0, 1, 0.1),
        searchDepth: Math.round(clamp(cfg.searchDepth, 1, 4, 2)),
        activation: cfg.activation,
        hiddenLayers: layers.length ? layers : [64],
    };
}
