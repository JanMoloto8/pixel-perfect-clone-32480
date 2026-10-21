import {
    Activity,
    BarChart3,
    Clock,
    Flag,
    Pause,
    Play,
    RefreshCw,
    RotateCcw,
    User,
} from "lucide-react";
import { Disc, Panel, Row } from "./panels";
import { GameBoard } from "./GameBoard";
import { movesList } from "@/utilities/helperFunctions";
import { formatTime } from "@/utilities/timerUtils";
import { AgentMode, Cell, Match } from "./Game";
import { AgentCard } from "../ui/AgentCard";
import { CountdownOverlay } from "../ui/CountdownOverlay";
import { Slider } from "../ui/slider";

type MatchStatus = "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";

type HeaderProps = {
    matchTime: number;
    running: boolean;
    matchStatus: MatchStatus;
};

type SimulationControlsProps = {
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    resetGame: () => void;
    showCountdown: boolean;
    onCompleteCountdown: () => void;
    moveInterval: number;
    setMoveInterval: (value: number) => void;
};

export function Header({ matchTime, running, matchStatus }: HeaderProps) {
    return (
        <header className="panel-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-warning/70 text-warning">
                    <Activity className="h-5 w-5" />
                </span>
                <h1 className="truncate font-display text-2xl font-bold uppercase tracking-[0.1em] lg:text-4xl">
                    Morabaraba Arena
                </h1>
            </div>
            <div className="hidden items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:flex">
                Simulation Status:
                <span className="rounded bg-success/20 px-3 py-1 font-bold text-success">
                    {matchStatus === "IN_PROGRESS"
                        ? "RUNNING"
                        : matchStatus === "PAUSED"
                          ? "PAUSED"
                          : matchStatus == "COMPLETED"
                            ? "COMPLETED"
                            : "NOT STARTED"}
                </span>
            </div>
            <div className="flex shrink-0 items-center gap-6 border-l border-border pl-6">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-info" />
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Match Time :
                        </p>
                        <p className="font-display text-lg font-bold">{formatTime(matchTime)}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export function MainDashboard({
    match,
    matchStatus,
}: {
    match: Match | null;
    matchStatus: MatchStatus;
}) {
    return (
        //standard TD, TD(λ), Monte Carlo learning, and Minimax-guided TD learning
        <Panel title="Main Dashboard">
            <div className="space-y-3 p-3">
                <AgentCard
                    side="White AI Agent"
                    name={match?.White.getName() || ""}
                    algorithm={match?.White.name || ""}
                    mode={match?.White.mode === 0 ? "Training" : "Playing"}
                    color="W"
                />
                <AgentCard
                    side="Black AI Agent"
                    name={match?.Black.getName() || ""}
                    algorithm={match?.Black.name || ""}
                    mode={match?.Black.mode === 0 ? "Training" : "Playing"}
                    color="B"
                />
            </div>
            <Row
                icon={<User className="h-4 w-4" />}
                label="CURRENT TURN"
                value={match?.getCurrentPlayer() || null}
            />
            <Row
                icon={<RefreshCw className="h-4 w-4" />}
                label="CURRENT PHASE"
                value={match?.Phase() || "Placing Phase"}
            />
            <Row
                icon={<BarChart3 className="h-4 w-4" />}
                label="MOVE COUNTER"
                value={match?.moveCounter() || 0}
            />
            <Row
                icon={<Flag className="h-4 w-4" />}
                label="MATCH STATUS"
                value={
                    <span className="text-success">
                        {matchStatus === "IN_PROGRESS"
                            ? "In Progress"
                            : matchStatus === "PAUSED"
                              ? "Paused"
                              : matchStatus == "COMPLETED"
                                ? "Completed"
                                : "Not Started"}
                    </span>
                }
                last
            />
        </Panel>
    );
}

type Props = {
    matchStatus: MatchStatus;
    whiteAlgorithm: string;
    blackAlgorithm: string;
    whiteMode: AgentMode;
    blackMode: AgentMode;
    setWhiteAlgorithm: (value: string) => void;
    setBlackAlgorithm: (value: string) => void;
    setWhiteMode: (value: AgentMode) => void;
    setBlackMode: (value: AgentMode) => void;
    episodeCount: number;
    setEpisodeCount: (value: number) => void;
};

export function MatchConfiguration({
    matchStatus,
    whiteAlgorithm,
    blackAlgorithm,
    whiteMode,
    blackMode,
    setWhiteAlgorithm,
    setBlackAlgorithm,
    setWhiteMode,
    setBlackMode,
    episodeCount,
    setEpisodeCount,
}: Props) {
    const locked = matchStatus !== "NOT_STARTED";

    return (
        <Panel title="Match Configuration">
            <div className="space-y-4 p-4">
                <div>
                    <label className="mb-2 block text-sm font-semibold">White Agent</label>

                    <select
                        disabled={locked}
                        value={whiteAlgorithm}
                        onChange={(e) => setWhiteAlgorithm(e.target.value)}
                        className="w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50"
                    >
                        <option>TD</option>
                        <option>TD + Minimax</option>
                        <option>Minimax</option>
                        <option>Random</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">Black Agent</label>

                    <select
                        disabled={locked}
                        value={blackAlgorithm}
                        onChange={(e) => setBlackAlgorithm(e.target.value)}
                        className="w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50"
                    >
                        <option>TD</option>
                        <option>TD + Minimax</option>
                        <option>Minimax</option>
                        <option>Random</option>
                    </select>
                </div>
                
                    <div>
                        <label htmlFor="episode-count" className="mb-2 block text-sm font-semibold">
                            Episodes
                        </label>
                        <input
                            id="episode-count"
                            type="number"
                            min={1}
                            step={1}
                            disabled={locked}
                            value={episodeCount}
                            onChange={(e) => setEpisodeCount(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50"
                        />
                    </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">White Agent Mode</label>
                    <select
                        disabled={locked}
                        value={whiteMode}
                        onChange={(e) => setWhiteMode(Number(e.target.value) as AgentMode)}
                        className="w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50"
                    >
                        <option value={0}>Training</option>
                        <option value={1}>Playing</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold">Black Agent Mode</label>
                    <select
                        disabled={locked}
                        value={blackMode}
                        onChange={(e) => setBlackMode(Number(e.target.value) as AgentMode)}
                        className="w-full rounded-md border border-border bg-panel px-3 py-2 disabled:opacity-50"
                    >
                        <option value={0}>Training</option>
                        <option value={1}>Playing</option>
                    </select>
                </div>
            </div>
        </Panel>
    );
}

export function SimulationControls({
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    showCountdown,
    onCompleteCountdown,
    moveInterval,
    setMoveInterval,
}: SimulationControlsProps): import("react").JSX.Element {
    return (
        <>
            <CountdownOverlay open={showCountdown} onComplete={onCompleteCountdown} />

            <Panel title="Simulation Controls">
                <div className="grid grid-cols-3 gap-3 px-4 pt-4">
                    <button
                        onClick={startGame}
                        className="flex items-center justify-center gap-2 rounded-md bg-success/25 py-3 text-sm font-semibold uppercase tracking-wide text-success transition-colors hover:bg-success/35"
                    >
                        <Play className="h-4 w-4 fill-current" /> Start
                    </button>
                    <button
                        onClick={pauseGame}
                        className="flex items-center justify-center gap-2 rounded-md bg-warning/25 py-3 text-sm font-semibold uppercase tracking-wide text-warning transition-colors hover:bg-warning/35"
                    >
                        <Pause className="h-4 w-4 fill-current" /> Pause
                    </button>
                    <button
                        onClick={resumeGame}
                        className="flex items-center justify-center gap-2 rounded-md bg-info/25 py-3 text-sm font-semibold uppercase tracking-wide text-info transition-colors hover:bg-info/35"
                    >
                        <Play className="h-4 w-4" /> Resume
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4">
                    <button
                        onClick={resetGame}
                        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-danger/70 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-danger"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                </div>
                <div className="border-t border-border p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <label htmlFor="move-interval" className="text-sm font-semibold">
                            Time Between Moves
                        </label>
                        <span className="font-display text-sm font-bold text-info">
                            {(moveInterval / 1000).toFixed(1)}s
                        </span>
                    </div>
                    <Slider
                        id="move-interval"
                        min={1}
                        max={10000}
                        step={500}
                        value={[moveInterval]}
                        onValueChange={([value]) => setMoveInterval(value)}
                        aria-label="Time between moves"
                    />
                    <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        <span>Fast</span>
                        <span>Slow</span>
                    </div>
                </div>
            </Panel>
        </>
    );
}

const cells: Cell[] = [
    // outer ring 0-7
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    // middle ring 8-15
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    // inner ring 16-23
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
];
const MILL: number[] = [];

const LAST_MOVE: [number, number] = [-1, -1];

export function MainGameBoard({ match }: { match: Match | null }) {
    return (
        <Panel title="Game Board">
            <div className="p-4">
                <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-info/40 bg-info/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Disc color="W" className="h-5 w-5" />
                        <span className="hidden text-muted-foreground sm:inline">White</span>
                        <span>{match?.getPiecesRemaining("White") ?? 12}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Disc
                            color={match?.getCurrentPlayer() === "White" ? "W" : "B"}
                            className="h-6 w-6 border-2"
                        />
                        <span className="text-xl font-bold text-foreground">
                            {match?.getCurrentPlayer() || "White"}
                        </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm font-semibold">
                        <span>{match?.getPiecesRemaining("Black") ?? 12}</span>
                        <span className="hidden text-muted-foreground sm:inline">Black</span>
                        <Disc color="B" className="h-5 w-5" />
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-board p-4">
                    <div className="mx-auto aspect-square w-full max-w-[560px]">
                        <GameBoard
                            cells={match?.cells || cells}
                            mill={match?.mill || MILL}
                            lastMove={match?.getLastMove() || LAST_MOVE}
                            whiteReserve={match?.White.placingCows ?? 12}
                            blackReserve={match?.Black.placingCows ?? 12}
                        />
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <Disc color="W" /> White
                    </span>
                    <span className="flex items-center gap-2">
                        <Disc color="B" /> Black
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-1 w-7 rounded-full bg-mill" /> Mill
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-info" /> Last Move
                    </span>
                </div>
            </div>
        </Panel>
    );
}

const moves: { turn: number; agent: string; move: string; mill: boolean; capture: string }[] = [];

function HistoryTable({
    moves,
}: {
    moves: { turn: number; agent: string; move: string; mill: boolean; capture: string }[];
}) {
    return (
        <div className="max-h-[372px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
                <thead className="sticky top-0 z-10 bg-panel">
                    <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        <th className="px-4 py-3 text-left font-semibold">Turn</th>
                        <th className="px-4 py-3 text-left font-semibold">AI Agent</th>
                        <th className="px-4 py-3 text-center font-semibold">Move</th>
                        <th className="px-4 py-3 text-center font-semibold">Mill Formed</th>
                        <th className="px-4 py-3 text-center font-semibold">Capture</th>
                    </tr>
                </thead>
                <tbody>{movesList(moves)}</tbody>
            </table>
        </div>
    );
}

export function MoveHistory({ match }: { match: Match | null }) {
    const moves = [...(match?.moves ?? [])].sort((a, b) => b.turn - a.turn);
    return (
        <Panel title="Move History">
            <div className="max-h-[372px] overflow-y-auto overflow-x-auto">
                <HistoryTable moves={moves} />
            </div>
        </Panel>
    );
}

export function MatchInfo({ match }: { match: Match | null }) {
    return (
        <Panel title="Match Information">
            <Row
                label="Current Phase"
                value={
                    <span className="rounded bg-info/80 px-2.5 py-1 text-xs font-semibold">
                        {match?.Phase() + " Phase" || "Placing Phase"}
                    </span>
                }
            />
            <Row
                label="Current Turn"
                value={
                    <span className="flex items-center gap-2">
                        <Disc color={match?.getCurrentPlayer() === "White" ? "W" : "B"} />{" "}
                        {match?.getCurrentPlayer() || "White"}
                    </span>
                }
            />
            <Row
                label="White Pieces Remaining"
                value={
                    <span className="flex items-center gap-3">
                        <Disc color="W" /> {match?.getPiecesRemaining("White") || 0}
                    </span>
                }
            />
            <Row
                label="Black Pieces Remaining"
                value={
                    <span className="flex items-center gap-3">
                        <Disc color="B" /> {match?.getPiecesRemaining("Black") || 0}
                    </span>
                }
            />
            <Row
                label="Mills Formed (White / Black)"
                value={
                    <span className="flex items-center gap-2">
                        <span className="rounded bg-info/30 px-2 text-info">
                            {match?.numMillsFormed("White") || 0}
                        </span>{" "}
                        /
                        <Disc color="B" /> {match?.numMillsFormed("Black") || 0}
                    </span>
                }
            />
            <Row
                label="Captures (White / Black)"
                value={
                    <span className="flex items-center gap-2">
                        <span className="text-info">{match?.getCaptures("White") || 0}</span> /{" "}
                        <Disc color="B" /> {match?.getCaptures("Black") || 0}
                    </span>
                }
            />
            <Row label="Winner" value={<span className="text-muted-foreground">-</span>} last />
        </Panel>
    );
}

export function DecisionPanel() {
    return (
        <Panel title="AI Decision Panel">
            <Row label="Current AI" value={<span className="text-info">Minimax Agent</span>} />
            <Row label="Legal Moves Generated" value="18" />
            <Row label="Selected Move" value={<span className="text-info">(16 → 12)</span>} />
            <Row label="Evaluation Score" value="+1.32" />
            <Row label="Search Depth" value="4" />
            <Row label="Nodes Expanded" value="8,642" last />
        </Panel>
    );
}

export function MatchStatistics({
    match,
    matchTime,
    whiteWins,
    blackWins,
    draws,
    episodesCompleted,
    episodeCount,
    resetStatistics,
}: {
    match: Match | null;
    matchTime: number;
    whiteWins: number;
    blackWins: number;
    draws: number;
    episodesCompleted: number;
    episodeCount: number;
    resetStatistics: () => void;
}) {
    return (
        <Panel title="Match Statistics">
            <Row label="Total Moves" value={match?.moves.length || 38} />
            <Row label="White Wins" value={whiteWins} />
            <Row label="Black Wins" value={blackWins} />
            <Row label="Draws" value={draws} />
            <Row label="Episodes" value={`${episodesCompleted} / ${episodeCount}`} />
            <Row label="Average Decision Time" value="1.28s" />
            <Row label="Match Duration" value={formatTime(matchTime)} last />
            <div className="border-t border-border p-4">
                <button
                    type="button"
                    onClick={resetStatistics}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-danger/70 py-2 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-danger"
                >
                    <RotateCcw className="h-4 w-4" /> Reset Win Counts
                </button>
            </div>
        </Panel>
    );
}
