import { o as __toESM } from "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { s as cn, t as ACTIVATIONS } from "./AgentConfig-muPFfAku.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1, u as Slot } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as Root$1, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { d as ChevronUp, f as ChevronDown, p as Check } from "../_libs/lucide-react.mjs";
import { a as CartesianGrid, c as Tooltip, i as Line, l as Legend, n as YAxis, r as XAxis, s as ResponsiveContainer, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/experiment-CiQmEahF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root$1.displayName;
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var DEFAULT_EXPERIMENT_CONFIG = {
	name: "experiment",
	runs: 3,
	totalEpisodes: 1e3,
	evalInterval: 100,
	evalGames: 100,
	trainOpponent: "self",
	evalOpponents: [
		"random",
		"ab1",
		"ab2"
	],
	learnerAlgorithm: "TD",
	searchDepth: 2,
	hiddenLayers: [64, 64],
	activation: "relu",
	alpha: .01,
	alphaFinal: .002,
	gamma: .99,
	lambda: 0,
	epsilon: .1,
	epsilonFinal: .01,
	captureReward: .05,
	seed: 1,
	randomOpening: 0
};
/** Convert training stats rows to CSV string. */
function trainingStatsToCsv(rows) {
	if (rows.length === 0) return "";
	const layers = rows[0].dead.length;
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
/** Convert evaluation checkpoints to CSV string. */
function evalCheckpointsToCsv(checkpoints) {
	if (checkpoints.length === 0) return "";
	const lines = ["episode,opponent,games,wins,draws,losses,win_rate,score,avg_plies"];
	for (const cp of checkpoints) for (const [name, r] of Object.entries(cp.evalResults)) lines.push(`${cp.episode},${name},${r.games},${r.wins},${r.draws},${r.losses},${r.winRate.toFixed(3)},${r.score.toFixed(3)},${r.avgPlies.toFixed(1)}`);
	return lines.join("\n") + "\n";
}
function useExperiment() {
	const workerRef = (0, import_react.useRef)(null);
	const [state, setState] = (0, import_react.useState)({
		status: "idle",
		config: DEFAULT_EXPERIMENT_CONFIG,
		progress: null,
		completedRuns: [],
		allResults: null,
		errors: []
	});
	(0, import_react.useEffect)(() => {
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, []);
	const setConfig = (0, import_react.useCallback)((config) => {
		setState((prev) => ({
			...prev,
			config
		}));
	}, []);
	const updateConfig = (0, import_react.useCallback)((partial) => {
		setState((prev) => ({
			...prev,
			config: {
				...prev.config,
				...partial
			}
		}));
	}, []);
	const start = (0, import_react.useCallback)(() => {
		workerRef.current?.terminate();
		setState((prev) => ({
			...prev,
			status: "running",
			progress: null,
			completedRuns: [],
			allResults: null,
			errors: []
		}));
		const worker = new Worker(new URL("../rl/experiment-worker.ts", import.meta.url), { type: "module" });
		workerRef.current = worker;
		worker.onmessage = (e) => {
			const msg = e.data;
			switch (msg.type) {
				case "progress":
					setState((prev) => ({
						...prev,
						progress: msg.data
					}));
					break;
				case "runComplete":
					setState((prev) => ({
						...prev,
						completedRuns: [...prev.completedRuns, msg.data]
					}));
					break;
				case "done":
					setState((prev) => ({
						...prev,
						status: "completed",
						allResults: msg.data
					}));
					workerRef.current = null;
					break;
				case "error": setState((prev) => ({
					...prev,
					errors: [...prev.errors, msg.message]
				}));
			}
		};
		worker.onerror = (e) => {
			setState((prev) => ({
				...prev,
				status: "error",
				errors: [...prev.errors, e.message || "Worker error"]
			}));
			workerRef.current = null;
		};
		setState((prev) => {
			worker.postMessage({
				type: "start",
				config: prev.config
			});
			return prev;
		});
	}, []);
	const abort = (0, import_react.useCallback)(() => {
		workerRef.current?.postMessage({ type: "abort" });
		setState((prev) => ({
			...prev,
			status: "aborted"
		}));
	}, []);
	const reset = (0, import_react.useCallback)(() => {
		workerRef.current?.terminate();
		workerRef.current = null;
		setState((prev) => ({
			...prev,
			status: "idle",
			progress: null,
			completedRuns: [],
			allResults: null,
			errors: []
		}));
	}, []);
	return {
		...state,
		setConfig,
		updateConfig,
		start,
		abort,
		reset
	};
}
function bestRunResult(runs) {
	if (runs.length === 0) return null;
	return runs.reduce((best, r) => r.bestScore > best.bestScore ? r : best);
}
var EVAL_OPPONENT_OPTIONS = [
	{
		value: "random",
		label: "Random"
	},
	{
		value: "ab1",
		label: "Minimax d1"
	},
	{
		value: "ab2",
		label: "Minimax d2"
	},
	{
		value: "ab3",
		label: "Minimax d3"
	}
];
var TRAIN_OPPONENT_OPTIONS = [
	{
		value: "self",
		label: "Self-play"
	},
	{
		value: "random",
		label: "Random"
	},
	{
		value: "ab1",
		label: "Minimax d1"
	},
	{
		value: "ab2",
		label: "Minimax d2"
	},
	{
		value: "ab3",
		label: "Minimax d3"
	}
];
function ConfigForm({ config, onUpdate, locked }) {
	const numField = (key, label, opts) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			disabled: locked,
			value: config[key],
			min: opts?.min,
			max: opts?.max,
			step: opts?.step ?? 1,
			onChange: (e) => onUpdate({ [key]: +e.target.value }),
			className: "h-8 text-sm"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: "Name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					disabled: locked,
					value: config.name,
					onChange: (e) => onUpdate({ name: e.target.value }),
					className: "h-8 text-sm"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					numField("runs", "Runs", {
						min: 1,
						max: 100
					}),
					numField("totalEpisodes", "Episodes per run", {
						min: 10,
						max: 1e5
					}),
					numField("evalInterval", "Eval interval", {
						min: 1,
						max: 1e4
					}),
					numField("evalGames", "Eval games", {
						min: 10,
						max: 1e3
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Train opponent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						disabled: locked,
						value: config.trainOpponent,
						onValueChange: (v) => onUpdate({ trainOpponent: v }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TRAIN_OPPONENT_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: o.value,
							children: o.label
						}, o.value)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Eval opponents"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: EVAL_OPPONENT_OPTIONS.map((o) => {
							const checked = config.evalOpponents.includes(o.value);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-1 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									disabled: locked,
									checked,
									onCheckedChange: (v) => {
										onUpdate({ evalOpponents: v ? [...config.evalOpponents, o.value] : config.evalOpponents.filter((x) => x !== o.value) });
									}
								}), o.label]
							}, o.value);
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: "Learner algorithm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					disabled: locked,
					value: config.learnerAlgorithm,
					onValueChange: (v) => onUpdate({ learnerAlgorithm: v }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-8 text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "TD",
						children: "TD (greedy)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "TD_SEARCH",
						children: "TD + Minimax (search)"
					})] })]
				})]
			}),
			config.learnerAlgorithm === "TD_SEARCH" && numField("searchDepth", "Search depth", {
				min: 1,
				max: 4
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs font-medium",
					children: "Network"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "Hidden layers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							disabled: locked,
							value: config.hiddenLayers.join(","),
							onChange: (e) => {
								const layers = e.target.value.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
								if (layers.length > 0) onUpdate({ hiddenLayers: layers });
							},
							className: "h-8 text-sm",
							placeholder: "64,64"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "Activation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							disabled: locked,
							value: config.activation,
							onValueChange: (v) => onUpdate({ activation: v }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTIVATIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: a,
								children: a
							}, a)) })]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs font-medium",
					children: "Hyperparameters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [
						numField("alpha", "α (initial)", {
							min: 0,
							max: 1,
							step: .001
						}),
						numField("alphaFinal", "α (final)", {
							min: 0,
							max: 1,
							step: .001
						}),
						numField("gamma", "γ", {
							min: 0,
							max: 1,
							step: .01
						}),
						numField("lambda", "λ", {
							min: 0,
							max: 1,
							step: .01
						}),
						numField("epsilon", "ε (initial)", {
							min: 0,
							max: 1,
							step: .01
						}),
						numField("epsilonFinal", "ε (final)", {
							min: 0,
							max: 1,
							step: .01
						}),
						numField("captureReward", "Capture reward", {
							min: 0,
							max: 1,
							step: .01
						}),
						numField("seed", "Base seed", { min: 0 })
					]
				})]
			}),
			numField("randomOpening", "Random opening plies", {
				min: 0,
				max: 20
			})
		]
	});
}
function ProgressDisplay({ status, progress, config, errors }) {
	const pct = progress ? Math.round(progress.overallProgress * 100) : 0;
	const runLabel = progress ? `Run ${progress.run + 1}/${config.runs} — Episode ${progress.episode}/${config.totalEpisodes}` : "";
	const phaseLabel = progress?.phase === "evaluating" ? "Evaluating…" : "Training…";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: runLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: status === "running" ? "default" : "secondary",
					children: status === "running" ? phaseLabel : status
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: pct,
				className: "h-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground text-right",
				children: [pct, "%"]
			}),
			errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: errors.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-destructive",
					children: e
				}, i))
			})
		]
	});
}
var CHART_COLORS = [
	"oklch(0.65 0.2 250)",
	"oklch(0.65 0.2 150)",
	"oklch(0.65 0.2 25)",
	"oklch(0.65 0.2 330)",
	"oklch(0.65 0.2 60)"
];
function EvalScoreChart({ runs }) {
	if (runs.length === 0) return null;
	const allOpponents = runs[0].config.evalOpponents;
	const data = runs[0].checkpoints.map((cp) => cp.episode).map((ep, i) => {
		const row = { episode: ep };
		runs.forEach((run, ri) => {
			const cp = run.checkpoints[i];
			if (!cp) return;
			for (const opp of allOpponents) {
				const key = runs.length > 1 ? `R${ri + 1} vs ${opp}` : `vs ${opp}`;
				row[key] = cp.evalResults[opp]?.score ?? 0;
			}
			const avgKey = runs.length > 1 ? `R${ri + 1} avg` : "avg";
			row[avgKey] = cp.avgScore;
		});
		return row;
	});
	const lineKeys = [];
	runs.forEach((_, ri) => {
		const avgKey = runs.length > 1 ? `R${ri + 1} avg` : "avg";
		lineKeys.push(avgKey);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-48",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						opacity: .3
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "episode",
						tick: { fontSize: 10 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: [0, 1],
						tick: { fontSize: 10 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: { fontSize: 11 } }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 10 } }),
					lineKeys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						dataKey: key,
						stroke: CHART_COLORS[i % CHART_COLORS.length],
						strokeWidth: 2,
						dot: false
					}, key))
				]
			})
		})
	});
}
function TrainingChart({ runs }) {
	if (runs.length === 0) return null;
	const maxLen = Math.max(...runs.map((r) => r.trainingStats.length));
	const data = Array.from({ length: maxLen }, (_, i) => {
		const row = { episode: i + 1 };
		runs.forEach((run, ri) => {
			const stat = run.trainingStats[i];
			if (!stat) return;
			row[`R${ri + 1} |δ|`] = stat.mean_abs_td;
		});
		return row;
	});
	const step = Math.max(1, Math.floor(data.length / 300));
	const sampled = step === 1 ? data : data.filter((_, i) => i % step === 0 || i === data.length - 1);
	const lineKeys = runs.map((_, ri) => `R${ri + 1} |δ|`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-48",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data: sampled,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						opacity: .3
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "episode",
						tick: { fontSize: 10 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 10 } }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: { fontSize: 11 } }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 10 } }),
					lineKeys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						dataKey: key,
						stroke: CHART_COLORS[i % CHART_COLORS.length],
						strokeWidth: 1.5,
						dot: false
					}, key))
				]
			})
		})
	});
}
function CheckpointTable({ checkpoints, opponents }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto text-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 text-left",
						children: "Episode"
					}),
					opponents.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
						className: "px-2 py-1 text-right",
						children: ["vs ", o]
					}, o)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-1 text-right font-bold",
						children: "Avg"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: checkpoints.map((cp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/50",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-1",
						children: cp.episode
					}),
					opponents.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-1 text-right tabular-nums",
						children: cp.evalResults[o] ? `${cp.evalResults[o].score.toFixed(3)} (${cp.evalResults[o].wins}W/${cp.evalResults[o].draws}D/${cp.evalResults[o].losses}L)` : "—"
					}, o)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-1 text-right font-bold tabular-nums",
						children: cp.avgScore.toFixed(3)
					})
				]
			}, cp.episode)) })]
		})
	});
}
function RunSummary({ run }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "py-3 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-sm",
			children: [
				"Run ",
				run.runIndex + 1,
				" — seed ",
				run.seed
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "px-4 pb-3 space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-2 text-xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Best score"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono font-bold",
					children: run.bestScore.toFixed(3)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Episodes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono",
					children: run.trainingStats.length
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Time"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono",
					children: [(run.elapsedMs / 1e3).toFixed(0), "s"]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckpointTable, {
			checkpoints: run.checkpoints,
			opponents: run.config.evalOpponents
		})]
	})] });
}
function ResultsDashboard({ runs }) {
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	if (runs.length === 0) return null;
	const best = bestRunResult(runs);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: "Results"
			}), best && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: "text-xs",
				children: [
					"Best: Run ",
					best.runIndex + 1,
					" (",
					best.bestScore.toFixed(3),
					")"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: activeTab,
			onValueChange: setActiveTab,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "h-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "overview",
							className: "text-xs px-2 h-6",
							children: "Overview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "training",
							className: "text-xs px-2 h-6",
							children: "Training"
						}),
						runs.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: `run-${i}`,
							className: "text-xs px-2 h-6",
							children: ["Run ", i + 1]
						}, i))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "overview",
					className: "mt-2 space-y-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvalScoreChart, { runs })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "training",
					className: "mt-2 space-y-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainingChart, { runs })
				}),
				runs.map((run, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: `run-${i}`,
					className: "mt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RunSummary, { run })
				}, i))
			]
		})]
	});
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function downloadJson(data, filename) {
	downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}
