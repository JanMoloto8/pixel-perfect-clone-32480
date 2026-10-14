import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Play, c as Clock, d as Activity, i as RefreshCw, l as ChartColumn, n as Trophy, o as Pause, r as RotateCcw, s as Flag, t as User, u as Bot } from "../_libs/lucide-react.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as variableGrads, i as tensor2d, n as sequential, o as tensor, r as train, t as dense } from "../_libs/@tensorflow/tfjs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cxhw4Lhb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Panel({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel-card panel-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "border-b border-border bg-panel-header px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-info",
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
		7,
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
var GenerateLegalCaptures = (match, player) => {
	const state = match?.state;
	const millsFormed = match?.millsFormed;
	if (!state || !millsFormed) return [];
	if (player === 0) return state.B1.map((value, index) => value === 1 && !millsFormed.black.some((mill) => mill.includes(index)) ? index : -1).filter((index) => index !== -1);
	else return state.B0.map((value, index) => value === 1 && !millsFormed.white.some((mill) => mill.includes(index)) ? index : -1).filter((index) => index !== -1);
};
var GenerateLegalMoves = (match, player) => {
	const state = match?.state;
	const Remaining = match.getAgent(player).Remaining();
	const canPlace = match.getAgent(player).canPlace();
	const B0 = state.B0;
	const B1 = state.B1;
	const legalMoves = [];
	if (state.getPhase() === "Placing") {
		for (let i = 0; i < 24; i++) if (B0[i] === 0 && B1[i] === 0) legalMoves.push({
			from: i,
			to: i
		});
		return legalMoves;
	}
	const isWhite = state.getPlayer() === "White";
	const currentBoard = isWhite ? B0 : B1;
	const opponentBoard = isWhite ? B1 : B0;
	if (state.getPhase() === "Moving") {
		if (canPlace) {
			for (let i = 0; i < 24; i++) if (B0[i] === 0 && B1[i] === 0) legalMoves.push({
				from: i,
				to: i
			});
		} else for (let from = 0; from < 24; from++) {
			if (currentBoard[from] !== 1) continue;
			for (const to of ADJACENT_POINTS[from]) if (currentBoard[to] === 0 && opponentBoard[to] === 0) legalMoves.push({
				from,
				to
			});
		}
		return legalMoves;
	}
	if (state.getPhase() === "Flying") {
		if (Remaining <= 3) for (let from = 0; from < 24; from++) {
			if (currentBoard[from] !== 1) continue;
			for (let to = 0; to < 24; to++) if (currentBoard[to] === 0 && opponentBoard[to] === 0) legalMoves.push({
				from,
				to
			});
		}
		else for (let from = 0; from < 24; from++) {
			if (currentBoard[from] !== 1) continue;
			for (const to of ADJACENT_POINTS[from]) if (currentBoard[to] === 0 && opponentBoard[to] === 0) legalMoves.push({
				from,
				to
			});
		}
		return legalMoves;
	}
	return legalMoves;
};
function BasicHeuristic(match) {
	const state = match.state;
	const Ps = state.B0Remaining - state.B1Remaining;
	const wP = 1;
	const Ms = match.numMillsFormed("White") - match.numMillsFormed("Black");
	const wM = 10;
	const Os = GenerateLegalMoves(match, 0).length - GenerateLegalMoves(match, 1).length;
	return wP * Ps + wM * Ms + 0 * Os;
}
function AlphaBeta(match, depth) {
	const player = match.state.Player;
	const legalMoves = GenerateLegalMoves(match, player);
	if (legalMoves.length === 0) return {
		move: {
			from: -1,
			to: -1
		},
		capture: -1
	};
	let bestMove = legalMoves[0];
	let bestCapture = -1;
	if (player === 0) {
		let bestValue = -Infinity;
		let alpha = -Infinity;
		const beta = Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.White.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.black);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = alphaBeta(captureMatch, depth - 1, false, alpha, beta);
					if (value > bestValue) {
						bestValue = value;
						bestMove = move;
						bestCapture = capture;
					}
					alpha = Math.max(alpha, bestValue);
					if (beta <= alpha) break;
				}
			} else {
				const value = alphaBeta(matchCopy, depth - 1, false, alpha, beta);
				if (value > bestValue) {
					bestValue = value;
					bestMove = move;
					bestCapture = -1;
				}
				alpha = Math.max(alpha, bestValue);
				if (beta <= alpha) break;
			}
		}
	} else {
		let bestValue = Infinity;
		const alpha = -Infinity;
		let beta = Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.White.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.white);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = alphaBeta(captureMatch, depth - 1, true, alpha, beta);
					if (value < bestValue) {
						bestValue = value;
						bestMove = move;
						bestCapture = capture;
					}
					beta = Math.min(beta, bestValue);
					if (beta <= alpha) break;
				}
			} else {
				const value = alphaBeta(matchCopy, depth - 1, true, alpha, beta);
				if (value < bestValue) {
					bestValue = value;
					bestMove = move;
					bestCapture = -1;
				}
				beta = Math.min(beta, bestValue);
				if (beta <= alpha) break;
			}
		}
	}
	return {
		move: bestMove,
		capture: bestCapture
	};
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
function minimax(match, depth, maximizing) {
	if (depth === 0) return BasicHeuristic(match);
	const legalMoves = GenerateLegalMoves(match, maximizing ? 0 : 1);
	if (legalMoves.length === 0) return BasicHeuristic(match);
	if (maximizing) {
		let bestValue = -Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.White.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.black);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = minimax(captureMatch, depth - 1, false);
					bestValue = Math.max(bestValue, value);
				}
			} else {
				const value = minimax(matchCopy, depth - 1, false);
				bestValue = Math.max(bestValue, value);
			}
		}
		return bestValue;
	} else {
		let bestValue = Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.Black.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.white);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = minimax(captureMatch, depth - 1, true);
					bestValue = Math.min(bestValue, value);
				}
			} else {
				const value = minimax(matchCopy, depth - 1, true);
				bestValue = Math.min(bestValue, value);
			}
		}
		return bestValue;
	}
}
function Minimaxmove(match, depth) {
	const player = match.state.Player;
	const legalMoves = GenerateLegalMoves(match, player);
	if (legalMoves.length === 0) return {
		move: {
			from: -1,
			to: -1
		},
		capture: -1
	};
	let bestMove = legalMoves[0];
	let bestCapture = -1;
	if (player === 0) {
		let bestValue = -Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.White.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.black);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = minimax(captureMatch, depth - 1, false);
					if (value > bestValue) {
						bestValue = value;
						bestMove = move;
						bestCapture = capture;
					}
				}
			} else {
				const value = minimax(matchCopy, depth - 1, false);
				if (value > bestValue) {
					bestValue = value;
					bestMove = move;
					bestCapture = -1;
				}
			}
		}
	} else {
		let bestValue = Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.Black.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.white);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = minimax(captureMatch, depth - 1, true);
					if (value < bestValue) {
						bestValue = value;
						bestMove = move;
						bestCapture = capture;
					}
				}
			} else {
				const value = minimax(matchCopy, depth - 1, true);
				if (value < bestValue) {
					bestValue = value;
					bestMove = move;
					bestCapture = -1;
				}
			}
		}
	}
	return {
		move: bestMove,
		capture: bestCapture
	};
}
function alphaBeta(match, depth, maximizing, alpha, beta) {
	if (depth === 0) return BasicHeuristic(match);
	const legalMoves = GenerateLegalMoves(match, maximizing ? 0 : 1);
	if (legalMoves.length === 0) return BasicHeuristic(match);
	if (maximizing) {
		let bestValue = -Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.White.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.black);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = alphaBeta(captureMatch, depth - 1, false, alpha, beta);
					bestValue = Math.max(bestValue, value);
					alpha = Math.max(alpha, bestValue);
					if (beta <= alpha) break;
				}
			} else {
				const value = alphaBeta(matchCopy, depth - 1, false, alpha, beta);
				bestValue = Math.max(bestValue, value);
				alpha = Math.max(alpha, bestValue);
			}
			if (beta <= alpha) break;
		}
		return bestValue;
	} else {
		let bestValue = Infinity;
		for (const move of legalMoves) {
			const matchCopy = copyMatch(match);
			matchCopy.doMoveOrCapture(move, -1);
			if (matchCopy.mill.length > 0) {
				const captures = matchCopy.Black.GenerateLegalCaptures(matchCopy.state, matchCopy.millsFormed.white);
				for (const capture of captures) {
					const captureMatch = copyMatch(matchCopy);
					captureMatch.doMoveOrCapture(move, capture);
					const value = alphaBeta(captureMatch, depth - 1, true, alpha, beta);
					bestValue = Math.min(bestValue, value);
					beta = Math.min(beta, bestValue);
					if (beta <= alpha) break;
				}
			} else {
				const value = alphaBeta(matchCopy, depth - 1, true, alpha, beta);
				bestValue = Math.min(bestValue, value);
				beta = Math.min(beta, bestValue);
			}
			if (beta <= alpha) break;
		}
		return bestValue;
	}
}
function V(network, match) {
	return network.predict(match.state);
}
var chooseTDMove = (network, match, player) => {
	const legalMoves = GenerateLegalMoves(match, player);
	let bestMove = legalMoves[0];
	let bestCapture = -1;
	let bestValue;
	const firstMatchCopy = copyMatch(match);
	console.log("First Copy:", firstMatchCopy);
	firstMatchCopy.doMoveOrCapture(bestMove, -1);
	console.log("First Copy after move:", firstMatchCopy);
	const firstCaptures = GenerateLegalCaptures(firstMatchCopy, player);
	if (firstCaptures.length === 0) {
		bestValue = V(network, firstMatchCopy);
		console.log("First move value:", bestValue);
	} else {
		const firstCapture = firstCaptures[0];
		const captureMatchCopy = copyMatch(firstMatchCopy);
		captureMatchCopy.doMoveOrCapture(bestMove, firstCapture);
		bestValue = V(network, captureMatchCopy);
		bestCapture = firstCapture;
	}
	for (let i = 1; i < legalMoves.length; i++) {
		const move = legalMoves[i];
		const matchCopy = copyMatch(match);
		matchCopy.doMoveOrCapture(move, -1);
		const captures = GenerateLegalCaptures(matchCopy, player);
		if (captures.length === 0) {
			const value = V(network, matchCopy);
			console.log(`Move ${i} value:`, value);
			if (player === 0) {
				if (value > bestValue) {
					bestValue = value;
					bestMove = move;
					bestCapture = -1;
				}
			} else if (value < bestValue) {
				bestValue = value;
				bestMove = move;
				bestCapture = -1;
			}
			continue;
		}
		for (let j = 0; j < captures.length; j++) {
			const capture = captures[j];
			const captureMatchCopy = copyMatch(matchCopy);
			captureMatchCopy.doMoveOrCapture(move, capture);
			const value = V(network, captureMatchCopy);
			if (player === 0) {
				if (value > bestValue) {
					bestValue = value;
					bestMove = move;
					bestCapture = capture;
				}
			} else if (value < bestValue) {
				bestValue = value;
				bestMove = move;
				bestCapture = capture;
			}
		}
	}
	return [bestCapture, bestMove];
};
function makeTDTrainingMove(network, match, gamma, alpha, selectedMove) {
	const currentState = match.state;
	const player = currentState.Player;
	const [capture, move] = selectedMove ?? chooseTDMove(network, match, player);
	if (move === null) return 0;
	const matchCopy = copyMatch(match);
	matchCopy.doMoveOrCapture(move, -1);
	matchCopy.doMoveOrCapture(move, capture);
	const nextState = matchCopy.state;
	const terminal = matchCopy.isGameOver();
	let reward = matchCopy.mill.length > 0 ? 1 : 0;
	if (matchCopy.winner !== null) reward = matchCopy.winner === player ? 5 : -5;
	return network.tdZeroUpdate(currentState, nextState, reward, gamma, alpha, terminal);
}
function copyMatch(match) {
	const matchCopy = Object.create(Object.getPrototypeOf(match));
	matchCopy.White = Object.create(Object.getPrototypeOf(match.White));
	Object.assign(matchCopy.White, match.White);
	matchCopy.Black = Object.create(Object.getPrototypeOf(match.Black));
	Object.assign(matchCopy.Black, match.Black);
	matchCopy.state = Object.create(Object.getPrototypeOf(match.state));
	Object.assign(matchCopy.state, structuredClone(match.state));
	matchCopy.score = structuredClone(match.score);
	matchCopy.moves = structuredClone(match.moves);
	matchCopy.cells = structuredClone(match.cells);
	matchCopy.moveHistory = structuredClone(match.moveHistory);
	matchCopy.mill = structuredClone(match.mill);
	matchCopy.millsFormed = structuredClone(match.millsFormed);
	matchCopy.lastMove = structuredClone(match.lastMove);
	matchCopy.winner = match.winner;
	matchCopy.isMove = match.isMove;
	return matchCopy;
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
function cn(...inputs) {
	return twMerge(clsx(inputs));
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
function MatchConfiguration({ matchStatus, whiteAlgorithm, blackAlgorithm, whiteMode, blackMode, setWhiteAlgorithm, setBlackAlgorithm, setWhiteMode, setBlackMode, episodeCount, setEpisodeCount }) {
	const locked = matchStatus !== "NOT_STARTED";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Match Configuration",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm font-semibold",
					children: "White Agent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					disabled: locked,
					value: whiteAlgorithm,
					onChange: (e) => setWhiteAlgorithm(e.target.value),
					className: "w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Standard" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "TD" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Minimax" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "AlphaBeta" })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm font-semibold",
					children: "Black Agent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					disabled: locked,
					value: blackAlgorithm,
					onChange: (e) => setBlackAlgorithm(e.target.value),
					className: "w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Standard" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "TD" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Minimax" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "AlphaBeta" })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "episode-count",
					className: "mb-2 block text-sm font-semibold",
					children: "Episodes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "episode-count",
					type: "number",
					min: 1,
					step: 1,
					disabled: locked,
					value: episodeCount,
					onChange: (e) => setEpisodeCount(Math.max(1, Number(e.target.value) || 1)),
					className: "w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm font-semibold",
					children: "White Agent Mode"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					disabled: locked,
					value: whiteMode,
					onChange: (e) => setWhiteMode(Number(e.target.value)),
					className: "w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: 0,
						children: "Training"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: 1,
						children: "Playing"
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm font-semibold",
					children: "Black Agent Mode"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					disabled: locked,
					value: blackMode,
					onChange: (e) => setBlackMode(Number(e.target.value)),
					className: "w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: 0,
						children: "Training"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: 1,
						children: "Playing"
					})]
				})] })
			]
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
var NeuralNetwork = class {
	model;
	constructor() {
		this.model = sequential();
		this.model.add(dense({
			inputShape: [54],
			units: 64,
			activation: "relu",
			kernelInitializer: "glorotNormal",
			biasInitializer: "zeros"
		}));
		this.model.add(dense({
			units: 64,
			activation: "relu",
			kernelInitializer: "glorotNormal",
			biasInitializer: "zeros"
		}));
		this.model.add(dense({
			units: 1,
			activation: "linear",
			kernelInitializer: "glorotNormal",
			biasInitializer: "zeros"
		}));
		this.model.compile({
			optimizer: train.adam(.001),
			loss: "meanSquaredError"
		});
	}
	saveToLocalStorage(key) {
		if (typeof localStorage === "undefined") return;
		try {
			const weights = this.model.getWeights().map((weight) => ({
				shape: weight.shape,
				values: Array.from(weight.dataSync())
			}));
			localStorage.setItem(key, JSON.stringify(weights));
		} catch {}
	}
	loadFromLocalStorage(key) {
		if (typeof localStorage === "undefined") return false;
		const serializedWeights = localStorage.getItem(key);
		if (!serializedWeights) return false;
		try {
			const weights = JSON.parse(serializedWeights);
			if (weights.length !== this.model.getWeights().length) return false;
			const tensors = weights.map(({ shape, values }) => tensor(values, shape));
			this.model.setWeights(tensors);
			return true;
		} catch {
			return false;
		}
	}
	predict(state) {
		const stateArray = [
			...state.B0,
			...state.B1,
			state.B0Remaining,
			state.B1Remaining,
			state.phase.x,
			state.phase.y,
			state.phase.z,
			state.Player
		];
		const input = tensor2d([stateArray]);
		const output = this.model.predict(input);
		const value = output.dataSync()[0];
		input.dispose();
		output.dispose();
		return value;
	}
	train(state, target) {
		const input = tensor2d([state]);
		const targetTensor = tensor2d([[target]]);
		this.model.fit(input, targetTensor, {
			epochs: 1,
			verbose: 0
		});
		input.dispose();
		targetTensor.dispose();
	}
	printChangedWeights(oldWeights) {
		const newWeights = this.model.getWeights();
		let index = 0;
		for (let i = 0; i < newWeights.length; i++) {
			const values = newWeights[i].dataSync();
			for (let j = 0; j < values.length; j++) {
				const oldValue = oldWeights[index];
				const newValue = values[j];
				if (oldValue !== newValue) console.log(`Weight ${index + 1}: ${oldValue} -> ${newValue}`);
				index++;
			}
		}
	}
	getWeightsAsArray() {
		const weights = this.model.getWeights();
		const allWeights = [];
		for (let i = 0; i < weights.length; i++) {
			const values = weights[i].dataSync();
			for (let j = 0; j < values.length; j++) allWeights.push(values[j]);
		}
		return allWeights;
	}
	tdZeroUpdate(state, nextState, reward, gamma, alpha, terminal) {
		const stateArray = [
			...state.B0,
			...state.B1,
			state.B0Remaining,
			state.B1Remaining,
			state.phase.x,
			state.phase.y,
			state.phase.z,
			state.Player
		];
		const nextStateArray = [
			...nextState.B0,
			...nextState.B1,
			nextState.B0Remaining,
			nextState.B1Remaining,
			nextState.phase.x,
			nextState.phase.y,
			nextState.phase.z,
			nextState.Player
		];
		const stateTensor = tensor2d([stateArray]);
		const nextStateTensor = tensor2d([nextStateArray]);
		const stateValueTensor = this.model.predict(stateTensor);
		const stateValue = stateValueTensor.dataSync()[0];
		let nextValue = 0;
		if (!terminal) {
			const nextValueTensor = this.model.predict(nextStateTensor);
			nextValue = nextValueTensor.dataSync()[0];
			nextValueTensor.dispose();
		}
		const tdError = reward + gamma * nextValue - stateValue;
		const gradients = variableGrads(() => {
			return this.model.predict(stateTensor).mean();
		});
		const weights = this.model.getWeights();
		const updatedWeights = [];
		for (let i = 0; i < weights.length; i++) {
			const weight = weights[i];
			const variable = this.model.trainableWeights[i];
			const gradient = gradients.grads[variable.name];
			const newWeight = weight.add(gradient.mul(alpha * tdError));
			updatedWeights.push(newWeight);
		}
		this.model.setWeights(updatedWeights);
		stateTensor.dispose();
		nextStateTensor.dispose();
		stateValueTensor.dispose();
		gradients.value.dispose();
		for (const key in gradients.grads) gradients.grads[key].dispose();
		return tdError;
	}
};
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
	networkWeights;
	constructor(Player, mode, algorithm) {
		this.name = algorithm;
		this.Player = Player;
		this.mode = mode;
		this.Cows = 12;
		this.placingCows = 12;
		this.network = new NeuralNetwork();
		this.network.loadFromLocalStorage(Agent.getNetworkStorageKey(Player));
		this.networkWeights = this.network.getWeightsAsArray();
	}
	static getNetworkStorageKey(player) {
		return `morabaraba-neural-network-${player === 0 ? "white" : "black"}`;
	}
	saveTrainingNetwork() {
		if (this.mode !== 0) return;
		this.network.printChangedWeights(this.networkWeights ?? []);
		this.network.saveToLocalStorage(Agent.getNetworkStorageKey(this.Player));
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
		if (this.name === "Minimax") {
			const { capture, move } = Minimaxmove(match, 3);
			return [capture, move];
		}
		if (this.name === "AlphaBeta") {
			const { capture, move } = AlphaBeta(match, 3);
			return [capture, move];
		}
		if (this.name === "Standard" || this.name === "TD") {
			const [capture, move] = chooseTDMove(this.network, match, this.Player);
			if (this.mode === 0) makeTDTrainingMove(this.network, match, .9, .1, [capture, move]);
			return [capture, move];
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
	constructor(whiteAlgorithm, blackAlgorithm, whiteMode = 1, blackMode = 1) {
		this.White = new Agent(0, whiteMode, whiteAlgorithm);
		this.Black = new Agent(1, blackMode, blackAlgorithm);
		this.White.name = whiteAlgorithm;
		this.Black.name = blackAlgorithm;
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
	isGameOver() {
		if (this.White.Remaining() < 3 || this.Black.Remaining() < 3) {
			this.winner = this.White.Remaining() < 3 ? 1 : 0;
			if (!this.trainingNetworksSaved) {
				this.White.saveTrainingNetwork();
				this.Black.saveTrainingNetwork();
				this.trainingNetworksSaved = true;
			}
			return true;
		}
		if (this.White.placingCows === 0 && this.Black.placingCows === 0) {
			const whiteMoves = GenerateLegalMoves(this, 0);
			const blackMoves = GenerateLegalMoves(this, 1);
			if (whiteMoves.length === 0 && blackMoves.length === 0) {
				this.winner = null;
				if (!this.trainingNetworksSaved) {
					this.White.saveTrainingNetwork();
					this.Black.saveTrainingNetwork();
					this.trainingNetworksSaved = true;
				}
				return true;
			}
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
var Algorithm = /* @__PURE__ */ function(Algorithm) {
	Algorithm["STANDARD"] = "Standard";
	Algorithm["TD"] = "TD";
	Algorithm["MINIMAX"] = "Alpha-Beta";
	Algorithm["MCTS"] = "Monte Carlo Tree Search";
	return Algorithm;
}({});
function useMatchTimer() {
	const [moveInterval, setMoveInterval] = (0, import_react.useState)(3500);
	const [matchTime, setMatchTime] = (0, import_react.useState)(0);
	const [matchStatus, setMatchStatus] = (0, import_react.useState)("NOT_STARTED");
	const [showCountdown, setShowCountdown] = (0, import_react.useState)(false);
	const [whiteAlgorithm, setWhiteAlgorithm] = (0, import_react.useState)(Algorithm.STANDARD);
	const [blackAlgorithm, setBlackAlgorithm] = (0, import_react.useState)(Algorithm.STANDARD);
	const [whiteMode, setWhiteMode] = (0, import_react.useState)(1);
	const [blackMode, setBlackMode] = (0, import_react.useState)(1);
	const [whiteWins, setWhiteWins] = (0, import_react.useState)(0);
	const [blackWins, setBlackWins] = (0, import_react.useState)(0);
	const [draws, setDraws] = (0, import_react.useState)(0);
	const [episodeCount, setEpisodeCount] = (0, import_react.useState)(1);
	const [episodesCompleted, setEpisodesCompleted] = (0, import_react.useState)(0);
	const canChangeAlgorithms = matchStatus === "NOT_STARTED";
	const [match, setMatch] = (0, import_react.useState)(null);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [, setTick] = (0, import_react.useState)(0);
	const pendingCapture = (0, import_react.useRef)(null);
	const completedEpisodes = (0, import_react.useRef)(0);
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
				if (match.getWinner() === "White") setWhiteWins((wins) => wins + 1);
				else if (match.getWinner() === "Black") setBlackWins((wins) => wins + 1);
				else setDraws((draws) => draws + 1);
				completedEpisodes.current += 1;
				setEpisodesCompleted(completedEpisodes.current);
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
		setEpisodesCompleted(0);
		startNextEpisode();
	}
	function startNextEpisode() {
		const newMatch = new Match(whiteAlgorithm, blackAlgorithm, whiteMode, blackMode);
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
		resetStatistics
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
	const { whiteAlgorithm, blackAlgorithm, whiteMode, blackMode, setWhiteAlgorithm, setBlackAlgorithm, setWhiteMode, setBlackMode, showCountdown, showCountdownOverlay, onCompleteCountdown, match, matchTime, moveInterval, setMoveInterval, whiteWins, blackWins, running, matchStatus, pauseGame, resumeGame, resetGame, resetStatistics, draws, episodeCount, setEpisodeCount, episodesCompleted } = useMatchTimer();
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
				className: "mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainDashboard, {
								match,
								matchStatus
							}),
							matchStatus === "NOT_STARTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchConfiguration, {
								matchStatus,
								whiteAlgorithm,
								blackAlgorithm,
								whiteMode,
								blackMode,
								setWhiteAlgorithm: (value) => setWhiteAlgorithm(value),
								setBlackAlgorithm: (value) => setBlackAlgorithm(value),
								setWhiteMode,
								setBlackMode,
								episodeCount,
								setEpisodeCount
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
						children: [(matchStatus == "IN_PROGRESS" || matchStatus == "PAUSED" || matchStatus == "COMPLETED") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchInfo, { match }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchStatistics, {
							match,
							matchTime,
							whiteWins,
							blackWins,
							draws,
							episodesCompleted,
							episodeCount,
							resetStatistics
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { Index as component };
