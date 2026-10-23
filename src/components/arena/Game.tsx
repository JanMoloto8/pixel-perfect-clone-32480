import {
    GenerateLegalMoves,
    isMillFormed,
    getMillFormed,
    AlphaBeta,
    getRandomMove,
    getRandomCapture,
    matchToEngineState,
} from "../../utilities/helperFunctions";
import { NeuralNetwork, STORAGE_PREFIX, clearSavedNetworks } from "./neuralNetwork";
import { SearchTDAgent, TDAgent,RandomAgent } from "@/rl/agents";
import { Algorithm } from "@/types/Algorithm";
import {
    AgentConfig,
    DEFAULT_AGENT_CONFIG,
    architectureKey,
    usesNetwork,
} from "@/types/AgentConfig";
import { EpisodeStats } from "@/rl/episodeStats";

/** Max full moves before the arena calls a draw (stops endless shuffling). */
export const MAX_ARENA_MOVES = 200;
/**
 * Default plies of lookahead. Each agent now sets its own search depth in the
 * configuration panel; this is only the starting value.
 *
 * Depth 2 costs a few hundred ms per move and already quadruples the score
 * against alpha-beta d2 compared with greedy. Depth 3 is far stronger (0.545
 * against alpha-beta d2, beating it outright) but costs 0.2-0.4 s per move
 * headless and more in a browser.
 */
export const ARENA_SEARCH_DEPTH = DEFAULT_AGENT_CONFIG.searchDepth;

/*
 * One network per colour, shared across episodes, so training carries over
 * from game to game without reloading (and leaking) a new model every match.
 */
const sharedNetworks = new Map<string, NeuralNetwork>();
/** One stats collector per colour, living across the episodes of a session. */
const sharedStats = new Map<string, EpisodeStats>();

/**
 * One network per colour *and architecture*. Including the architecture means
 * switching to 32,32 starts a fresh network instead of failing to load the
 * 64,64 weights, and switching back finds the old ones still there.
 */
function getSharedNetwork(key: string, config: AgentConfig): NeuralNetwork {
    let net = sharedNetworks.get(key);
    if (!net) {
        net = new NeuralNetwork({ hidden: config.hiddenLayers, activation: config.activation });
        const created = net;
        if (!created.loadFromLocalStorage(key)) {
            // Nothing saved for this architecture: start from the shipped
            // weights, which only fit if the shape matches. Otherwise the
            // network keeps its fresh random initialisation.
            void created.loadPretrained();
        }
        sharedNetworks.set(key, created);
    }
    return net;
}

function getSharedStats(key: string, training: boolean): EpisodeStats {
    const existing = sharedStats.get(key);
    // A mode change starts a different kind of record, so don't mix them.
    if (existing && existing.training === training) return existing;
    const fresh = new EpisodeStats(training);
    sharedStats.set(key, fresh);
    return fresh;
}

/** Everything one side of the board is configured with. */
export type AgentSetup = {
    algorithm: Algorithm;
    mode: AgentMode;
    config: AgentConfig;
};

/** Stats for the current session, by colour. Read by the dashboard. */
export function sessionStats(player: Binary): EpisodeStats | null {
    return sharedStats.get(statsKey(player)) ?? null;
}

const statsKey = (player: Binary) => (player === 0 ? "white" : "black");

/**
 * Drops the in-memory networks and stats, and the saved copies in
 * localStorage, so the next session genuinely starts over from
 * public/models/td-agent.json rather than continuing where it left off.
 */
export function resetLearning(): number {
    sharedNetworks.clear();
    sharedStats.clear();
    return clearSavedNetworks();
}

export type Binary = 0 | 1;
export type AgentMode = 0 | 1;
type Score = { white: number; black: number };

export type Cell = 0 | 1 | null;

export type Props = {
    cells: Cell[];
    mill: number[];
    lastMove: [number, number];
    whiteReserve?: number;
    blackReserve?: number;
};

type Move = {
    turn: number;
    agent: string;
    move: string;
    mill: boolean;
    capture: string;
};

export type Movement = {
    from: number;
    to: number;
};