function downloadCsv(csv, filename) {
	downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}
async function downloadAllAsZip(runs, config) {
	const JSZip = (await import("../_libs/jszip+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default;
	const zip = new JSZip();
	zip.file("config.json", JSON.stringify(config, null, 2));
	for (const run of runs) {
		const dir = `run-${run.runIndex + 1}`;
		zip.file(`${dir}/config.json`, JSON.stringify({
			...config,
			seed: run.seed
		}, null, 2));
		zip.file(`${dir}/train.csv`, trainingStatsToCsv(run.trainingStats));
		zip.file(`${dir}/eval.csv`, evalCheckpointsToCsv(run.checkpoints));
		zip.file(`${dir}/weights.json`, JSON.stringify(run.finalWeights));
		zip.file(`${dir}/best-weights.json`, JSON.stringify(run.bestWeights));
		for (const cp of run.checkpoints) zip.file(`${dir}/checkpoints/ep${cp.episode}-weights.json`, JSON.stringify(cp.weights));
	}
	downloadBlob(await zip.generateAsync({ type: "blob" }), `${config.name}-results.zip`);
}
function ExperimentPanel() {
	const { status, config, progress, completedRuns, allResults, errors, updateConfig, start, abort, reset } = useExperiment();
	const locked = status === "running";
	const hasResults = completedRuns.length > 0 || allResults && allResults.length > 0;
	const displayRuns = allResults ?? completedRuns;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "py-3 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-sm flex items-center justify-between",
					children: ["Experiment Configuration", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "text-xs font-normal",
						children: [
							config.runs,
							" run",
							config.runs !== 1 ? "s" : "",
							" × ",
							config.totalEpisodes,
							" episodes"
						]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "px-4 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigForm, {
					config,
					onUpdate: updateConfig,
					locked
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					status === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: start,
						size: "sm",
						className: "flex-1",
						children: "Start Experiment"
					}),
					status === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: abort,
						size: "sm",
						variant: "destructive",
						className: "flex-1",
						children: "Abort"
					}),
					(status === "completed" || status === "aborted" || status === "error") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: reset,
						size: "sm",
						variant: "outline",
						className: "flex-1",
						children: "New Experiment"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: start,
						size: "sm",
						className: "flex-1",
						children: "Re-run"
					})] })
				]
			}),
			status === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressDisplay, {
				status,
				progress,
				config,
				errors
			}),
			status !== "running" && errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: errors.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-destructive",
					children: e
				}, i))
			}),
			hasResults && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsDashboard, { runs: displayRuns }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => downloadAllAsZip(displayRuns, config),
						children: "Download All (ZIP)"
					}),
					displayRuns.map((run, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							downloadCsv(trainingStatsToCsv(run.trainingStats), `${config.name}-run${i + 1}-train.csv`);
						},
						children: [
							"Run ",
							i + 1,
							" CSV"
						]
					}, i)),
					displayRuns.length > 0 && bestRunResult(displayRuns) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							downloadJson(bestRunResult(displayRuns).bestWeights, `${config.name}-best-weights.json`);
						},
						children: "Best Weights"
					})
				]
			})] })
		]
	});
}
function ExperimentPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background p-4 text-foreground lg:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-heading text-xl font-bold tracking-tight lg:text-2xl",
					children: "Morabaraba Experiments"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
				children: "← Back to Arena"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mt-4 mx-auto max-w-2xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExperimentPanel, {})
		})]
	});
}
//#endregion
export { ExperimentPage as component };
