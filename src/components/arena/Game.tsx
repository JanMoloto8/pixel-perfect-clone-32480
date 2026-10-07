import {
    GenerateLegalMoves,
    isMillFormed,
    getMillFormed,
    AlphaBeta,
    getRandomMove,
    getRandomCapture,
    Minimaxmove,
    chooseTDMove,
    makeTDTrainingMove
} from "../../utilities/helperFunctions";
import { NeuralNetwork } from "./neuralNetwork";

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
    private networkWeights: number[] | null;

    constructor(Player: Binary, mode: AgentMode, algorithm: string) {
        this.name = algorithm;
        this.Player = Player;
        this.mode = mode;
        this.Cows = 12;
        this.placingCows = 12;
        this.network = new NeuralNetwork();
        this.network.loadFromLocalStorage(Agent.getNetworkStorageKey(Player));
        this.networkWeights = this.network.getWeightsAsArray();
    }

    private static getNetworkStorageKey(player: Binary): string {
        const side = player === 0 ? "white" : "black";
        return `morabaraba-neural-network-${side}`;
    }

    public saveTrainingNetwork(): void {
        if (this.mode !== 0) return;
        this.network.printChangedWeights(this.networkWeights ?? []);
        this.network.saveToLocalStorage(Agent.getNetworkStorageKey(this.Player));
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

            if (this.mode === 0) {
                makeTDTrainingMove(this.network, match, 0.9, 0.1, [capture, move]);
                //console.log(`Training new weights: ${this.network.model.getWeights().map((weight) => weight.dataSync())}`);
            }

            return [capture, move];
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
        whiteAlgorithm: string,
        blackAlgorithm: string,
        whiteMode: AgentMode = 1,
        blackMode: AgentMode = 1,
    ) {
        this.White = new Agent(0, whiteMode, whiteAlgorithm);
        this.Black = new Agent(1, blackMode, blackAlgorithm);

        this.White.name = whiteAlgorithm;
        this.Black.name = blackAlgorithm;

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

    public isGameOver(): boolean {
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
                this.winner = null; // Draw
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