class Phase {
    public x: Binary;
    public y: Binary;
    public z: Binary;

    constructor() {
        this.x = 1;
        this.y = 0;
        this.z = 0;
    }
}

export class State {
    public B0: Binary[];
    public B1: Binary[];
    public phase: Phase;
    public Player: Binary;
    public B0Remaining: number;
    public B1Remaining: number;

    constructor(Player: Binary) {
        this.B0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.B1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.phase = new Phase();
        this.Player = Player;
        this.B0Remaining = 12;
        this.B1Remaining = 12;
    }

    public getPhase(): string {
        if (this.phase.x === 1) return "Placing";
        else if (this.phase.y === 1) return "Moving";
        else return "Flying";
    }

    public setPhase(phase: string): void {
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

    public setB0(move: Movement): void {
        const { from, to } = move;
        this.B0[from] = 0;
        this.B0[to] = 1;
    }

    public setB1(move: Movement): void {
        const { from, to } = move;
        this.B1[from] = 0;
        this.B1[to] = 1;
    }

    public setB(move: Movement): void {
        if (this.Player === 0) {
            this.setB0(move);
        } else {
            this.setB1(move);
        }
    }

    public printB(): void {
        console.log("B0: ", this.B0);
        console.log("B1: ", this.B1);
    }

    public getPlayer(): string {
        if (this.Player === 0) return "White";
        else return "Black";
    }
}

class Agent {
    public name: string;
    public Player: Binary;
    public mode: AgentMode;
    placingCows: number;
    public Cows: number;
    public network: NeuralNetwork;
    public td: TDAgent;
    /** Same network, played through a search. Used by Algorithm.TD_SEARCH. */
    public search: SearchTDAgent;
    public config: AgentConfig;
    public stats: EpisodeStats;
    /** Learning rate actually used this episode, after decay. */
    public alphaNow: number;
    public epsilonNow: number;

    constructor(
        Player: Binary,
        mode: AgentMode,
        algorithm: string,
        config: AgentConfig = DEFAULT_AGENT_CONFIG,
        episodeIndex = 0,
        totalEpisodes = 1,
    ) {
        this.name = algorithm;
        this.Player = Player;
        this.mode = mode;
        this.Cows = 12;
        this.placingCows = 12;
        this.config = config;

        const training = mode === 0 && usesNetwork(algorithm as Algorithm);
        this.network = getSharedNetwork(Agent.getNetworkStorageKey(Player, config), config);
        this.stats = getSharedStats(statsKey(Player), training);

        // Linear decay across the session: a step size that works early is too
        // coarse late. With alphaFinal === alpha this is simply constant.
        const t = totalEpisodes > 1 ? Math.min(1, episodeIndex / (totalEpisodes - 1)) : 0;
        this.alphaNow = config.alpha + (config.alphaFinal - config.alpha) * t;
        this.epsilonNow = training ? config.epsilon : 0;

        this.td = new TDAgent(this.network, {
            learn: training,
            alpha: this.alphaNow,
            gamma: config.gamma,
            lambda: config.lambda,
            epsilon: this.epsilonNow,
        });
        this.td.startGame(Player);
        this.search = new SearchTDAgent(this.network, config.searchDepth);
        this.search.startGame(Player);
    }

    /** True when this agent is learning from the games it plays. */
    public get isTraining(): boolean {
        return this.mode === 0 && usesNetwork(this.name as Algorithm);
    }

    /** Final TD update for this agent once the game is decided. */
    public finishGame(match: Match): void {
        if (!this.isTraining) return;
        const final = matchToEngineState(match);
        final.result = match.winner === null ? 2 : match.winner;
        this.td.endGame(final);
    }

    /**
     * Records this episode. Training agents get the full learning diagnostics;
     * agents that are only playing get their results.
     */
    public recordEpisode(match: Match): void {
        const result =
            match.winner === null ? 0 : match.winner === this.Player ? 1 : -1;
        const plies = match.moveCounter();
        if (this.isTraining) {
            this.stats.addTraining({
                result,
                plies,
                stats: this.td.drainStats(),
                net: this.network,
                alpha: this.alphaNow,
                epsilon: this.epsilonNow,
            });
        } else {
            this.stats.addPlay(result, plies);
        }
    }

