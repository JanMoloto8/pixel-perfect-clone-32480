import { o as __toESM } from "../_runtime.mjs";
import { a as architectureKey, c as usesNetwork, i as IMPLEMENTED_ALGORITHMS, l as usesSearchDepth, n as Algorithm, o as clampConfig, r as DEFAULT_AGENT_CONFIG, s as cn, t as ACTIVATIONS } from "./AgentConfig-muPFfAku.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as RefreshCw, c as FlaskConical, g as Activity, h as Bot, i as RotateCcw, l as Flag, m as ChartColumn, n as Trophy, o as Play, r as Trash2, s as Pause, t as User, u as Clock } from "../_libs/lucide-react.mjs";
import { a as CartesianGrid, c as Tooltip, i as Line, n as YAxis, o as ReferenceLine, r as XAxis, s as ResponsiveContainer, t as LineChart } from "../_libs/recharts+[...].mjs";
import { a as tensor2d, c as zerosLike, d as tensor, i as glorotUniform, l as keep, n as sequential, o as variableGrads, r as constant, s as scalar, t as dense, u as tidy } from "../_libs/@tensorflow/tfjs.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/radix-ui__react-slider.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C9r3MhtT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MILLS$1 = [
	[
		0,
		1,
		2
	],
	[
		5,
		6,
		7
	],
	[
		0,
		3,
		5
	],
	[
		2,
		4,
		7
	],
	[
		8,
		9,
		10
	],
	[
		13,
		14,
		15
	],
	[
		8,
		11,
		13
	],
	[
		10,
		12,
		15
	],
	[
		16,
		17,
		18
	],
	[
		21,
		22,
		23
	],
	[
		16,
		19,
		21
	],
	[
		18,
		20,
		23
	],
	[
		1,
		9,
		17
	],
	[
		3,
		11,
		19
	],
	[
		4,
		12,
		20
	],
	[
		6,
		14,
		22
	],
	[
		0,
		8,
		16
	],
	[
		2,
		10,
		18
	],
	[
		5,
		13,
		21
	],
	[
		7,
		15,
		23
	]
];
/** Adjacency is derived from the mill lines, so it can never disagree with them. */
var ADJACENT = (() => {
	const adj = Array.from({ length: 24 }, () => /* @__PURE__ */ new Set());
	for (const [a, b, c] of MILLS$1) {
		adj[a].add(b);
		adj[b].add(a);
		adj[b].add(c);
		adj[c].add(b);
	}
	return adj.map((s) => [...s].sort((x, y) => x - y));
})();
/** Mills that pass through each point. */
var MILLS_AT = Array.from({ length: 24 }, (_, p) => MILLS$1.filter((m) => m.includes(p)).map((m) => [...m]));
var DEFAULT_RULES = {
	noCaptureDrawPlies: 1e4,
	maxPlies: 4e5
};
function initialState() {
	return {
		board: /* @__PURE__ */ new Int8Array(24),
		inHand: [12, 12],
		onBoard: [0, 0],
		toMove: 0,
		ply: 0,
		pliesSinceCapture: 0,
		result: null
	};
}
function cloneState(s) {
	return {
		board: s.board.slice(),
		inHand: [s.inHand[0], s.inHand[1]],
		onBoard: [s.onBoard[0], s.onBoard[1]],
		toMove: s.toMove,
		ply: s.ply,
		pliesSinceCapture: s.pliesSinceCapture,
		result: s.result
	};
}
var cell = (p) => p + 1;
var other = (p) => p === 0 ? 1 : 0;
function totalPieces(s, p) {
	return s.inHand[p] + s.onBoard[p];
}
/** True if `point` (occupied by colour `c`) is part of a complete mill. */
function inMill(board, point) {
	const c = board[point];
	if (c === 0) return false;
	for (const [a, b, d] of MILLS_AT[point]) if (board[a] === c && board[b] === c && board[d] === c) return true;
	return false;
}
/** Opponent cows that may be captured: not in a mill, unless all of them are. */
function capturablePoints(board, victim) {
	const c = cell(victim);
	const all = [];
	const free = [];
	for (let i = 0; i < 24; i++) {
		if (board[i] !== c) continue;
		all.push(i);
		if (!inMill(board, i)) free.push(i);
	}
	return free.length > 0 ? free : all;
}
/** Base moves (no capture info) for the side to move. */
function baseMoves(s) {
	const p = s.toMove;
	const c = cell(p);
	const out = [];
	if (s.inHand[p] > 0) {
		for (let i = 0; i < 24; i++) if (s.board[i] === 0) out.push([-1, i]);
		return out;
	}
	const flying = s.onBoard[p] === 3;
	for (let from = 0; from < 24; from++) {
		if (s.board[from] !== c) continue;
		if (flying) {
			for (let to = 0; to < 24; to++) if (s.board[to] === 0) out.push([from, to]);
		} else for (const to of ADJACENT[from]) if (s.board[to] === 0) out.push([from, to]);
	}
	return out;
}
function legalActions(s) {
	if (s.result !== null) return [];
	const p = s.toMove;
	const c = cell(p);
	const opp = other(p);
	const actions = [];
	const board = s.board;
	for (const [from, to] of baseMoves(s)) {
		if (from >= 0) board[from] = 0;
		board[to] = c;
		if (inMill(board, to) && s.onBoard[opp] > 0) for (const cap of capturablePoints(board, opp)) actions.push({
			from,
			to,
			capture: cap
		});
		else actions.push({
			from,
			to,
			capture: -1
		});
		board[to] = 0;
		if (from >= 0) board[from] = c;
	}
	return actions;
}
/** Applies an action in place and resolves game-over. */
function applyActionInPlace(s, a, rules = DEFAULT_RULES) {
	const p = s.toMove;
	const opp = other(p);
	const c = cell(p);
	if (a.from >= 0) s.board[a.from] = 0;
	else {
		s.inHand[p] -= 1;
		s.onBoard[p] += 1;
	}
	s.board[a.to] = c;
	if (a.capture >= 0) {
		s.board[a.capture] = 0;
		s.onBoard[opp] -= 1;
		s.pliesSinceCapture = 0;
	} else if (s.inHand[0] === 0 && s.inHand[1] === 0) s.pliesSinceCapture += 1;
	s.ply += 1;
	s.toMove = opp;
	if (totalPieces(s, opp) < 3) s.result = p;
	else if (baseMoves(s).length === 0) s.result = p;
	else if (s.pliesSinceCapture >= rules.noCaptureDrawPlies || s.ply >= rules.maxPlies) s.result = 2;
}
function applyAction(s, a, rules = DEFAULT_RULES) {
	const sClone = cloneState(s);
	applyActionInPlace(sClone, a, rules);
	return sClone;
}
/** Build an engine state from the arena's per-colour bitboards. */
function fromBitboards(B0, B1, inHand, toMove) {
	const s = initialState();
	let w = 0, b = 0;
	for (let i = 0; i < 24; i++) if (B0[i] === 1) {
		s.board[i] = 1;
		w++;
	} else if (B1[i] === 1) {
		s.board[i] = 2;
		b++;
	}
	s.onBoard = [w, b];
	s.inHand = [inHand[0], inHand[1]];
	s.toMove = toMove;
	return s;
}
/** Small seedable RNG so experiments are repeatable. */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 >>> 0;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
/**
* Encodes a position from the point of view of player `me`.
*
* Using "my pieces / opponent pieces" instead of "white / black" means one
* network can play either colour, which is what makes self-play work.
* Every feature is scaled to [0, 1] so a plain SGD step can't blow up.
*
*   [0..23]  my cows
*   [24..47] opponent cows
*   48 my cows in hand / 12      49 opponent cows in hand / 12
*   50 my cows on board / 12     51 opponent cows on board / 12
*   52 1 if it is my turn        53 1 if I am flying (3 cows, none in hand)
*/
function encode(s, me, out, offset = 0) {
	const x = out ?? /* @__PURE__ */ new Float32Array(54);
	const mine = me + 1;
	const theirs = other(me) + 1;
	const opp = other(me);
	for (let i = 0; i < 24; i++) {
		const c = s.board[i];
		x[offset + i] = c === mine ? 1 : 0;
		x[offset + 24 + i] = c === theirs ? 1 : 0;
	}
	x[offset + 48] = s.inHand[me] / 12;
	x[offset + 49] = s.inHand[opp] / 12;
	x[offset + 50] = s.onBoard[me] / 12;
	x[offset + 51] = s.onBoard[opp] / 12;
	x[offset + 52] = s.toMove === me ? 1 : 0;
	x[offset + 53] = s.inHand[me] === 0 && s.onBoard[me] === 3 ? 1 : 0;
	return x;
}
var DEFAULT_NET_CONFIG = {
	hidden: [64, 64],
	activation: "relu"
};
/**
* Afterstate value network V(x) and its semi-gradient TD(0) update.
*/
var ValueNet = class {
	model;
	config;
	constructor(config = DEFAULT_NET_CONFIG) {
		this.config = config;
		this.model = sequential();
		let seed = config.seed;
		const init = () => glorotUniform({ seed: seed === void 0 ? void 0 : seed++ });
		config.hidden.forEach((units, i) => {
			this.model.add(dense({
				...i === 0 ? { inputShape: [54] } : {},
				units,
				activation: config.activation,
				kernelInitializer: init(),
				biasInitializer: config.activation === "relu" ? constant({ value: .01 }) : "zeros"
			}));
		});
		this.model.add(dense({
			units: 1,
			activation: "linear",
			kernelInitializer: init(),
			biasInitializer: "zeros"
		}));
	}
	variables() {
		return this.model.trainableWeights.map((w) => w.read());
	}
	/** Values for `n` feature rows packed into one Float32Array. */
	values(xs, n) {
		return tidy(() => {
			const rows = xs.length === n * 54 ? xs : xs.subarray(0, n * 54);
			return this.model.predict(tensor2d(rows, [n, 54])).dataSync();
		}).slice();
	}
	value(x) {
		return this.values(x, 1)[0];
	}
	/**
	* Semi-gradient TD(0):  w <- w + alpha * (target - V(x)) * grad_w V(x)
	*
	* `target` (r + gamma * V(x'), or just r at the end) is a plain number,
	* so no gradient flows through it - that is what "semi-gradient" means.
	*/
	tdStep(x, target, alpha) {
		const vars = this.variables();
		return tidy(() => {
			const input = tensor2d(x, [1, 54]);
			const { value, grads } = variableGrads(() => this.model.apply(input).sum(), vars);
			const v = value.dataSync()[0];
			const delta = target - v;
			let sq = scalar(0);
			for (const variable of vars) {
				const g = grads[variable.name];
				sq = sq.add(g.square().sum());
				variable.assign(variable.add(g.mul(alpha * delta)));
			}
			return {
				value: v,
				target,
				delta,
				gradNorm: Math.sqrt(sq.dataSync()[0])
			};
		});
	}
	/**
	* A fresh set of zeroed eligibility traces, one per trainable tensor.
	*
	* Traces belong to a *trajectory*, not to the weights: in self-play the
	* two players share this network but have separate histories, so each
	* agent owns its own trace set and passes it in. Caller must dispose.
	*/
	createTraces() {
		return this.variables().map((v) => keep(zerosLike(v)));
	}
	static disposeTraces(traces) {
		traces?.forEach((t) => t.dispose());
	}
	/**
	* Semi-gradient TD(lambda) with accumulating traces:
	*
	*   e <- gamma * lambda * e + grad_w V(x)
	*   w <- w + alpha * delta * e
	*
	* `traces` is mutated in place. lambda = 0 makes this identical to
	* tdStep; lambda = 1 credits the whole trajectory so far.
	*/
	tdStepTraces(x, target, alpha, gammaLambda, traces) {
		const vars = this.variables();
		let info;
		tidy(() => {
			const input = tensor2d(x, [1, 54]);
			const { value, grads } = variableGrads(() => this.model.apply(input).sum(), vars);
			const v = value.dataSync()[0];
			const delta = target - v;
			let sq = scalar(0);
			for (let i = 0; i < vars.length; i++) {
				const variable = vars[i];
				const g = grads[variable.name];
				sq = sq.add(g.square().sum());
				const next = keep(traces[i].mul(gammaLambda).add(g));
				traces[i].dispose();
				traces[i] = next;
				variable.assign(variable.add(next.mul(alpha * delta)));
			}
			info = {
				value: v,
				target,
				delta,
				gradNorm: Math.sqrt(sq.dataSync()[0])
			};
		});
		return info;
	}
	/** Fraction of hidden units that output exactly 0 for every row (dead ReLUs). */
	deadUnitFraction(xs, n) {
		if (!this.measuresDeadUnits()) return this.config.hidden.map(() => 0);
		return tidy(() => {
			let h = tensor2d(xs.subarray(0, n * 54), [n, 54]);
			const out = [];
			for (let i = 0; i < this.config.hidden.length; i++) {
				h = this.model.layers[i].apply(h);
				const alive = h.max(0).greater(0).sum().dataSync()[0];
				out.push(1 - alive / this.config.hidden[i]);
			}
			return out;
		});
	}
	/** Whether deadUnitFraction reports something meaningful for this activation. */
	measuresDeadUnits() {
		return this.config.activation === "relu";
	}
	weightL2() {
		return tidy(() => {
			let s = scalar(0);
			for (const v of this.variables()) s = s.add(v.square().sum());
			return Math.sqrt(s.dataSync()[0]);
		});
	}
	toJSON() {
		return this.model.getWeights().map((w) => ({
			shape: w.shape,
			values: Array.from(w.dataSync())
		}));
	}
	loadJSON(weights) {
		const current = this.model.getWeights();
		if (weights.length !== current.length) return false;
		for (let i = 0; i < weights.length; i++) if (weights[i].shape.join("x") !== current[i].shape.join("x")) return false;
		const tensors = weights.map(({ shape, values }) => tensor(values, shape));
		this.model.setWeights(tensors);
		tensors.forEach((t) => t.dispose());
		return true;
	}
	copyFrom(other) {
		this.loadJSON(other.toJSON());
	}
	dispose() {
		this.model.dispose();
	}
};
/** +1 for a win, -1 for a loss, 0 for a draw, from `me`'s point of view. */
function outcomeFor(s, me) {
	if (s.result === null || s.result === 2) return 0;
	return s.result === me ? 1 : -1;
}
function countMoves(s, p) {
	if (s.inHand[p] > 0) return 0;
	const c = p + 1;
	let n = 0;
	for (let i = 0; i < 24; i++) {
		if (s.board[i] !== c) continue;
		for (const j of ADJACENT[i]) if (s.board[j] === 0) n++;
	}
	return n;
}
/** Heuristic value of `s` for player `p` (material, mills, open twos, mobility). */
function heuristic(s, p) {
	const o = other(p);
	const cp = p + 1, co = o + 1;
	let mills = 0, twos = 0;
	for (const [a, b, c] of MILLS$1) {
		const v = [
			s.board[a],
			s.board[b],
			s.board[c]
		];
		const mine = v.filter((x) => x === cp).length;
		const theirs = v.filter((x) => x === co).length;
		if (mine === 3) mills++;
		else if (theirs === 3) mills--;
		else if (mine === 2 && theirs === 0) twos++;
		else if (theirs === 2 && mine === 0) twos--;
	}
	const material = totalPieces(s, p) - totalPieces(s, o);
	const mobility = countMoves(s, p) - countMoves(s, o);
	return 12 * material + 12 * mills + .4 * twos + .2 * mobility;
}
var WIN = 1e4;
var AlphaBetaAgent = class {
	depth;
	rules;
	prune;
	name;
	/** prune = false gives plain minimax (same choices, slower). */
	constructor(depth, rules = DEFAULT_RULES, prune = true) {
		this.depth = depth;
		this.rules = rules;
		this.prune = prune;
		this.name = `${prune ? "alphabeta" : "minimax"}-d${depth}`;
	}
	startGame() {}
	endGame() {}
	negamax(s, depth, alpha, beta) {
		if (s.result !== null) {
			if (s.result === 2) return 0;
			return s.result === s.toMove ? WIN + depth : -(WIN + depth);
		}
		if (depth === 0) return heuristic(s, s.toMove);
		const acts = legalActions(s);
		acts.sort((x, y) => (y.capture >= 0 ? 1 : 0) - (x.capture >= 0 ? 1 : 0));
		let best = -Infinity;
		for (const a of acts) {
			const v = -this.negamax(applyAction(s, a, this.rules), depth - 1, -beta, -alpha);
			if (v > best) best = v;
			if (v > alpha) alpha = v;
			if (this.prune && alpha >= beta) break;
		}
		return best;
	}
	selectAction(s, rng) {
		const acts = legalActions(s);
		let best = -Infinity;
		let bestActs = [];
		for (const a of acts) {
			const nextState = applyAction(s, a, this.rules);
			const v = -this.negamax(nextState, this.depth - 1, -Infinity, Infinity);
			if (v > best + 1e-9) {
				best = v;
				bestActs = [a];
			} else if (Math.abs(v - best) <= 1e-9) bestActs.push(a);
		}
		return bestActs[Math.floor(rng() * bestActs.length)];
	}
};
var DEFAULT_TD = {
	alpha: .01,
	gamma: .99,
	epsilon: .1,
	lambda: 0,
	captureReward: .15,
	learn: true
};
/**
* Learns V(afterstate) = value of the position right after my move, from my
* point of view. Every time I move again (or the game ends) I update the
* previous afterstate towards  r + gamma * V(new afterstate).
*/
var TDAgent = class {
	net;
	rules;
	name;
	me = 0;
	opts;
	stats = {
		absDelta: [],
		gradNorm: [],
		values: []
	};
	prevX = null;
	prevMyTotal = 0;
	buf = /* @__PURE__ */ new Float32Array(3456);
	/** This agent's own eligibility traces (see ValueNet.createTraces). */
	traces = null;
	constructor(net, opts = {}, name = "td", rules = DEFAULT_RULES) {
		this.net = net;
		this.rules = rules;
		this.opts = {
			...DEFAULT_TD,
			...opts
		};
		this.name = name;
	}
	startGame(me) {
		this.me = me;
		this.prevX = null;
		this.prevMyTotal = 12;
		if (this.opts.lambda > 0 && this.opts.learn) {
			ValueNet.disposeTraces(this.traces);
			this.traces = this.net.createTraces();
		}
	}
	update(target) {
		if (!this.prevX) return;
		const info = this.opts.lambda > 0 && this.traces ? this.net.tdStepTraces(this.prevX, target, this.opts.alpha, this.opts.gamma * this.opts.lambda, this.traces) : this.net.tdStep(this.prevX, target, this.opts.alpha);
		this.stats.absDelta.push(Math.abs(info.delta));
		this.stats.gradNorm.push(info.gradNorm);
		this.stats.values.push(info.value);
	}
	/** Frees trace tensors. Call when the agent is finished with. */
	dispose() {
		ValueNet.disposeTraces(this.traces);
		this.traces = null;
	}
	selectAction(s, rng) {
		const acts = legalActions(s);
		const n = acts.length;
		if (this.buf.length < n * 54) this.buf = new Float32Array(n * 54 * 2);
		const afters = acts.map((a) => applyAction(s, a, this.rules));
		afters.forEach((after, i) => encode(after, this.me, this.buf, i * 54));
		const v = this.net.values(this.buf, n);
		const score = afters.map((after, i) => after.result !== null ? outcomeFor(after, this.me) : v[i]);
		let idx;
		if (this.opts.epsilon > 0 && rng() < this.opts.epsilon) idx = Math.floor(rng() * n);
		else {
			let best = -Infinity;
			const ties = [];
			for (let i = 0; i < n; i++) if (score[i] > best + 1e-9) {
				best = score[i];
				ties.length = 0;
				ties.push(i);
			} else if (Math.abs(score[i] - best) <= 1e-9) ties.push(i);
			idx = ties[Math.floor(rng() * ties.length)];
		}
		const chosen = acts[idx];
		const after = afters[idx];
		if (this.opts.learn) {
			const lost = this.prevMyTotal - totalPieces(s, this.me);
			const r = this.opts.captureReward * ((chosen.capture >= 0 ? 1 : 0) - lost);
			if (after.result !== null) {
				this.update(r + outcomeFor(after, this.me));
				this.prevX = null;
			} else {
				this.update(r + this.opts.gamma * score[idx]);
				this.prevX = this.buf.slice(idx * 54, (idx + 1) * 54);
			}
		}
		this.prevMyTotal = totalPieces(after, this.me);
		return chosen;
	}
	endGame(final) {
		if (!this.opts.learn || !this.prevX) return;
		const lost = this.prevMyTotal - totalPieces(final, this.me);
		this.update(-this.opts.captureReward * lost + outcomeFor(final, this.me));
		this.prevX = null;
	}
	drainStats() {
		const s = this.stats;
		this.stats = {
			absDelta: [],
			gradNorm: [],
			values: []
		};
		return s;
	}
};
/**
* The same learned V, but chosen through a negamax search instead of greedily.
*
* Why this helps: TDAgent picks the best *immediate* afterstate, so it cannot
* see a reply that loses a cow next ply. Searching d plies and only calling V
* at the frontier keeps the learned evaluation but adds tactics.
*
* Perspective matters. V was trained only on afterstates - positions right
* after the learner moved, where `toMove` is the opponent, so feature 52
* ("it is my turn") is always 0. Evaluating a position from the side whose
* turn it is would set that feature to 1 and put the network off-distribution.
* So every leaf is scored as V(encode(leaf, side that just moved)).
*
* depth = 1 reduces exactly to TDAgent's greedy choice.
*/
var SearchTDAgent = class {
	net;
	depth;
	rules;
	name;
	me = 0;
	/** Positions evaluated on the last move, for cost reporting. */
	lastNodes = 0;
	buf = /* @__PURE__ */ new Float32Array(3456);
	constructor(net, depth = 2, name = `td-search-d${depth}`, rules = DEFAULT_RULES) {
		this.net = net;
		this.depth = depth;
		this.rules = rules;
		this.name = name;
	}
	startGame(me) {
		this.me = me;
	}
	endGame() {}
	/** Value of `s` for `s.toMove`, searching `depth` more plies. */
	negamax(s, depth, alpha, beta) {
		const p = s.toMove;
		if (s.result !== null) {
			if (s.result === 2) return 0;
			return s.result === p ? 1 : -1;
		}
		if (depth <= 0) {
			this.lastNodes++;
			return -this.net.value(encode(s, other(p), /* @__PURE__ */ new Float32Array(54), 0));
		}
		const acts = legalActions(s);
		const n = acts.length;
		const afters = acts.map((a) => applyAction(s, a, this.rules));
		if (depth === 1) {
			if (this.buf.length < n * 54) this.buf = new Float32Array(n * 54 * 2);
			let needNet = false;
			for (let i = 0; i < n; i++) {
				encode(afters[i], p, this.buf, i * 54);
				if (afters[i].result === null) needNet = true;
			}
			const v = needNet ? this.net.values(this.buf, n) : null;
			this.lastNodes += n;
			let best = -Infinity;
			for (let i = 0; i < n; i++) {
				const score = afters[i].result !== null ? outcomeFor(afters[i], p) : v[i];
				if (score > best) best = score;
			}
			return best;
		}
		const order = acts.map((_, i) => i).sort((x, y) => (acts[y].capture >= 0 ? 1 : 0) - (acts[x].capture >= 0 ? 1 : 0));
		let best = -Infinity;
		for (const i of order) {
			const v = -this.negamax(afters[i], depth - 1, -beta, -alpha);
			if (v > best) best = v;
			if (v > alpha) alpha = v;
			if (alpha >= beta) break;
		}
		return best;
	}
	selectAction(s, rng) {
		this.lastNodes = 0;
		const acts = legalActions(s);
		let best = -Infinity;
		let ties = [];
		for (const a of acts) {
			const after = applyAction(s, a, this.rules);
			const score = after.result !== null ? outcomeFor(after, this.me) : -this.negamax(after, this.depth - 1, -Infinity, Infinity);
			if (score > best + 1e-9) {
				best = score;
				ties = [a];
			} else if (Math.abs(score - best) <= 1e-9) ties.push(a);
		}
		return ties[Math.floor(rng() * ties.length)];
	}
};
var isTrainingRow = (r) => "mean_abs_td" in r;
/**
* A fixed set of positions used to measure dead units and V(opening)
* consistently across episodes. Built once, from seeded random play, so the
* numbers are comparable from one episode to the next rather than depending on
* whatever happened to be on the board.
*/
var probeCache = null;
function probe() {
	if (probeCache) return probeCache;
	const n = 100;
	const xs = /* @__PURE__ */ new Float32Array(5400);
	const r = mulberry32(99);
	let k = 0;
	while (k < n) {
		let s = initialState();
		while (s.result === null && k < n) {
			const acts = legalActions(s);
			s = applyAction(s, acts[Math.floor(r() * acts.length)]);
			if (r() < .2) encode(s, 1 - s.toMove, xs, 54 * k++);
		}
	}
	probeCache = {
		xs,
		n
	};
	return probeCache;
}
/** The position after White's first placement, encoded for White. */
var openingCache = null;
function openingX() {
	if (!openingCache) openingCache = encode(applyAction(initialState(), {
		from: -1,
		to: 0,
		capture: -1
	}), 0);
	return openingCache;
}
/**
* Accumulates one row per finished episode for a single agent.
*
* Kept outside React state so adding a row never costs a re-render of the
* board; the UI reads `rows` when it refreshes.
*/
var EpisodeStats = class {
	training;
	rows = [];
	wins = 0;
	draws = 0;
	losses = 0;
	plies = 0;
	results = [];
	startedAt = Date.now();
	constructor(training) {
		this.training = training;
	}
	reset() {
		this.rows = [];
		this.wins = this.draws = this.losses = this.plies = 0;
		this.results = [];
		this.startedAt = Date.now();
	}
	tally(result, plies) {
		if (result > 0) this.wins++;
		else if (result < 0) this.losses++;
		else this.draws++;
		this.plies += plies;
		this.results.push(result > 0 ? 1 : result < 0 ? 0 : .5);
		const games = this.wins + this.draws + this.losses;
		const window = this.results.slice(-20);
		return {
			games,
			rolling: window.reduce((a, b) => a + b, 0) / window.length,
			cumulative: this.results.reduce((a, b) => a + b, 0) / games,
			avgPlies: this.plies / games,
			sec: (Date.now() - this.startedAt) / 1e3
		};
	}
	/** Records a finished episode for a learning agent. */
	addTraining(args) {
		const t = this.tally(args.result, args.plies);
		const { absDelta, gradNorm } = args.stats;
		const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
		const p = probe();
		const row = {
			episode: t.games,
			games: t.games,
			result: args.result,
			learner_score: t.rolling,
			cum_score: t.cumulative,
			plies: args.plies,
			avg_plies: t.avgPlies,
			mean_abs_td: mean(absDelta),
			mean_grad_norm: mean(gradNorm),
			zero_grad_frac: gradNorm.length ? gradNorm.filter((g) => g === 0).length / gradNorm.length : 0,
			updates_per_game: gradNorm.length,
			v_opening: args.net.value(openingX()),
			weight_l2: args.net.weightL2(),
			dead: args.net.measuresDeadUnits() ? args.net.deadUnitFraction(p.xs, p.n) : [],
			alpha: args.alpha,
			epsilon: args.epsilon,
			sec: t.sec
		};
		this.rows.push(row);
		return row;
	}
	/** Records a finished episode for a non-learning agent. */
	addPlay(result, plies) {
		const t = this.tally(result, plies);
		const row = {
			episode: t.games,
			games: t.games,
			result,
			learner_score: t.rolling,
			cum_score: t.cumulative,
			plies,
			avg_plies: t.avgPlies,
			wins: this.wins,
			draws: this.draws,
			losses: this.losses,
			sec: t.sec
		};
		this.rows.push(row);
		return row;
	}
	get latest() {
		return this.rows.length ? this.rows[this.rows.length - 1] : null;
	}
	get record() {
		return {
			wins: this.wins,
			draws: this.draws,
			losses: this.losses
		};
	}
	/**
	* CSV of everything collected. Dead-unit columns are named dead_l1,
	* dead_l2, ... one per hidden layer, so a two-layer network produces
	* exactly the header scripts/train.ts writes.
	*/
	toCsv() {
		if (this.rows.length === 0) return "";
		const first = this.rows[0];
		if (isTrainingRow(first)) {
			const layers = first.dead.length;
			const head = [
				"episode",
				"games",
				"result",
				"learner_score",
				"cum_score",
				"plies",
				"avg_plies",
				"mean_abs_td",
				"mean_grad_norm",
				"zero_grad_frac",
				"updates_per_game",
				"v_opening",
				"weight_l2",
				...Array.from({ length: layers }, (_, i) => `dead_l${i + 1}`),
				"alpha",
				"epsilon",
				"sec"
			];
			const body = this.rows.map((r) => [
				r.episode,
				r.games,
				r.result,
				r.learner_score.toFixed(4),
				r.cum_score.toFixed(4),
				r.plies,
				r.avg_plies.toFixed(1),
				r.mean_abs_td.toFixed(5),
				r.mean_grad_norm.toFixed(5),
				r.zero_grad_frac.toFixed(4),
				r.updates_per_game,
				r.v_opening.toFixed(4),
				r.weight_l2.toFixed(3),
				...Array.from({ length: layers }, (_, i) => (r.dead[i] ?? 0).toFixed(3)),
				r.alpha.toFixed(5),
				r.epsilon.toFixed(3),
				r.sec.toFixed(0)
			].join(","));
			return [head.join(","), ...body].join("\n") + "\n";
		}
		const head = [
			"episode",
			"games",
			"result",
			"learner_score",
			"cum_score",
			"plies",
			"avg_plies",
			"wins",
			"draws",
			"losses",
			"sec"
		];
		const body = this.rows.map((r) => [
			r.episode,
			r.games,
			r.result,
			r.learner_score.toFixed(4),
			r.cum_score.toFixed(4),
			r.plies,
			r.avg_plies.toFixed(1),
			r.wins,
			r.draws,
			r.losses,
			r.sec.toFixed(0)
		].join(","));
		return [head.join(","), ...body].join("\n") + "\n";
	}
};
function Panel({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel-card panel-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "panel-heading border-b border-border/80 bg-panel-header px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-info",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children })]
	});
}
function Row({ label, value, icon, last }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-sm ${last ? "" : "border-b border-border/60"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2.5",
			children: [icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-muted-foreground",
				children: icon
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-muted-foreground",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 font-medium",
			children: value
		})]
	});
}
function Disc({ color, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `inline-block h-3.5 w-3.5 rounded-full border ${className} ${color === "W" ? "border-border bg-piece-white" : "border-muted-foreground bg-piece-black"}` });
}
function ringPoints(o) {
	const a = o;
	const b = 600 - o;
	const m = 300;
	return [
		[a, a],
		[m, a],
		[b, a],
		[a, m],
		[b, m],
		[a, b],
		[m, b],
		[b, b]
	];
}
var POINTS = [
	0,
	100,
	200
].flatMap((o) => ringPoints(o));
var RING_EDGES = [
	[0, 1],
	[1, 2],
	[2, 4],
	[4, 7],
	[7, 6],
	[6, 5],
	[5, 3],
	[3, 0]
];
var EDGES = [
	...[
		0,
		8,
		16
	].flatMap((base) => RING_EDGES.map(([a, b]) => [a + base, b + base])),
	[1, 9],
	[9, 17],
	[3, 11],
	[11, 19],
	[4, 12],
	[12, 20],
	[6, 14],
	[14, 22],
	[0, 8],
	[8, 16],
	[2, 10],
	[10, 18],
	[5, 13],
	[13, 21],
	[7, 15],
	[15, 23]
];
var MILLS = [
	[
		0,
		1,
		2
	],
	[
		5,
		6,
		7
	],
	[
		0,
		3,
		5
	],
	[
		2,
		4,
		7
	],
	[
		8,
		9,
		10
	],
	[
		13,
		14,
		15
	],
	[
		8,
		11,
		13
	],
	[
		10,
		12,
		15
	],
	[
		16,
		17,
		18
	],
	[
		21,
		22,
		23
	],
	[
		16,
		19,
		21
	],
	[
		18,
		20,
		23
	],
	[
		1,
		9,
		17
	],
	[
		3,
		11,
		19
	],
	[
		4,
		12,
		20
	],
	[
		6,
		14,
		22
	],
	[
		0,
		8,
		16
	],
	[
		2,
		10,
		18
	],
	[
		5,
		13,
		21
	],
	[
		7,
		15,
		23
	]
];
var ADJACENT_POINTS = {
	0: [
		1,
		3,
		8
	],
	1: [
		0,
		2,
		9
	],
	2: [
		1,
		10,
		4
	],
	3: [
		0,
		11,
		5
	],
	4: [
		2,
		12,
		7
	],
	5: [
		3,
		13,
		6
	],
	6: [
		5,
		7,
		14
	],
	7: [
		4,
		6,
		15
	],
	8: [
		0,
		9,
		16,
		11
	],
	9: [
		1,
		10,
		8
	],
	10: [
		2,
		9,
		12,
		18
	],
	11: [
		3,
		8,
		19,
		13
	],
	12: [
		4,
		10,
		20,
		15
	],
	13: [
		5,
		11,
		21,
		14
	],
	14: [
		6,
		13,
		22,
		15
	],
	15: [
		14,
		23,
		12,
		7
	],
	16: [
		8,
		17,
		19
	],
	17: [
		16,
		9,
		18
	],
	18: [
		17,
		10,
		20
	],
	19: [
		11,
		16,
		21
	],
	20: [
		18,
		12,
		23
	],
	21: [
		19,
		22,
		13
	],
	22: [
		21,
		14,
		23
	],
	23: [
		22,
		15,
		20
	]
};
var setMillEdges = (mill) => {
	const millEdges = [];
	for (let i = 0; i < mill.length - 1; i++) millEdges.push([mill[i], mill[i + 1]]);
	return millEdges;
};
var movesList = (moves) => {
	return moves.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: `border-b border-border/50 ${i === moves.length - 1 ? "bg-info/10" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-3",
				children: m.turn
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-3",
				children: m.agent
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-3 text-center",
				children: m.move
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: `px-4 py-3 text-center ${m.mill ? "font-semibold text-success" : "text-muted-foreground"}`,
				children: m.mill ? "Yes" : "No"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: `px-4 py-3 text-center ${m.capture === "-" ? "text-muted-foreground" : "text-danger"}`,
				children: m.capture
			})
		]
	}, `${m.turn}-${i}`));
};
/** Board as the engine sees it (0 empty, 1 White, 2 Black). */
function engineBoard(match) {
	const board = /* @__PURE__ */ new Int8Array(24);
	for (let i = 0; i < 24; i++) if (match.state.B0[i] === 1) board[i] = 1;
	else if (match.state.B1[i] === 1) board[i] = 2;
	return board;
}
/**
* Opponent cows `player` may capture: any cow that is not in a (current) mill,
* or any cow at all if every one of them is in a mill.
*/
var GenerateLegalCaptures = (match, player) => {
	if (!match?.state) return [];
	return capturablePoints(engineBoard(match), player === 0 ? 1 : 0);
};
/** Snapshot of the arena match in the training engine's format (start of a turn). */
function matchToEngineState(match) {
	return fromBitboards(match.state.B0, match.state.B1, [match.White.placingCows, match.Black.placingCows], match.state.Player);
}
var GenerateLegalMoves = (match, player) => {
	const state = match?.state;
	const agent = match.getAgent(player);
	const B0 = state.B0;
	const B1 = state.B1;
	const own = player === 0 ? B0 : B1;
	const legalMoves = [];
	if (agent.canPlace()) {
		for (let i = 0; i < 24; i++) if (B0[i] === 0 && B1[i] === 0) legalMoves.push({
			from: i,
			to: i
		});
		return legalMoves;
	}
	const flying = agent.Remaining() <= 3;
	for (let from = 0; from < 24; from++) {
		if (own[from] !== 1) continue;
		const targets = flying ? [...Array(24).keys()] : ADJACENT_POINTS[from];
		for (const to of targets) if (B0[to] === 0 && B1[to] === 0) legalMoves.push({
			from,
			to
		});
	}
	return legalMoves;
};
function engineSearch(match, depth, prune) {
	const state = matchToEngineState(match);
	const action = new AlphaBetaAgent(depth, void 0, prune).selectAction(state, Math.random);
	if (!action) return {
		move: {
			from: -1,
			to: -1
		},
		capture: -1
	};
	return {
		move: {
			from: action.from < 0 ? action.to : action.from,
			to: action.to
		},
		capture: action.capture
	};
}
function AlphaBeta(match, depth) {
	return engineSearch(match, depth, true);
}
function getRandomMove(match) {
	const legalMoves = GenerateLegalMoves(match, match.state.Player);
	if (legalMoves.length === 0) return {
		from: -1,
		to: -1
	};
	return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}
function getRandomCapture(match) {
	const legalCaptures = GenerateLegalCaptures(match, match.state.Player);
	if (legalCaptures.length === 0) return -1;
	return legalCaptures[Math.floor(Math.random() * legalCaptures.length)];
}
function isMillFormed(position, B) {
	const item = B[position];
	if (item === null) return false;
	return MILLS.some(([a, b, c]) => {
		if (a !== position && b !== position && c !== position) return false;
		return B[a] === item && B[b] === item && B[c] === item;
	});
}
function getMillFormed(position, B) {
	const item = B[position];
	if (item === null) return null;
	return MILLS.find(([a, b, c]) => {
		if (a !== position && b !== position && c !== position) return false;
		return B[a] === item && B[b] === item && B[c] === item;
	}) ?? null;
}
function GameBoard({ cells, mill, lastMove, whiteReserve = 12, blackReserve = 12 }) {
	const millSet = new Set(mill);
	const millEdges = setMillEdges(mill);
	const [showMill, setShowMill] = (0, import_react.useState)(true);
	const [lastMoveState, setLastMoveState] = (0, import_react.useState)(lastMove);
	const audioContextRef = (0, import_react.useRef)(null);
	const playedMoveRef = (0, import_react.useRef)(null);
	const renderReserve = (player, count) => {
		count = 0;
		const safeCount = Math.max(0, count);
		if (safeCount <= 0) return null;
		const x = player === "white" ? -30 : 660;
		const baseY = 300 - (safeCount - 1) * 22 / 2;
		return Array.from({ length: safeCount }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: x,
			cy: baseY + index * 22,
			r: 12,
			fill: player === "white" ? "var(--piece-white)" : "var(--piece-black)",
			stroke: "var(--border)",
			strokeWidth: 2
		}, `${player}-${index}`));
	};
	(0, import_react.useEffect)(() => {
		if (lastMove[0] !== -1 || lastMove[1] !== -1) setLastMoveState(lastMove);
	}, [lastMove]);
	(0, import_react.useEffect)(() => {
		if (lastMove[0] === -1 || lastMove[1] === -1) return;
		const moveKey = `${lastMove[0]}-${lastMove[1]}`;
		if (playedMoveRef.current === moveKey) return;
		playedMoveRef.current = moveKey;
		const audioContext = audioContextRef.current ?? new AudioContext();
		audioContextRef.current = audioContext;
		audioContext.resume();
		const oscillator = audioContext.createOscillator();
		const gain = audioContext.createGain();
		const startTime = audioContext.currentTime;
		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(500, startTime);
		oscillator.frequency.exponentialRampToValueAtTime(660, startTime + .08);
		gain.gain.setValueAtTime(1e-4, startTime);
		gain.gain.exponentialRampToValueAtTime(.12, startTime + .01);
		gain.gain.exponentialRampToValueAtTime(1e-4, startTime + .14);
		oscillator.connect(gain);
		gain.connect(audioContext.destination);
		oscillator.start(startTime);
		oscillator.stop(startTime + .14);
	}, [lastMove]);
	(0, import_react.useEffect)(() => {
		return () => {
			audioContextRef.current?.close();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (mill.length === 0) return;
		setShowMill(true);
		const timer = setTimeout(() => {
			setShowMill(false);
		}, 2e3);
		return () => clearTimeout(timer);
	}, [mill]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "-40 -40 680 680",
		className: "h-full w-full",
		role: "img",
		"aria-label": "Morabaraba board",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
				id: "mill-glow",
				x: "-60%",
				y: "-60%",
				width: "220%",
				height: "220%",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", {
					stdDeviation: "8",
					result: "b"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feMergeNode", { in: "b" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feMergeNode", { in: "SourceGraphic" })] })]
			}) }),
			renderReserve("white", whiteReserve),
			renderReserve("black", blackReserve),
			EDGES.map(([a, b], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: POINTS[a][0],
				y1: POINTS[a][1],
				x2: POINTS[b][0],
				y2: POINTS[b][1],
				stroke: "var(--wood)",
				strokeWidth: 10,
				strokeLinecap: "round"
			}, i)),
			millEdges.map(([a, b], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: POINTS[a][0],
				y1: POINTS[a][1],
				x2: POINTS[b][0],
				y2: POINTS[b][1],
				stroke: showMill ? "var(--mill)" : "var(--wood)",
				strokeWidth: 2,
				strokeLinecap: "round",
				filter: showMill ? "url(#mill-glow)" : void 0
			}, `m${i}`)),
			lastMoveState[0] !== -1 && lastMoveState[1] !== -1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: POINTS[lastMoveState[0]][0],
				y1: POINTS[lastMoveState[0]][1],
				x2: POINTS[lastMoveState[1]][0],
				y2: POINTS[lastMoveState[1]][1],
				stroke: "var(--info)",
				strokeWidth: 5,
				strokeDasharray: "14 12",
				strokeLinecap: "round"
			}),
			POINTS.map(([x, y], i) => {
				const cell = cells[i];
				if (cell === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: x,
					cy: y,
					r: 0,
					fill: "var(--wood)",
					opacity: .45
				}, i);
				const isMill = millSet.has(i);
				const isLast = lastMoveState.includes(i);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					filter: isMill && showMill ? "url(#mill-glow)" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: x,
						cy: y,
						r: 23,
						fill: cell === 0 ? "var(--piece-white)" : "var(--piece-black)",
						stroke: isMill && showMill ? "var(--mill)" : isLast ? "var(--info)" : "var(--border)",
						strokeWidth: isMill || isLast ? 4 : 2
					})
				}, i);
			})
		]
	});
}
function formatTime(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	const secs = seconds % 60;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function AgentCard({ side, name, algorithm, mode, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border bg-secondary/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-background",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: `h-8 w-8 ${color === "W" ? "text-piece-white" : "text-muted-foreground"}` })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
						children: side
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-xl font-bold",
						children: name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Algorithm: ", algorithm]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 flex items-center gap-2 text-xs text-muted-foreground",
						children: ["Mode:", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `agent-mode-indicator ${mode === "Playing" ? "agent-mode-playing" : "agent-mode-training"}`,
							children: mode
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-5 w-5 shrink-0 rounded-full border ${color === "W" ? "border-border bg-piece-white" : "border-muted-foreground bg-piece-black"}` })
		]
	});
}
function CountdownOverlay({ open, onComplete }) {
	const [count, setCount] = (0, import_react.useState)(5);
	const [message, setMessage] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setCount(5);
		setMessage(false);
		const interval = setInterval(() => {
			setCount((prev) => {
				if (prev === 1) {
					clearInterval(interval);
					setMessage(true);
					setTimeout(() => {
						onComplete();
					}, 1200);
					return 1;
				}
				return prev - 1;
			});
		}, 1e3);
		return () => clearInterval(interval);
	}, [open, onComplete]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50 animate-in fade-in duration-300",
		children: !message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "animate-in zoom-in-50 text-8xl font-display font-bold text-white",
			children: count
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "animate-in zoom-in-75 text-center text-6xl font-display font-bold text-success",
			children: "White Agent Starts"
		})
	});
}
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
function Header({ matchTime, running, matchStatus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "panel-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-warning/70 text-warning",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate font-display text-2xl font-bold uppercase tracking-[0.1em] lg:text-4xl",
					children: "Morabaraba Arena"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:flex",
				children: ["Simulation Status:", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded bg-success/20 px-3 py-1 font-bold text-success",
					children: matchStatus === "IN_PROGRESS" ? "RUNNING" : matchStatus === "PAUSED" ? "PAUSED" : matchStatus == "COMPLETED" ? "COMPLETED" : "NOT STARTED"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/experiment",
				className: "hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "h-4 w-4" }), "Experiments"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 items-center gap-6 border-l border-border pl-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
						children: "Match Time :"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-bold",
						children: formatTime(matchTime)
					})] })]
				})
			})
		]
	});
}
function MainDashboard({ match, matchStatus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Main Dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, {
					side: "White AI Agent",
					name: match?.White.getName() || "",
					algorithm: match?.White.name || "",
					mode: match?.White.mode === 0 ? "Training" : "Playing",
					color: "W"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, {
					side: "Black AI Agent",
					name: match?.Black.getName() || "",
					algorithm: match?.Black.name || "",
					mode: match?.Black.mode === 0 ? "Training" : "Playing",
					color: "B"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }),
				label: "CURRENT TURN",
				value: match?.getCurrentPlayer() || null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }),
				label: "CURRENT PHASE",
				value: match?.Phase() || "Placing Phase"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4" }),
				label: "MOVE COUNTER",
				value: match?.moveCounter() || 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-4 w-4" }),
				label: "MATCH STATUS",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-success",
					children: matchStatus === "IN_PROGRESS" ? "In Progress" : matchStatus === "PAUSED" ? "Paused" : matchStatus == "COMPLETED" ? "Completed" : "Not Started"
				}),
				last: true
			})
		]
	});
}
function SessionConfiguration({ matchStatus, episodeCount, setEpisodeCount, clearTrainedNetworks }) {
	const locked = matchStatus !== "NOT_STARTED";
	const [cleared, setCleared] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Session",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
						children: "Episodes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						step: 1,
						disabled: locked,
						value: episodeCount,
						onChange: (e) => setEpisodeCount(Math.max(1, Number(e.target.value) || 1)),
						className: "w-full rounded-md border border-border bg-panel px-3 py-2 text-sm outline-none transition focus:border-info disabled:opacity-50"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-[11px] leading-snug text-muted-foreground/70",
						children: "Games played back to back. The learning-rate decay is spread across this many."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border/70 bg-panel/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
						children: "Saved networks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-[11px] leading-relaxed text-muted-foreground/80",
						children: "Training continues from the weights saved in this browser. Clear them to start a new run from fresh random weights."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: locked,
						onClick: () => setCleared(clearTrainedNetworks()),
						className: "mt-2.5 flex w-full items-center justify-center gap-2 rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-danger transition hover:bg-danger/20 disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), "Clear trained networks"]
					}),
					cleared !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-success",
						children: cleared === 0 ? "Nothing was saved. The next run starts from random weights." : `Removed ${cleared} saved network${cleared === 1 ? "" : "s"}. The next run starts from random weights.`
					}) : null
				]
			})]
		})
	});
}
function SimulationControls({ startGame, pauseGame, resumeGame, resetGame, showCountdown, onCompleteCountdown, moveInterval, setMoveInterval }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownOverlay, {
		open: showCountdown,
		onComplete: onCompleteCountdown
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Simulation Controls",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3 px-4 pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: startGame,
						className: "flex items-center justify-center gap-2 rounded-md bg-success/25 py-3 text-sm font-semibold uppercase tracking-wide text-success transition-colors hover:bg-success/35",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 fill-current" }), " Start"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: pauseGame,
						className: "flex items-center justify-center gap-2 rounded-md bg-warning/25 py-3 text-sm font-semibold uppercase tracking-wide text-warning transition-colors hover:bg-warning/35",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4 fill-current" }), " Pause"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: resumeGame,
						className: "flex items-center justify-center gap-2 rounded-md bg-info/25 py-3 text-sm font-semibold uppercase tracking-wide text-info transition-colors hover:bg-info/35",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), " Resume"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: resetGame,
					className: "flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-danger/70 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-danger",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " Reset"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "move-interval",
							className: "text-sm font-semibold",
							children: "Time Between Moves"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-sm font-bold text-info",
							children: [(moveInterval / 1e3).toFixed(1), "s"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						id: "move-interval",
						min: 1,
						max: 1e4,
						step: 500,
						value: [moveInterval],
						onValueChange: ([value]) => setMoveInterval(value),
						"aria-label": "Time between moves"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Fast" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Slow" })]
					})
				]
			})
		]
	})] });
}
var cells = [
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null
];
var MILL = [];
var LAST_MOVE = [-1, -1];
function MainGameBoard({ match }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Game Board",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-info/40 bg-info/10 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, {
									color: "W",
									className: "h-5 w-5"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-muted-foreground sm:inline",
									children: "White"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: match?.getPiecesRemaining("White") ?? 12 })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, {
								color: match?.getCurrentPlayer() === "White" ? "W" : "B",
								className: "h-6 w-6 border-2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xl font-bold text-foreground",
								children: match?.getCurrentPlayer() || "White"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-2 text-sm font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: match?.getPiecesRemaining("Black") ?? 12 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-muted-foreground sm:inline",
									children: "Black"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, {
									color: "B",
									className: "h-5 w-5"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-border bg-board p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto aspect-square w-full max-w-[560px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameBoard, {
							cells: match?.cells || cells,
							mill: match?.mill || MILL,
							lastMove: match?.getLastMove() || LAST_MOVE,
							whiteReserve: match?.White.placingCows ?? 12,
							blackReserve: match?.Black.placingCows ?? 12
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: "W" }), " White"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: "B" }), " Black"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-7 rounded-full bg-mill" }), " Mill"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3.5 w-3.5 rounded-full border-2 border-info" }), " Last Move"]
						})
					]
				})
			]
		})
	});
}
function HistoryTable({ moves }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-h-[372px] overflow-y-auto overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[520px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "sticky top-0 z-10 bg-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-semibold",
							children: "Turn"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left font-semibold",
							children: "AI Agent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-center font-semibold",
							children: "Move"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-center font-semibold",
							children: "Mill Formed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-center font-semibold",
							children: "Capture"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: movesList(moves) })]
		})
	});
}
function MoveHistory({ match }) {
	const moves = [...match?.moves ?? []].sort((a, b) => b.turn - a.turn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Move History",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[372px] overflow-y-auto overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTable, { moves })
		})
	});
}
function MatchInfo({ match }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Match Information",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Current Phase",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded bg-info/80 px-2.5 py-1 text-xs font-semibold",
					children: match?.Phase() + " Phase" || "Placing Phase"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Current Turn",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: match?.getCurrentPlayer() === "White" ? "W" : "B" }),
						" ",
						match?.getCurrentPlayer() || "White"
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "White Pieces Remaining",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: "W" }),
						" ",
						match?.getPiecesRemaining("White") || 0
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Black Pieces Remaining",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: "B" }),
						" ",
						match?.getPiecesRemaining("Black") || 0
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Mills Formed (White / Black)",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded bg-info/30 px-2 text-info",
							children: match?.numMillsFormed("White") || 0
						}),
						" ",
						"/",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: "B" }),
						" ",
						match?.numMillsFormed("Black") || 0
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Captures (White / Black)",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-info",
							children: match?.getCaptures("White") || 0
						}),
						" /",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc, { color: "B" }),
						" ",
						match?.getCaptures("Black") || 0
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Winner",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "-"
				}),
				last: true
			})
		]
	});
}
function MatchStatistics({ match, matchTime, whiteWins, blackWins, draws, episodesCompleted, episodeCount, resetStatistics }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Match Statistics",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Total Moves",
				value: match?.moves.length || 38
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "White Wins",
				value: whiteWins
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Black Wins",
				value: blackWins
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Draws",
				value: draws
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Episodes",
				value: `${episodesCompleted} / ${episodeCount}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Average Decision Time",
				value: "1.28s"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Match Duration",
				value: formatTime(matchTime),
				last: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: resetStatistics,
					className: "flex w-full items-center justify-center gap-2 rounded-md bg-danger/70 py-2 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-danger",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " Reset Win Counts"]
				})
			})
		]
	});
}
var fieldClass = "w-full rounded-md border border-border bg-panel px-3 py-2 text-sm outline-none transition focus:border-info focus:ring-1 focus:ring-info/40 disabled:opacity-50";
var labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";
function NumberField({ label, hint, value, onChange, min, max, step, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: labelClass,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "number",
				min,
				max,
				step,
				disabled,
				value,
				onChange: (e) => onChange(Number(e.target.value)),
				className: fieldClass
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-[11px] leading-snug text-muted-foreground/70",
				children: hint
			}) : null
		]
	});
}
/** Editor for the hidden-layer stack: how many layers, and units in each. */
function HiddenLayers({ layers, onChange, disabled }) {
	const setCount = (n) => {
		const next = layers.slice(0, n);
		while (next.length < n) next.push(next[next.length - 1] ?? 64);
		onChange(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: labelClass,
			children: "Hidden layers"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: disabled || layers.length <= 1,
					onClick: () => setCount(layers.length - 1),
					className: "h-9 w-9 shrink-0 rounded-md border border-border bg-panel text-sm font-bold transition hover:border-info disabled:opacity-40",
					"aria-label": "Remove a hidden layer",
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-w-0 flex-1 gap-1.5",
					children: layers.map((units, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						max: 512,
						step: 1,
						disabled,
						value: units,
						onChange: (e) => {
							const next = [...layers];
							next[i] = Number(e.target.value);
							onChange(next);
						},
						className: "min-w-0 flex-1 rounded-md border border-border bg-panel px-2 py-2 text-center text-sm outline-none transition focus:border-info disabled:opacity-50",
						"aria-label": `Units in hidden layer ${i + 1}`
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: disabled || layers.length >= 5,
					onClick: () => setCount(layers.length + 1),
					className: "h-9 w-9 shrink-0 rounded-md border border-border bg-panel text-sm font-bold transition hover:border-info disabled:opacity-40",
					"aria-label": "Add a hidden layer",
					children: "+"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mt-1 block text-[11px] leading-snug text-muted-foreground/70",
			children: [
				"54 inputs → ",
				layers.join(" → "),
				" → 1. Changing this starts a separate network; the old weights are kept and come back if you switch the shape back."
			]
		})
	] });
}
function AgentFields({ algorithm, setAlgorithm, mode, setMode, config, setConfig, locked }) {
	const patch = (p) => setConfig({
		...config,
		...p
	});
	const hasNet = usesNetwork(algorithm);
	const training = mode === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: labelClass,
						children: "Agent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						disabled: locked,
						value: algorithm,
						onChange: (e) => setAlgorithm(e.target.value),
						className: fieldClass,
						children: IMPLEMENTED_ALGORITHMS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a,
							children: a
						}, a))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: labelClass,
						children: "Mode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						disabled: locked || !hasNet,
						value: mode,
						onChange: (e) => setMode(Number(e.target.value)),
						className: fieldClass,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 0,
							children: "Training"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 1,
							children: "Playing"
						})]
					})]
				})]
			}),
			!hasNet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-md border border-border/60 bg-panel/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
				children: [algorithm, " has no value network, so it has nothing to learn. Only its search depth applies, and its panel will show results rather than learning curves."]
			}) : null,
			usesSearchDepth(algorithm) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "Search depth (plies)",
				hint: "1 picks greedily. 2 is a few hundred ms per move. 3 is much stronger but noticeably slower.",
				value: config.searchDepth,
				onChange: (n) => patch({ searchDepth: n }),
				min: 1,
				max: 4,
				step: 1,
				disabled: locked
			}) : null,
			hasNet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
						label: "Learning rate α",
						value: config.alpha,
						onChange: (n) => patch({ alpha: n }),
						min: 0,
						max: 1,
						step: .001,
						disabled: locked || !training
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
						label: "Final α",
						value: config.alphaFinal,
						onChange: (n) => patch({ alphaFinal: n }),
						min: 0,
						max: 1,
						step: .001,
						disabled: locked || !training
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "-mt-2 block text-[11px] leading-snug text-muted-foreground/70",
					children: "α decays linearly from the first episode to the last. Set both the same for no decay."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
						label: "Discount γ",
						value: config.gamma,
						onChange: (n) => patch({ gamma: n }),
						min: 0,
						max: 1,
						step: .01,
						disabled: locked || !training
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
						label: "Lambda λ",
						hint: "0 = TD(0). 1 credits the whole episode (close to Monte Carlo).",
						value: config.lambda,
						onChange: (n) => patch({ lambda: n }),
						min: 0,
						max: 1,
						step: .05,
						disabled: locked || !training
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
						label: "Epsilon ε",
						value: config.epsilon,
						onChange: (n) => patch({ epsilon: n }),
						min: 0,
						max: 1,
						step: .01,
						disabled: locked || !training
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
						label: "Final ε",
						value: config.epsilonFinal,
						onChange: (n) => patch({ epsilonFinal: n }),
						min: 0,
						max: 1,
						step: .01,
						disabled: locked || !training
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "-mt-2 block text-[11px] leading-snug text-muted-foreground/70",
					children: "ε decays linearly from the first episode to the last. Playing agents are always greedy (ε = 0)."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: labelClass,
							children: "Activation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							disabled: locked,
							value: config.activation,
							onChange: (e) => patch({ activation: e.target.value }),
							className: fieldClass,
							children: ACTIVATIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: a,
								children: a
							}, a))
						}),
						config.activation !== "relu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-[11px] leading-snug text-muted-foreground/70",
							children: "Dead-unit tracking only means something for ReLU, so it is reported as n/a here."
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HiddenLayers, {
					layers: config.hiddenLayers,
					onChange: (l) => patch({ hiddenLayers: l }),
					disabled: locked
				})
			] }) : null
		]
	});
}
function AgentConfigPanel({ locked, whiteAlgorithm, blackAlgorithm, setWhiteAlgorithm, setBlackAlgorithm, whiteMode, blackMode, setWhiteMode, setBlackMode, whiteConfig, blackConfig, setWhiteConfig, setBlackConfig }) {
	const [side, setSide] = (0, import_react.useState)("white");
	const isWhite = side === "white";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Agent Configuration",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-1 rounded-lg border border-border bg-panel/70 p-1",
					children: ["white", "black"].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSide(s),
						className: `flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition ${side === s ? "bg-info/15 text-info shadow-[0_0_14px_hsl(var(--info)/0.25)]" : "text-muted-foreground hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2.5 w-2.5 rounded-full border ${s === "white" ? "border-border bg-piece-white" : "border-muted-foreground bg-piece-black"}` }), s]
					}, s))
				}),
				locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning",
					children: "Locked while a session is running. Changing settings mid-run would split it across two configurations. Reset to edit."
				}) : null,
				isWhite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentFields, {
					algorithm: whiteAlgorithm,
					setAlgorithm: setWhiteAlgorithm,
					mode: whiteMode,
					setMode: setWhiteMode,
					config: whiteConfig,
					setConfig: setWhiteConfig,
					locked
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentFields, {
					algorithm: blackAlgorithm,
					setAlgorithm: setBlackAlgorithm,
					mode: blackMode,
					setMode: setBlackMode,
					config: blackConfig,
					setConfig: setBlackConfig,
					locked
				})
			]
		})
	});
}
/** Grab the SVG inside a container, render it on a canvas, and trigger a PNG download. */
function saveSvgAsPng(container, filename) {
	const svg = container.querySelector("svg");
	if (!svg) return;
	const clone = svg.cloneNode(true);
	const bg = getComputedStyle(document.documentElement).getPropertyValue("--panel").trim() || "#1a1a2e";
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	clone.style.backgroundColor = `oklch(${bg})`;
	const xml = new XMLSerializer().serializeToString(clone);
	const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const img = new Image();
	img.onload = () => {
		const scale = 2;
		const canvas = document.createElement("canvas");
		canvas.width = img.width * scale;
		canvas.height = img.height * scale;
		const ctx = canvas.getContext("2d");
		ctx.scale(scale, scale);
		ctx.drawImage(img, 0, 0);
		URL.revokeObjectURL(url);
		canvas.toBlob((b) => {
			if (!b) return;
			const a = document.createElement("a");
			a.href = URL.createObjectURL(b);
			a.download = filename;
			a.click();
			URL.revokeObjectURL(a.href);
		}, "image/png");
	};
	img.src = url;
}
/** Above this many episodes the charts are thinned out so they stay smooth. */
var MAX_POINTS = 300;
function downsample(rows) {
	if (rows.length <= MAX_POINTS) return rows;
	const step = Math.ceil(rows.length / MAX_POINTS);
	const out = rows.filter((_, i) => i % step === 0);
	if (out[out.length - 1] !== rows[rows.length - 1]) out.push(rows[rows.length - 1]);
	return out;
}
function MiniChart({ title, hint, data, series, domain, zeroLine }) {
	const chartRef = (0, import_react.useRef)(null);
	const hasRight = series.some((s) => s.axis === "right");
	const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border/70 bg-panel/50 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2",
					children: [series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 text-[10px] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-1.5 w-3 rounded-full",
							style: { background: s.color }
						}), s.label]
					}, s.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Save chart as PNG",
						onClick: () => chartRef.current && saveSvgAsPng(chartRef.current, `${slug}.png`),
						className: "ml-1 rounded p-0.5 text-muted-foreground/60 transition hover:text-info",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							xmlns: "http://www.w3.org/2000/svg",
							width: "12",
							height: "12",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "7 10 12 15 17 10" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
									x1: "12",
									y1: "15",
									x2: "12",
									y2: "3"
								})
							]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: chartRef,
				className: "h-28 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data,
						margin: {
							top: 4,
							right: 6,
							bottom: 0,
							left: -18
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--border)",
								strokeDasharray: "2 4",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "episode",
								tick: {
									fontSize: 9,
									fill: "var(--muted-foreground)"
								},
								stroke: "var(--border)",
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								yAxisId: "left",
								tick: {
									fontSize: 9,
									fill: "var(--muted-foreground)"
								},
								stroke: "var(--border)",
								tickLine: false,
								domain: domain ?? ["auto", "auto"],
								width: 44
							}),
							hasRight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								yAxisId: "right",
								orientation: "right",
								tick: {
									fontSize: 9,
									fill: "var(--muted-foreground)"
								},
								stroke: "var(--border)",
								tickLine: false,
								width: 38
							}) : null,
							zeroLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								yAxisId: "left",
								y: 0,
								stroke: "var(--border)",
								strokeWidth: 1
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									background: "var(--panel)",
									border: "1px solid var(--border)",
									borderRadius: 8,
									fontSize: 11
								},
								labelFormatter: (v) => `Episode ${v}`,
								formatter: (v, name) => [typeof v === "number" ? v.toFixed(4) : v, name]
							}),
							series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								yAxisId: s.axis ?? "left",
								type: "monotone",
								dataKey: s.key,
								name: s.label,
								stroke: s.color,
								strokeWidth: 1.6,
								dot: data.length <= 2 ? {
									r: 2.5,
									fill: s.color
								} : false,
								isAnimationActive: false
							}, s.key))
						]
					})
				})
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[10px] leading-snug text-muted-foreground/70",
				children: hint
			}) : null
		]
	});
}
function Metric({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border/60 bg-panel/40 px-2.5 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-[0.08em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-mono text-sm font-semibold ${tone === "good" ? "text-success" : tone === "bad" ? "text-danger" : tone === "warn" ? "text-warning" : ""}`,
			children: value
		})]
	});
}
function download(name, text) {
	const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}
function TrainingCharts({ rows }) {
	const data = (0, import_react.useMemo)(() => downsample(rows).map((r) => ({
		episode: r.episode,
		mean_abs_td: r.mean_abs_td,
		mean_grad_norm: r.mean_grad_norm,
		zero_grad_frac: r.zero_grad_frac,
		dead_l1: r.dead[0] ?? 0,
		dead_last: r.dead.length ? r.dead[r.dead.length - 1] : 0,
		v_opening: r.v_opening,
		weight_l2: r.weight_l2,
		learner_score: r.learner_score,
		avg_plies: r.avg_plies,
		alpha: r.alpha,
		epsilon: r.epsilon
	})), [rows, rows.length]);
	const hasDead = rows[rows.length - 1].dead.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
				title: "TD error & gradient",
				hint: "|TD error| falling means the value function is settling. A flat line means it never converges.",
				data,
				series: [{
					key: "mean_abs_td",
					label: "|TD|",
					color: "var(--info)"
				}, {
					key: "mean_grad_norm",
					label: "|grad|",
					color: "var(--chart-2)",
					axis: "right"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
				title: hasDead ? "Zero gradients & dead units" : "Zero gradients",
				hint: "Both should stay at or near 0. This is the pair that would have caught the original dying-ReLU bug.",
				data,
				domain: [0, 1],
				series: hasDead ? [
					{
						key: "zero_grad_frac",
						label: "zero grad",
						color: "var(--danger)"
					},
					{
						key: "dead_l1",
						label: "dead L1",
						color: "var(--warning)"
					},
					{
						key: "dead_last",
						label: "dead last",
						color: "var(--mill)"
					}
				] : [{
					key: "zero_grad_frac",
					label: "zero grad",
					color: "var(--danger)"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
				title: "V(opening) & weight norm",
				hint: "V(opening) near 0 is right for a fair position. A climbing weight norm means the network is blowing up.",
				data,
				zeroLine: true,
				series: [{
					key: "v_opening",
					label: "V(open)",
					color: "var(--success)"
				}, {
					key: "weight_l2",
					label: "‖w‖",
					color: "var(--chart-5)",
					axis: "right"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
				title: "Outcomes",
				hint: "Rolling score over the last 20 episodes (left), and average game length (right).",
				data,
				domain: [0, 1],
				series: [{
					key: "learner_score",
					label: "score",
					color: "var(--success)"
				}, {
					key: "avg_plies",
					label: "plies",
					color: "var(--muted-foreground)",
					axis: "right"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
				title: "Decay schedule",
				hint: "Confirms α and ε are actually decaying across the session.",
				data,
				series: [{
					key: "alpha",
					label: "α",
					color: "var(--info)"
				}, {
					key: "epsilon",
					label: "ε",
					color: "var(--warning)",
					axis: "right"
				}]
			})
		]
	});
}
function PlayCharts({ rows }) {
	const data = (0, import_react.useMemo)(() => downsample(rows).map((r) => ({
		episode: r.episode,
		learner_score: r.learner_score,
		cum_score: r.cum_score,
		avg_plies: r.avg_plies
	})), [rows, rows.length]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
			title: "Score",
			hint: "(wins + ½ draws) / games. Rolling over the last 20 episodes, and over the whole session.",
			data,
			domain: [0, 1],
			series: [{
				key: "learner_score",
				label: "rolling",
				color: "var(--success)"
			}, {
				key: "cum_score",
				label: "overall",
				color: "var(--info)"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniChart, {
			title: "Average game length",
			data,
			series: [{
				key: "avg_plies",
				label: "plies",
				color: "var(--muted-foreground)"
			}]
		})]
	});
}
function SideStats({ side, algorithm, mode, rows, onClear }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "rounded-md border border-border/60 bg-panel/50 px-3 py-6 text-center text-xs text-muted-foreground",
		children: [
			"No episodes finished yet. Stats appear here as ",
			side,
			" plays."
		]
	});
	const latest = rows[rows.length - 1];
	const training = isTrainingRow(latest);
	const wins = rows.filter((r) => r.result > 0).length;
	const losses = rows.filter((r) => r.result < 0).length;
	const draws = rows.length - wins - losses;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						algorithm,
						" · ",
						mode === 0 ? "training" : "playing",
						" · ",
						rows.length,
						" episode",
						rows.length === 1 ? "" : "s"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClear,
						className: "rounded-md border border-danger/50 bg-danger/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-danger transition hover:bg-danger/20",
						children: "Clear"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const csv = csvFor(rows);
							download(`${side.toLowerCase()}-${training ? "training" : "play"}-stats.csv`, csv);
						},
						className: "rounded-md border border-info/50 bg-info/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-info transition hover:bg-info/20",
						children: "Export CSV"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "W / D / L",
						value: `${wins}/${draws}/${losses}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Score",
						value: latest.cum_score.toFixed(3)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Avg plies",
						value: latest.avg_plies.toFixed(1)
					}),
					training ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "|TD error|",
							value: latest.mean_abs_td.toFixed(4)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "|grad|",
							value: latest.mean_grad_norm.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Zero grad",
							value: latest.zero_grad_frac.toFixed(3),
							tone: latest.zero_grad_frac > .01 ? "bad" : "good"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Updates/game",
							value: String(latest.updates_per_game)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "V(opening)",
							value: latest.v_opening.toFixed(4)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "‖w‖",
							value: latest.weight_l2.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Dead units",
							value: latest.dead.length ? latest.dead.map((d) => d.toFixed(2)).join(" / ") : "n/a",
							tone: latest.dead.length && latest.dead.some((d) => d > .2) ? "warn" : void 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "α",
							value: latest.alpha.toFixed(5)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "ε",
							value: latest.epsilon.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Elapsed",
							value: `${Math.round(latest.sec)}s`
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Last result",
							value: latest.result > 0 ? "win" : latest.result < 0 ? "loss" : "draw"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Rolling",
							value: latest.learner_score.toFixed(3)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Elapsed",
							value: `${Math.round(latest.sec)}s`
						})
					] })
				]
			}),
			training ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainingCharts, { rows }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayCharts, { rows })
		]
	});
}
/** Rebuilds a CSV from rows the panel already holds. */
function csvFor(rows) {
	const first = rows[0];
	if (isTrainingRow(first)) {
		const layers = first.dead.length;
		const head = [
			"episode",
			"games",
			"result",
			"learner_score",
			"cum_score",
			"plies",
			"avg_plies",
			"mean_abs_td",
			"mean_grad_norm",
			"zero_grad_frac",
			"updates_per_game",
			"v_opening",
			"weight_l2",
			...Array.from({ length: layers }, (_, i) => `dead_l${i + 1}`),
			"alpha",
			"epsilon",
			"sec"
		];
		const body = rows.map((r) => [
			r.episode,
			r.games,
			r.result,
			r.learner_score.toFixed(4),
			r.cum_score.toFixed(4),
			r.plies,
			r.avg_plies.toFixed(1),
			r.mean_abs_td.toFixed(5),
			r.mean_grad_norm.toFixed(5),
			r.zero_grad_frac.toFixed(4),
			r.updates_per_game,
			r.v_opening.toFixed(4),
			r.weight_l2.toFixed(3),
			...Array.from({ length: layers }, (_, i) => (r.dead[i] ?? 0).toFixed(3)),
			r.alpha.toFixed(5),
			r.epsilon.toFixed(3),
			r.sec.toFixed(0)
		].join(","));
		return [head.join(","), ...body].join("\n") + "\n";
	}
	const head = [
		"episode",
		"games",
		"result",
		"learner_score",
		"cum_score",
		"plies",
		"avg_plies",
		"sec"
	];
	const body = rows.map((r) => [
		r.episode,
		r.games,
		r.result,
		r.learner_score.toFixed(4),
		r.cum_score.toFixed(4),
		r.plies,
		r.avg_plies.toFixed(1),
		r.sec.toFixed(0)
	].join(","));
	return [head.join(","), ...body].join("\n") + "\n";
}
function StatsPanel({ whiteAlgorithm, blackAlgorithm, whiteMode, blackMode, whiteStats, blackStats, onClearStats }) {
	const [side, setSide] = (0, import_react.useState)(whiteMode === 0 ? "white" : blackMode === 0 ? "black" : "white");
	const isWhite = side === "white";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Live Statistics",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-1 rounded-lg border border-border bg-panel/70 p-1",
				children: ["white", "black"].map((s) => {
					const mode = s === "white" ? whiteMode : blackMode;
					const count = (s === "white" ? whiteStats : blackStats).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSide(s),
						className: `rounded-md px-2 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition ${side === s ? "bg-info/15 text-info shadow-[0_0_14px_hsl(var(--info)/0.25)]" : "text-muted-foreground hover:text-foreground"}`,
						children: [
							s,
							" · ",
							mode === 0 ? "train" : "play",
							count ? ` · ${count}` : ""
						]
					}, s);
				})
			}), isWhite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideStats, {
				side: "White",
				algorithm: whiteAlgorithm,
				mode: whiteMode,
				rows: whiteStats,
				onClear: () => onClearStats(0)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideStats, {
				side: "Black",
				algorithm: blackAlgorithm,
				mode: blackMode,
				rows: blackStats,
				onClear: () => onClearStats(1)
			})]
		})
	});
}
/** Prefix shared by every saved network, so they can all be cleared at once. */
var STORAGE_PREFIX = "morabaraba-neural-network";
var NeuralNetwork = class extends ValueNet {
	constructor(config = DEFAULT_NET_CONFIG) {
		super(config);
	}
	saveToLocalStorage(key) {
		if (typeof localStorage === "undefined") return;
		try {
			localStorage.setItem(`${key}-v2`, JSON.stringify(this.toJSON()));
		} catch {}
	}
	/**
	* Returns false when there is nothing saved, or when what is saved has a
	* different shape (because the architecture was changed since). The caller
	* then keeps the fresh random initialisation.
	*/
	loadFromLocalStorage(key) {
		if (typeof localStorage === "undefined") return false;
		try {
			const raw = localStorage.getItem(`${key}-v2`);
			if (!raw) return false;
			return this.loadJSON(JSON.parse(raw));
		} catch {
			return false;
		}
	}
};
/**
* Forgets every network saved in this browser.
*
* After this the next session starts from fresh random weights, which is how
* you begin a genuinely new training run rather than continuing the previous one.
*/
function clearSavedNetworks() {
	if (typeof localStorage === "undefined") return 0;
	const doomed = [];
	try {
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k && k.startsWith("morabaraba-neural-network")) doomed.push(k);
		}
		doomed.forEach((k) => localStorage.removeItem(k));
	} catch {
		return 0;
	}
	return doomed.length;
}
DEFAULT_AGENT_CONFIG.searchDepth;
var sharedNetworks = /* @__PURE__ */ new Map();
/** One stats collector per colour, living across the episodes of a session. */
var sharedStats = /* @__PURE__ */ new Map();
/**
* One network per colour *and architecture*. Including the architecture means
* switching to 32,32 starts a fresh network instead of failing to load the
* 64,64 weights, and switching back finds the old ones still there.
*/
function getSharedNetwork(key, config) {
	let net = sharedNetworks.get(key);
	if (!net) {
		net = new NeuralNetwork({
			hidden: config.hiddenLayers,
			activation: config.activation
		});
		net.loadFromLocalStorage(key);
		sharedNetworks.set(key, net);
	}
	return net;
}
function getSharedStats(key, training) {
	const existing = sharedStats.get(key);
	if (existing && existing.training === training) return existing;
	const fresh = new EpisodeStats(training);
	sharedStats.set(key, fresh);
	return fresh;
}
/** Stats for the current session, by colour. Read by the dashboard. */
function sessionStats(player) {
	return sharedStats.get(statsKey(player)) ?? null;
}
/** Clears only the recorded stats for one side, without touching the network. */
function resetStats(player) {
	const key = statsKey(player);
	const existing = sharedStats.get(key);
	if (existing) existing.reset();
}
var statsKey = (player) => player === 0 ? "white" : "black";
/**
* Drops the in-memory networks and stats, and the saved copies in
* localStorage, so the next session starts from fresh random weights
* rather than continuing where it left off.
*/
function resetLearning() {
	sharedNetworks.clear();
	sharedStats.clear();
	return clearSavedNetworks();
}
var Phase = class {
	x;
	y;
	z;
	constructor() {
		this.x = 1;
		this.y = 0;
		this.z = 0;
	}
};
var State = class {
	B0;
	B1;
	phase;
	Player;
	B0Remaining;
	B1Remaining;
	constructor(Player) {
		this.B0 = [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		];
		this.B1 = [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		];
		this.phase = new Phase();
		this.Player = Player;
		this.B0Remaining = 12;
		this.B1Remaining = 12;
	}
	getPhase() {
		if (this.phase.x === 1) return "Placing";
		else if (this.phase.y === 1) return "Moving";
		else return "Flying";
	}
	setPhase(phase) {
		if (phase === "Placing") {
			this.phase.x = 1;
			this.phase.y = 0;
			this.phase.z = 0;
		} else if (phase === "Moving") {
			this.phase.x = 0;
			this.phase.y = 1;
			this.phase.z = 0;
		} else {
			this.phase.x = 0;
			this.phase.y = 0;
			this.phase.z = 1;
		}
	}
	setB0(move) {
		const { from, to } = move;
		this.B0[from] = 0;
		this.B0[to] = 1;
	}
	setB1(move) {
		const { from, to } = move;
		this.B1[from] = 0;
		this.B1[to] = 1;
	}
	setB(move) {
		if (this.Player === 0) this.setB0(move);
		else this.setB1(move);
	}
	printB() {
		console.log("B0: ", this.B0);
		console.log("B1: ", this.B1);
	}
	getPlayer() {
		if (this.Player === 0) return "White";
		else return "Black";
	}
};
var Agent = class Agent {
	name;
	Player;
	mode;
	placingCows;
	Cows;
	network;
	td;
	/** Same network, played through a search. Used by Algorithm.TD_SEARCH. */
	search;
	config;
	stats;
	/** Learning rate actually used this episode, after decay. */
	alphaNow;
	epsilonNow;
	constructor(Player, mode, algorithm, config = DEFAULT_AGENT_CONFIG, episodeIndex = 0, totalEpisodes = 1) {
		this.name = algorithm;
		this.Player = Player;
		this.mode = mode;
		this.Cows = 12;
		this.placingCows = 12;
		this.config = config;
		const training = mode === 0 && usesNetwork(algorithm);
		this.network = getSharedNetwork(Agent.getNetworkStorageKey(Player, config), config);
		this.stats = getSharedStats(statsKey(Player), training);
		const t = totalEpisodes > 1 ? Math.min(1, episodeIndex / (totalEpisodes - 1)) : 0;
		this.alphaNow = config.alpha + (config.alphaFinal - config.alpha) * t;
		this.epsilonNow = training ? config.epsilon + (config.epsilonFinal - config.epsilon) * t : 0;
		this.td = new TDAgent(this.network, {
			learn: training,
			alpha: this.alphaNow,
			gamma: config.gamma,
			lambda: config.lambda,
			epsilon: this.epsilonNow
		});
		this.td.startGame(Player);
		this.search = new SearchTDAgent(this.network, config.searchDepth);
		this.search.startGame(Player);
	}
	/** True when this agent is learning from the games it plays. */
	get isTraining() {
		return this.mode === 0 && usesNetwork(this.name);
	}
	/** Final TD update for this agent once the game is decided. */
	finishGame(match) {
		if (!this.isTraining) return;
		const final = matchToEngineState(match);
		final.result = match.winner === null ? 2 : match.winner;
		this.td.endGame(final);
	}
	/**
	* Records this episode. Training agents get the full learning diagnostics;
	* agents that are only playing get their results.
	*/
	recordEpisode(match) {
		const result = match.winner === null ? 0 : match.winner === this.Player ? 1 : -1;
		const plies = match.moveCounter();
		if (this.isTraining) this.stats.addTraining({
			result,
			plies,
			stats: this.td.drainStats(),
			net: this.network,
			alpha: this.alphaNow,
			epsilon: this.epsilonNow
		});
		else this.stats.addPlay(result, plies);
	}
	static getNetworkStorageKey(player, config) {
		return `${STORAGE_PREFIX}-${player === 0 ? "white" : "black"}-${architectureKey(config)}`;
	}
	saveTrainingNetwork() {
		if (!this.isTraining) return;
		this.network.saveToLocalStorage(Agent.getNetworkStorageKey(this.Player, this.config));
	}
	getName() {
		return this.name;
	}
	Remaining() {
		return this.Cows;
	}
	canPlace() {
		return this.placingCows > 0;
	}
	placeCow() {
		if (this.placingCows > 0) this.placingCows -= 1;
	}
	addCapturedCow() {
		this.placingCows += 1;
	}
	chooseMoveAndCapture(match) {
		var Capture = -1;
		if (this.name === Algorithm.MINIMAX) {
			const { capture, move } = AlphaBeta(match, 2);
			return [capture, move];
		}
		if (this.name === Algorithm.TD || this.name === Algorithm.TD_SEARCH) {
			const useSearch = this.name === Algorithm.TD_SEARCH && this.mode !== 0;
			const state = matchToEngineState(match);
			const action = useSearch ? this.search.selectAction(state, Math.random) : this.td.selectAction(state, Math.random);
			const from = action.from < 0 ? action.to : action.from;
			return [action.capture, {
				from,
				to: action.to
			}];
		}
		if (match.mill.length > 0) Capture = getRandomCapture(match);
		return [Capture, getRandomMove(match)];
	}
	chooseCapture(match) {
		return getRandomCapture(match);
	}
	GenerateLegalCaptures(state, millsFormed) {
		if (this.Player === 0) return state.B1.map((value, index) => value === 1 && !millsFormed.some((mill) => mill.includes(index)) ? index : -1).filter((index) => index !== -1);
		else return state.B0.map((value, index) => value === 1 && !millsFormed.some((mill) => mill.includes(index)) ? index : -1).filter((index) => index !== -1);
	}
	moveAndCapture(match) {}
};
var Match = class {
	White;
	Black;
	state;
	score;
	moves;
	isMove;
	cells;
	moveHistory;
	mill;
	millsFormed;
	lastMove;
	winner;
	trainingNetworksSaved;
	constructor(white, black, episodeIndex = 0, totalEpisodes = 1) {
		this.White = new Agent(0, white.mode, white.algorithm, white.config, episodeIndex, totalEpisodes);
		this.Black = new Agent(1, black.mode, black.algorithm, black.config, episodeIndex, totalEpisodes);
		this.state = new State(0);
		this.score = {
			white: 0,
			black: 0
		};
		this.moves = [];
		this.cells = Array(24).fill(null);
		this.isMove = true;
		this.moveHistory = [];
		this.mill = [];
		this.lastMove = [-1, -1];
		this.winner = null;
		this.trainingNetworksSaved = false;
		this.millsFormed = {
			white: [],
			black: []
		};
	}
	getState() {
		return this.state;
	}
	moveCounter() {
		return this.moves.length;
	}
	Phase() {
		return this.state.getPhase();
	}
	setPhase(phase) {
		this.state.setPhase(phase);
	}
	Player() {
		return this.state.getPlayer();
	}
	getCurrentPlayer() {
		return this.state.getPlayer();
	}
	getAgent(player) {
		if (player === 0) return this.White;
		else return this.Black;
	}
	getCurrentPlayerAgent() {
		if (this.getCurrentPlayer() === "White") return this.White;
		else return this.Black;
	}
	getWinner() {
		if (this.winner === 0) return "White";
		else if (this.winner === 1) return "Black";
		else return null;
	}
	getScore() {
		return this.score;
	}
	getPiecesRemaining(player) {
		if (player === "White") return this.White.Remaining();
		else return this.Black.Remaining();
	}
	numMillsFormed(player) {
		if (player === "White") return this.millsFormed.white.length;
		else return this.millsFormed.black.length;
	}
	getCaptures(player) {
		if (player === "White") return 12 - this.White.Remaining();
		else return 12 - this.Black.Remaining();
	}
	doMove(move) {
		const { from, to } = move;
		this.cells[from] = null;
		this.cells[to] = this.state.Player;
		this.state.setB(move);
		this.lastMove = [from, to];
		if (this.getCurrentPlayerAgent().canPlace()) {
			this.getCurrentPlayerAgent().placeCow();
			if (!this.getCurrentPlayerAgent().canPlace()) if (this.getCurrentPlayerAgent().Remaining() <= 3) this.setPhase("Flying");
			else this.setPhase("Moving");
		} else if (this.Phase() == "Flying") {} else if (this.getCurrentPlayerAgent().Remaining() <= 3) this.setPhase("Flying");
	}
	doMoveOrCapture(move, capture) {
		if (this.isMove) {
			this.doMove(move);
			this.formMill(move.to);
			this.isMove = false;
		} else {
			const [from, to] = this.lastMove;
			this.Capture(capture);
			this.isMove = true;
			this.state.Player = this.state.Player === 0 ? 1 : 0;
			this.moves.push({
				turn: this.moveCounter() + 1,
				agent: this.getCurrentPlayer(),
				move: `Moved from ${from} to ${to}`,
				mill: false,
				capture: capture !== -1 ? `${capture}` : ""
			});
		}
	}
	formMill(position) {
		this.mill = [];
		if (this.getCurrentPlayer() === "White") {
			if (isMillFormed(position, this.state.B0)) {
				const formedMill = getMillFormed(position, this.state.B0);
				if (formedMill) {
					this.mill = [...formedMill];
					this.millsFormed.white.push([...formedMill]);
				}
			}
		} else if (isMillFormed(position, this.state.B1)) {
			const formedMill = getMillFormed(position, this.state.B1);
			if (formedMill) {
				this.mill = [...formedMill];
				this.millsFormed.black.push([...formedMill]);
			}
		}
	}
	getLastMove() {
		return this.lastMove;
	}
	endGame(winner) {
		this.winner = winner;
		if (!this.trainingNetworksSaved) {
			this.White.finishGame(this);
			this.Black.finishGame(this);
			this.White.recordEpisode(this);
			this.Black.recordEpisode(this);
			this.White.saveTrainingNetwork();
			this.Black.saveTrainingNetwork();
			this.trainingNetworksSaved = true;
		}
		return true;
	}
	isGameOver() {
		if (this.trainingNetworksSaved) return true;
		if (this.White.Remaining() < 3 || this.Black.Remaining() < 3) return this.endGame(this.White.Remaining() < 3 ? 1 : 0);
		if (this.isMove) {
			const toMove = this.state.Player;
			if (GenerateLegalMoves(this, toMove).length === 0) return this.endGame(toMove === 0 ? 1 : 0);
			if (this.moveCounter() >= 200) return this.endGame(null);
		}
		return false;
	}
	Capture(position) {
		if (this.mill.length !== 0) if (this.state.Player === 0) {
			this.state.B1[position] = 0;
			this.cells[position] = null;
			this.Black.Cows = Math.max(0, this.Black.Cows - 1);
			this.state.B1Remaining--;
			this.moves.push({
				turn: this.moveCounter(),
				agent: this.getCurrentPlayer(),
				move: `Captured piece at ${position}`,
				mill: false,
				capture: `${position}`
			});
		} else {
			this.state.B0[position] = 0;
			this.cells[position] = null;
			this.state.B0Remaining--;
			this.White.Cows = Math.max(0, this.White.Cows - 1);
			this.moves.push({
				turn: this.moveCounter(),
				agent: this.getCurrentPlayer(),
				move: `Captured piece at ${position}`,
				mill: false,
				capture: `${position}`
			});
		}
	}
};
function useMatchTimer() {
	const [moveInterval, setMoveInterval] = (0, import_react.useState)(3500);
	const [matchTime, setMatchTime] = (0, import_react.useState)(0);
	const [matchStatus, setMatchStatus] = (0, import_react.useState)("NOT_STARTED");
	const [showCountdown, setShowCountdown] = (0, import_react.useState)(false);
	const [whiteAlgorithm, setWhiteAlgorithm] = (0, import_react.useState)(Algorithm.TD);
	const [blackAlgorithm, setBlackAlgorithm] = (0, import_react.useState)(Algorithm.TD);
	const [whiteMode, setWhiteMode] = (0, import_react.useState)(1);
	const [blackMode, setBlackMode] = (0, import_react.useState)(1);
	const [whiteWins, setWhiteWins] = (0, import_react.useState)(0);
	const [blackWins, setBlackWins] = (0, import_react.useState)(0);
	const [draws, setDraws] = (0, import_react.useState)(0);
	const [episodeCount, setEpisodeCount] = (0, import_react.useState)(1);
	const [episodesCompleted, setEpisodesCompleted] = (0, import_react.useState)(0);
	const [whiteConfig, setWhiteConfigRaw] = (0, import_react.useState)(DEFAULT_AGENT_CONFIG);
	const [blackConfig, setBlackConfigRaw] = (0, import_react.useState)(DEFAULT_AGENT_CONFIG);
	/** Bumped whenever a stats row is appended, so panels re-render. */
	const [statsVersion, setStatsVersion] = (0, import_react.useState)(0);
	const canChangeAlgorithms = matchStatus === "NOT_STARTED";
	const setWhiteConfig = (c) => canChangeAlgorithms && setWhiteConfigRaw(clampConfig(c));
	const setBlackConfig = (c) => canChangeAlgorithms && setBlackConfigRaw(clampConfig(c));
	const [match, setMatch] = (0, import_react.useState)(null);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [, setTick] = (0, import_react.useState)(0);
	const pendingCapture = (0, import_react.useRef)(null);
	const completedEpisodes = (0, import_react.useRef)(0);
	/**
	* The match we have already counted.
	*
	* Without this the episode counter double-counts: after a game ends we call
	* startNextEpisode(), but React does not run the effect cleanup (which
	* clears this interval) until the re-render commits, so the old interval can
	* fire once more, still holding the finished match, and count it again. A
	* "5 episode" session then only plays 3 games.
	*/
	const countedMatch = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!running) return;
		const interval = setInterval(() => {
			setMatchTime((prev) => prev + 1);
		}, 1e3);
		return () => clearInterval(interval);
	}, [running]);
	(0, import_react.useEffect)(() => {
		if (!running || !match) return;
		const interval = setInterval(() => {
			if (match.isGameOver()) {
				if (countedMatch.current === match) return;
				countedMatch.current = match;
				if (match.getWinner() === "White") setWhiteWins((wins) => wins + 1);
				else if (match.getWinner() === "Black") setBlackWins((wins) => wins + 1);
				else setDraws((draws) => draws + 1);
				completedEpisodes.current += 1;
				setEpisodesCompleted(completedEpisodes.current);
				setStatsVersion((v) => v + 1);
				if (completedEpisodes.current < episodeCount) startNextEpisode();
				else {
					setRunning(false);
					setMatchStatus("COMPLETED");
					clearInterval(interval);
				}
				return;
			}
			if (match.isMove) {
				const [capture, move] = match.getCurrentPlayerAgent().chooseMoveAndCapture(match);
				pendingCapture.current = {
					match,
					capture
				};
				match.doMoveOrCapture(move, capture);
			} else {
				const cachedCapture = pendingCapture.current?.match === match ? pendingCapture.current.capture : -1;
				const capture = cachedCapture === -1 && match.mill.length > 0 ? match.getCurrentPlayerAgent().chooseCapture(match) : cachedCapture;
				pendingCapture.current = null;
				match.doMoveOrCapture({
					from: -1,
					to: -1
				}, capture);
			}
			setTick((t) => t + 1);
		}, moveInterval);
		return () => clearInterval(interval);
	}, [
		running,
		match,
		moveInterval
	]);
	function onCompleteCountdown() {
		setShowCountdown(false);
		startGame();
	}
	function startGame() {
		completedEpisodes.current = 0;
		countedMatch.current = null;
		setEpisodesCompleted(0);
		startNextEpisode();
	}
	function startNextEpisode() {
		const newMatch = new Match({
			algorithm: whiteAlgorithm,
			mode: whiteMode,
			config: whiteConfig
		}, {
			algorithm: blackAlgorithm,
			mode: blackMode,
			config: blackConfig
		}, completedEpisodes.current, episodeCount);
		pendingCapture.current = null;
		setMatch(newMatch);
		setMatchTime(0);
		setMatchStatus("IN_PROGRESS");
		setRunning(true);
	}
	function pauseGame() {
		setMatchStatus("PAUSED");
		setRunning(false);
	}
	function resumeGame() {
		setMatchStatus("IN_PROGRESS");
		setRunning(true);
	}
	function resetGame() {
		completedEpisodes.current = 0;
		pendingCapture.current = null;
		countedMatch.current = null;
		setMatch(null);
		setMatchStatus("NOT_STARTED");
		setRunning(false);
		setMatchTime(0);
		setEpisodesCompleted(0);
	}
	function resetStatistics() {
		setWhiteWins(0);
		setBlackWins(0);
		setDraws(0);
	}
	/**
	* Forgets the trained networks, in memory and in localStorage, so the next
	* session starts from fresh random weights instead of continuing.
	*/
	function clearTrainedNetworks() {
		const removed = resetLearning();
		resetStatistics();
		setEpisodesCompleted(0);
		completedEpisodes.current = 0;
		setStatsVersion((v) => v + 1);
		return removed;
	}
	/** Clears just the stats for one side, keeping the trained network. */
	function clearAgentStats(player) {
		resetStats(player);
		setStatsVersion((v) => v + 1);
	}
	const whiteStats = sessionStats(0)?.rows ?? [];
	const blackStats = sessionStats(1)?.rows ?? [];
	function showCountdownOverlay() {
		setShowCountdown(true);
	}
	return {
		whiteAlgorithm,
		blackAlgorithm,
		setWhiteAlgorithm,
		setBlackAlgorithm,
		whiteMode,
		blackMode,
		setWhiteMode,
		setBlackMode,
		canChangeAlgorithms,
		showCountdownOverlay,
		showCountdown,
		onCompleteCountdown,
		match,
		matchStatus,
		matchTime,
		draws,
		episodeCount,
		setEpisodeCount,
		episodesCompleted,
		moveInterval,
		setMoveInterval,
		whiteWins,
		blackWins,
		running,
		startGame,
		pauseGame,
		resumeGame,
		resetGame,
		resetStatistics,
		whiteConfig,
		blackConfig,
		setWhiteConfig,
		setBlackConfig,
		clearTrainedNetworks,
		clearAgentStats,
		whiteStats,
		blackStats,
		statsVersion
	};
}
var confetti = [
	[
		7,
		8,
		0,
		"#facc15"
	],
	[
		15,
		3,
		1,
		"#4ade80"
	],
	[
		24,
		12,
		2,
		"#60a5fa"
	],
	[
		33,
		5,
		3,
		"#fb7185"
	],
	[
		42,
		16,
		4,
		"#c084fc"
	],
	[
		51,
		2,
		5,
		"#facc15"
	],
	[
		61,
		11,
		6,
		"#4ade80"
	],
	[
		70,
		6,
		7,
		"#60a5fa"
	],
	[
		79,
		14,
		8,
		"#fb7185"
	],
	[
		88,
		4,
		9,
		"#c084fc"
	],
	[
		93,
		17,
		10,
		"#facc15"
	],
	[
		3,
		19,
		11,
		"#60a5fa"
	]
];
function VictoryOverlay({ winner }) {
	const isDraw = winner === null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 z-40 overflow-hidden",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-lg border border-success/50 bg-background/95 px-8 py-6 text-center shadow-2xl victory-message",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mx-auto mb-2 h-10 w-10 text-warning" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl font-bold uppercase tracking-[0.12em] text-success",
					children: isDraw ? "Match Ended" : "Congratulations!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground",
					children: isDraw ? "The match ended in a draw" : `${winner} wins the match`
				})
			]
		}), !isDraw && confetti.map(([left, delay, rotation, color], index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "confetti-piece",
			style: {
				left: `${left}%`,
				animationDelay: `${delay * 80}ms`,
				backgroundColor: color,
				transform: `rotate(${rotation * 20}deg)`
			}
		}, index))]
	});
}
function Index() {
	const { whiteAlgorithm, blackAlgorithm, whiteMode, blackMode, setWhiteAlgorithm, setBlackAlgorithm, setWhiteMode, setBlackMode, showCountdown, showCountdownOverlay, onCompleteCountdown, match, matchTime, moveInterval, setMoveInterval, whiteWins, blackWins, running, matchStatus, pauseGame, resumeGame, resetGame, resetStatistics, draws, episodeCount, setEpisodeCount, episodesCompleted, whiteConfig, blackConfig, setWhiteConfig, setBlackConfig, clearTrainedNetworks, clearAgentStats, whiteStats, blackStats } = useMatchTimer();
	const locked = matchStatus !== "NOT_STARTED";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background p-4 text-foreground lg:p-6",
		children: [
			matchStatus === "COMPLETED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VictoryOverlay, { winner: match?.getWinner() ?? null }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				matchTime,
				running,
				matchStatus
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_400px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainDashboard, {
								match,
								matchStatus
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionConfiguration, {
								matchStatus,
								episodeCount,
								setEpisodeCount,
								clearTrainedNetworks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentConfigPanel, {
								locked,
								whiteAlgorithm,
								blackAlgorithm,
								setWhiteAlgorithm,
								setBlackAlgorithm,
								whiteMode,
								blackMode,
								setWhiteMode,
								setBlackMode,
								whiteConfig,
								blackConfig,
								setWhiteConfig,
								setBlackConfig
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimulationControls, {
								startGame: showCountdownOverlay,
								pauseGame,
								resumeGame,
								resetGame,
								showCountdown,
								onCompleteCountdown,
								moveInterval,
								setMoveInterval
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainGameBoard, { match }), (matchStatus == "PAUSED" || matchStatus == "IN_PROGRESS" || matchStatus == "COMPLETED") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveHistory, { match })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							(matchStatus == "IN_PROGRESS" || matchStatus == "PAUSED" || matchStatus == "COMPLETED") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchInfo, { match }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsPanel, {
								whiteAlgorithm,
								blackAlgorithm,
								whiteMode,
								blackMode,
								whiteStats,
								blackStats,
								onClearStats: clearAgentStats
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchStatistics, {
								match,
								matchTime,
								whiteWins,
								blackWins,
								draws,
								episodesCompleted,
								episodeCount,
								resetStatistics
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { Index as component };
