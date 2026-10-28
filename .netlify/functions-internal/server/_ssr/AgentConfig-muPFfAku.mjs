import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AgentConfig-muPFfAku.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Algorithm = /* @__PURE__ */ function(Algorithm) {
	Algorithm["TD"] = "TD";
	/** The learned value function, but chosen through a 2-ply negamax search. */
	Algorithm["TD_SEARCH"] = "TD + Minimax";
	Algorithm["MINIMAX"] = "Minimax";
	Algorithm["MCTS"] = "Monte Carlo Tree Search";
	Algorithm["RANDOM"] = "Random";
	return Algorithm;
}({});
/** Agents that are actually implemented in Game.tsx (MCTS is not yet). */
var IMPLEMENTED_ALGORITHMS = [
	"TD",
	"TD + Minimax",
	"Minimax",
	"Random"
];
/**
* Activation functions offered in the arena.
*
* These are all tfjs activation strings, so they can be passed straight to
* tf.layers.dense. leakyReLU is deliberately absent: tfjs implements it as a
* separate layer rather than an activation name.
*/
var ACTIVATIONS = [
	"relu",
	"tanh",
	"sigmoid",
	"elu",
	"selu",
	"softplus",
	"swish",
	"linear"
];
var DEFAULT_AGENT_CONFIG = {
	alpha: .01,
	alphaFinal: .002,
	gamma: .99,
	lambda: 0,
	epsilon: .1,
	epsilonFinal: .01,
	searchDepth: 2,
	activation: "relu",
	hiddenLayers: [64, 64]
};
/** True when this algorithm's move choice involves a search depth. */
function usesSearchDepth(algorithm) {
	return algorithm === Algorithm.TD_SEARCH || algorithm === Algorithm.MINIMAX;
}
/** True when this algorithm has a value network at all (so learning settings apply). */
function usesNetwork(algorithm) {
	return algorithm === Algorithm.TD || algorithm === Algorithm.TD_SEARCH;
}
/**
* Identifies a network architecture. Weights saved for one architecture cannot
* be loaded into another, so this is part of the storage key - switching to
* 32,32 does not clobber the 64,64 network you trained earlier.
*/
function architectureKey(cfg) {
	return `${cfg.hiddenLayers.join("x")}-${cfg.activation}`;
}
/** Keeps a user-entered config inside workable bounds. */
function clampConfig(cfg) {
	const clamp = (x, lo, hi, fallback) => Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fallback;
	const layers = cfg.hiddenLayers.slice(0, 5).map((u) => Math.round(clamp(u, 1, 512, 64)));
	return {
		alpha: clamp(cfg.alpha, 0, 1, .01),
		alphaFinal: clamp(cfg.alphaFinal, 0, 1, .002),
		gamma: clamp(cfg.gamma, 0, 1, .99),
		lambda: clamp(cfg.lambda, 0, 1, 0),
		epsilon: clamp(cfg.epsilon, 0, 1, .1),
		epsilonFinal: clamp(cfg.epsilonFinal, 0, 1, .01),
		searchDepth: Math.round(clamp(cfg.searchDepth, 1, 4, 2)),
		activation: cfg.activation,
		hiddenLayers: layers.length ? layers : [64]
	};
}
//#endregion
export { architectureKey as a, usesNetwork as c, IMPLEMENTED_ALGORITHMS as i, usesSearchDepth as l, Algorithm as n, clampConfig as o, DEFAULT_AGENT_CONFIG as r, cn as s, ACTIVATIONS as t };