    private static getNetworkStorageKey(player: Binary, config: AgentConfig): string {
        const side = player === 0 ? "white" : "black";
        return `${STORAGE_PREFIX}-${side}-${architectureKey(config)}`;
    }

    public saveTrainingNetwork(): void {
        if (!this.isTraining) return;
        this.network.saveToLocalStorage(Agent.getNetworkStorageKey(this.Player, this.config));
    }

    public getName(): string {
        return this.name;
    }

    public Remaining(): number {
        return this.Cows;
    }

    public canPlace(): boolean {
        return this.placingCows > 0;
    }

    public placeCow(): void {
        if (this.placingCows > 0) {
            this.placingCows -= 1;
        }
    }

    public addCapturedCow(): void {
        this.placingCows += 1;
    }

    public chooseMoveAndCapture(match: Match): [number, Movement] {
        var Capture = -1;
        // Compare against the Algorithm enum values, which is what the UI passes.
        // ("AlphaBeta"/"Minimax" never matched Algorithm.MINIMAX === "Alpha-Beta",
        // so this agent silently played random moves.)
        if (this.name === Algorithm.MINIMAX) {
            const { capture, move } = AlphaBeta(match, 2);
            return [capture, move];
        }

        if (this.name === Algorithm.TD || this.name === Algorithm.TD_SEARCH) {
            // In play mode TD + Search runs the same learned V through a negamax
            // search. In training mode we always use the learning agent, because
            // that is what performs the TD update.
            const useSearch = this.name === Algorithm.TD_SEARCH && this.mode !== 0;
            const state = matchToEngineState(match);
            const action = useSearch
                ? this.search.selectAction(state, Math.random)
                : this.td.selectAction(state, Math.random);
            const from = action.from < 0 ? action.to : action.from; // arena encodes a placement as from === to
            return [action.capture, { from, to: action.to }];
        }
        if (match.mill.length > 0) {
            Capture = getRandomCapture(match);
        }

        return [Capture, getRandomMove(match)];
    }

    public chooseCapture(match: Match): number {
        return getRandomCapture(match);
    }

    public GenerateLegalCaptures(state: State, millsFormed: number[][]): number[] {
        if (this.Player === 0) {
            return state.B1.map((value, index) =>
                value === 1 && !millsFormed.some((mill) => mill.includes(index)) ? index : -1,
            ).filter((index) => index !== -1);
        } else {
            return state.B0.map((value, index) =>
                value === 1 && !millsFormed.some((mill) => mill.includes(index)) ? index : -1,
            ).filter((index) => index !== -1);
        }
    }

    public moveAndCapture(match: Match): void {}
}

export class Match {
    public White: Agent;
    public Black: Agent;
    public state: State;
    public score: Score;
    public moves: Move[];
    public isMove: boolean;
    public cells: Cell[];
    public moveHistory: Move[];
    public mill: number[];
    public millsFormed: { white: number[][]; black: number[][] };
    public lastMove: [number, number];
    public winner: Binary | null;
    private trainingNetworksSaved: boolean;

    constructor(
        white: AgentSetup,
        black: AgentSetup,
        /** 0-based index of this episode, used for the decay schedule. */
        episodeIndex = 0,
        totalEpisodes = 1,
    ) {
        this.White = new Agent(0, white.mode, white.algorithm, white.config, episodeIndex, totalEpisodes);
        this.Black = new Agent(1, black.mode, black.algorithm, black.config, episodeIndex, totalEpisodes);

        this.state = new State(0);

        this.score = { white: 0, black: 0 };
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
            black: [],
        };
    }

    public getState(): State {
        return this.state;
    }

    public moveCounter(): number {
        return this.moves.length;
    }

    public Phase(): string {
        return this.state.getPhase();
    }

    public setPhase(phase: string): void {
        this.state.setPhase(phase);
    }

    public Player(): string {
        return this.state.getPlayer();
    }

