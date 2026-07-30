import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Clock,
  Flag,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  SkipForward,
  User,
} from "lucide-react";
import { GameBoard, type Cell } from "@/components/arena/GameBoard";
import { Disc, Panel, Row } from "@/components/arena/panels";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morabaraba AI Arena — Live AI vs AI Match Dashboard" },
      {
        name: "description",
        content:
          "Watch Minimax and Alpha-Beta agents battle in Morabaraba. Live board, move history, AI decision metrics and match statistics.",
      },
      { property: "og:title", content: "Morabaraba AI Arena — Live AI vs AI Match Dashboard" },
      {
        property: "og:description",
        content: "AI agents competing. Strategies evolving. A live Morabaraba simulation dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const cells: Cell[] = [
  // outer ring 0-7
  "W", "W", "W", "W", "W", "B", "W", "B",
  // middle ring 8-15
  "B", "B", "W", "B", "B", "B", "W", "W",
  // inner ring 16-23
  "W", "W", "W", "W", "B", "W", "B", "B",
];

const MILL = [16, 17, 18];
const LAST_MOVE: [number, number] = [15, 7];

const moves = [
  { turn: 35, agent: "Alpha-Beta Agent (Black)", move: "9 → 13", mill: false, capture: "-" },
  { turn: 36, agent: "Minimax Agent (White)", move: "21 → 17", mill: true, capture: "Captured 22" },
  { turn: 37, agent: "Alpha-Beta Agent (Black)", move: "13 → 17", mill: false, capture: "-" },
  { turn: 38, agent: "Minimax Agent (White)", move: "16 → 12", mill: false, capture: "-" },
];

const speeds = ["0.25x", "0.5x", "1x", "2x", "4x"];