    public getCurrentPlayer(): string {
        return this.state.getPlayer();
    }

    public getAgent(player: Binary): Agent {
        if (player === 0) return this.White;
        else return this.Black;
    }
    public getCurrentPlayerAgent(): Agent {
        if (this.getCurrentPlayer() === "White") return this.White;
        else return this.Black;
    }

    public getWinner(): string | null {
        if (this.winner === 0) return "White";
        else if (this.winner === 1) return "Black";
        else return null;
    }

    public getScore(): Score {
        return this.score;
    }

    public getPiecesRemaining(player: string): number {
        if (player === "White") return this.White.Remaining();
        else return this.Black.Remaining();
    }

    public numMillsFormed(player: string): number {
        if (player === "White") return this.millsFormed.white.length;
        else return this.millsFormed.black.length;
    }

    public getCaptures(player: string): number {
        if (player === "White") return 12 - this.White.Remaining();
        else return 12 - this.Black.Remaining();
    }

    public doMove(move: Movement): void {
        const { from, to } = move;
        this.cells[from] = null;
        this.cells[to] = this.state.Player;
        this.state.setB(move);
        this.lastMove = [from, to];

        if (this.getCurrentPlayerAgent().canPlace()) {
            this.getCurrentPlayerAgent().placeCow();
            if (!this.getCurrentPlayerAgent().canPlace()) {
                if (this.getCurrentPlayerAgent().Remaining() <= 3) {
                    this.setPhase("Flying");
                } else {
                    this.setPhase("Moving");
                }
            }
        } else {
            if (this.Phase() == "Flying") {
            } else if (this.getCurrentPlayerAgent().Remaining() <= 3) {
                this.setPhase("Flying");
            }
        }
    }

    public doMoveOrCapture(move: Movement, capture: number): void {
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
                capture: capture !== -1 ? `${capture}` : "",
            });
        }
    }

    private formMill(position: number): void {
        this.mill = [];

        if (this.getCurrentPlayer() === "White") {
            if (isMillFormed(position, this.state.B0)) {
                const formedMill = getMillFormed(position, this.state.B0);
                if (formedMill) {
                    this.mill = [...formedMill];
                    this.millsFormed.white.push([...formedMill]);
                }
            }
        } else {
            if (isMillFormed(position, this.state.B1)) {
                const formedMill = getMillFormed(position, this.state.B1);
                if (formedMill) {
                    this.mill = [...formedMill];
                    this.millsFormed.black.push([...formedMill]);
                }
            }
        }
    }

    public getLastMove(): [number, number] {
        return this.lastMove;
    }

    private endGame(winner: Binary | null): boolean {
        this.winner = winner;
        if (!this.trainingNetworksSaved) {
            // Terminal TD update first, then record, then persist: the stats row
            // has to see the weights as they are after the final update.
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

    public isGameOver(): boolean {
        if (this.trainingNetworksSaved) return true;
        if (this.White.Remaining() < 3 || this.Black.Remaining() < 3) {
            return this.endGame(this.White.Remaining() < 3 ? 1 : 0);
        }
        // Only judge at the start of a turn (not between a move and its capture).
        if (this.isMove) {
            const toMove = this.state.Player;
            if (GenerateLegalMoves(this, toMove).length === 0) {
                // A player who cannot move loses.
                return this.endGame(toMove === 0 ? 1 : 0);
            }
            if (this.moveCounter() >= MAX_ARENA_MOVES) {
                return this.endGame(null); // draw
            }
        }
        return false;
    }

    public Capture(position: number): void {
        if (this.mill.length !== 0) {
            if (this.state.Player === 0) {
                this.state.B1[position] = 0;
                this.cells[position] = null;
                this.Black.Cows = Math.max(0, this.Black.Cows - 1);
                this.state.B1Remaining--;
                this.moves.push({
                    turn: this.moveCounter(),
                    agent: this.getCurrentPlayer(),
                    move: `Captured piece at ${position}`,
                    mill: false,
                    capture: `${position}`,
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
                    capture: `${position}`,
                });
            }
        }
    }
}