function AgentCard({
  side,
  name,
  algorithm,
  color,
}: {
  side: string;
  name: string;
  algorithm: string;
  color: "W" | "B";
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border bg-secondary/40 p-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-background text-2xl">
        {color === "W" ? "🤖" : "🤖"}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {side}
        </p>
        <p className="truncate font-display text-xl font-bold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">Algorithm: {algorithm}</p>
      </div>
      <span
        className={`h-5 w-5 shrink-0 rounded-full border ${
          color === "W" ? "border-border bg-piece-white" : "border-muted-foreground bg-piece-black"
        }`}
      />
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background p-4 text-foreground lg:p-6">
      <header className="panel-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-warning/70 text-warning">
            <Activity className="h-5 w-5" />
          </span>
          <h1 className="truncate font-display text-2xl font-bold uppercase tracking-[0.1em] lg:text-4xl">
            Morabaraba AI Arena
          </h1>
        </div>
        <div className="hidden items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:flex">
          Simulation Status:
          <span className="rounded bg-success/20 px-3 py-1 font-bold text-success">Running</span>
        </div>
        <div className="flex shrink-0 items-center gap-6 border-l border-border pl-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-info" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Match Time
              </p>
              <p className="font-display text-lg font-bold">00:12:48</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Game ID
            </p>
            <p className="font-display text-lg font-bold">#MA-2025-0001</p>
          </div>
        </div>
      </header>

      <main className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        {/* left column */}
        <div className="flex flex-col gap-4">
          <Panel title="Main Dashboard">
            <div className="space-y-3 p-3">
              <AgentCard side="White AI Agent" name="Minimax Agent" algorithm="Minimax" color="W" />
              <AgentCard
                side="Black AI Agent"
                name="Alpha-Beta Agent"
                algorithm="Alpha-Beta Pruning"
                color="B"
              />
            </div>
            <Row icon={<User className="h-4 w-4" />} label="CURRENT TURN" value="White" />
            <Row icon={<RefreshCw className="h-4 w-4" />} label="CURRENT PHASE" value="Moving Phase" />
            <Row icon={<BarChart3 className="h-4 w-4" />} label="MOVE COUNTER" value="38" />
            <Row icon={<Gauge className="h-4 w-4" />} label="SIMULATION SPEED" value="1x" />
            <Row
              icon={<Flag className="h-4 w-4" />}
              label="MATCH STATUS"
              value={<span className="text-success">In Progress</span>}
              last
            />
          </Panel>

          <Panel title="Simulation Controls">
            <div className="grid grid-cols-3 gap-3 p-4">
              <button className="flex items-center justify-center gap-2 rounded-md bg-success/25 py-3 text-sm font-semibold uppercase tracking-wide text-success transition-colors hover:bg-success/35">
                <Play className="h-4 w-4 fill-current" /> Start
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md bg-warning/25 py-3 text-sm font-semibold uppercase tracking-wide text-warning transition-colors hover:bg-warning/35">
                <Pause className="h-4 w-4 fill-current" /> Pause
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md bg-info/25 py-3 text-sm font-semibold uppercase tracking-wide text-info transition-colors hover:bg-info/35">
                <Play className="h-4 w-4" /> Resume
              </button>
              <button className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-violet/40 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-violet/55 sm:col-span-1">
                <SkipForward className="h-4 w-4" /> Next Move
              </button>
              <button className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-danger/70 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-danger">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            <div className="px-4 pb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Speed Selector
              </p>
              <div className="flex flex-wrap gap-2">
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`min-w-[54px] rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      s === "1x"
                        ? "border-info bg-info/80 text-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* center column */}
        <div className="flex flex-col gap-4">
          <Panel title="Game Board">
            <div className="p-4">
              <div className="rounded-lg border border-border bg-board p-4">
                <div className="mx-auto aspect-square w-full max-w-[560px]">
                  <GameBoard cells={cells} mill={MILL} lastMove={LAST_MOVE} />
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

          <Panel title="Move History">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">Turn</th>
                    <th className="px-4 py-3 text-left font-semibold">AI Agent</th>
                    <th className="px-4 py-3 text-center font-semibold">Move</th>
                    <th className="px-4 py-3 text-center font-semibold">Mill Formed</th>
                    <th className="px-4 py-3 text-center font-semibold">Capture</th>
                  </tr>
                </thead>
                <tbody>
                  {moves.map((m, i) => (
                    <tr
                      key={m.turn}
                      className={`border-b border-border/50 ${
                        i === moves.length - 1 ? "bg-info/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3">{m.turn}</td>
                      <td className="px-4 py-3">{m.agent}</td>
                      <td className="px-4 py-3 text-center">{m.move}</td>
                      <td
                        className={`px-4 py-3 text-center ${m.mill ? "font-semibold text-success" : "text-muted-foreground"}`}
                      >
                        {m.mill ? "Yes" : "No"}
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${
                          m.capture === "-" ? "text-muted-foreground" : "text-danger"
                        }`}
                      >
                        {m.capture}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* right column */}
        <div className="flex flex-col gap-4">
          <Panel title="Match Information">
            <Row
              label="Current Phase"
              value={
                <span className="rounded bg-info/80 px-2.5 py-1 text-xs font-semibold">
                  Moving Phase
                </span>
              }
            />
            <Row
              label="Current Turn"
              value={
                <span className="flex items-center gap-2">
                  <Disc color="W" /> White
                </span>
              }
            />
            <Row
              label="White Pieces Remaining"
              value={
                <span className="flex items-center gap-3">
                  <Disc color="W" /> 5
                </span>
              }
            />
            <Row
              label="Black Pieces Remaining"
              value={
                <span className="flex items-center gap-3">
                  <Disc color="B" /> 6
                </span>
              }
            />
            <Row
              label="Mills Formed (White / Black)"
              value={
                <span className="flex items-center gap-2">
                  <span className="rounded bg-info/30 px-2 text-info">7</span> /
                  <Disc color="B" /> 5
                </span>
              }
            />
            <Row
              label="Captures (White / Black)"
              value={
                <span className="flex items-center gap-2">
                  <span className="text-info">4</span> / <Disc color="B" /> 3
                </span>
              }
            />
            <Row label="Winner" value={<span className="text-muted-foreground">-</span>} last />
          </Panel>

          <Panel title="AI Decision Panel">
            <Row label="Current AI" value={<span className="text-info">Minimax Agent</span>} />
            <Row label="Legal Moves Generated" value="18" />
            <Row label="Selected Move" value={<span className="text-info">(16 → 12)</span>} />
            <Row label="Evaluation Score" value="+1.32" />
            <Row label="Search Depth" value="4" />
            <Row label="Nodes Expanded" value="8,642" last />
          </Panel>

          <Panel title="Match Statistics">
            <Row label="Total Moves" value="38" />
            <Row label="White Wins" value="3" />
            <Row label="Black Wins" value="2" />
            <Row label="Draws" value="0" />
            <Row label="Average Decision Time" value="1.28s" />
            <Row label="Match Duration" value="00:12:48" last />
          </Panel>
        </div>
      </main>

      <footer className="panel-card mt-4 grid grid-cols-1 items-center gap-2 px-5 py-4 text-center text-xs uppercase tracking-[0.14em] text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:text-left">
        <p className="sm:text-center">
          Morabaraba AI Arena | AI Agents Competing. Strategies Evolving.
        </p>
        <p>© 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
}
