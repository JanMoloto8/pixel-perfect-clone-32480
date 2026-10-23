import { createFileRoute } from "@tanstack/react-router";
import {
    Header,
    MainDashboard,
    MatchInfo,
    MatchStatistics,
} from "@/components/arena/boardComponents";

import {
    SimulationControls,
    MainGameBoard,
    MoveHistory,
    SessionConfiguration,
} from "@/components/arena/boardComponents";
import { AgentConfigPanel } from "@/components/arena/AgentConfigPanel";
import { StatsPanel } from "@/components/arena/StatsPanel";
import { useMatchTimer } from "../hooks/useMatchTimer";
import { VictoryOverlay } from "@/components/ui/VictoryOverlay";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "Morabaraba Arena" },
            {
                name: "description",
                content:
                    "Watch Minimax and Alpha-Beta agents battle in Morabaraba. Live board, move history, AI decision metrics and match statistics.",
            },
            {
                property: "og:title",
                content: "Morabaraba AI Arena — Live AI vs AI Match Dashboard",
            },
            {
                property: "og:description",
                content:
                    "AI agents competing. Strategies evolving. A live Morabaraba simulation dashboard.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),
    component: Index,
});

function Index() {
    const {
        whiteAlgorithm,
        blackAlgorithm,
        whiteMode,
        blackMode,
        setWhiteAlgorithm,
        setBlackAlgorithm,
        setWhiteMode,
        setBlackMode,
        showCountdown,
        showCountdownOverlay,
        onCompleteCountdown,
        match,
        matchTime,
        moveInterval,
        setMoveInterval,
        whiteWins,
        blackWins,
        running,
        matchStatus,
        pauseGame,
        resumeGame,
        resetGame,
        resetStatistics,
        draws,
        episodeCount,
        setEpisodeCount,
        episodesCompleted,
        whiteConfig,
        blackConfig,
        setWhiteConfig,
        setBlackConfig,
        clearTrainedNetworks,
        whiteStats,
        blackStats,
    } = useMatchTimer();

    const locked = matchStatus !== "NOT_STARTED";

    return (
        <div className="min-h-screen bg-background p-4 text-foreground lg:p-6">
            {matchStatus === "COMPLETED" && <VictoryOverlay winner={match?.getWinner() ?? null} />}
            <Header matchTime={matchTime} running={running} matchStatus={matchStatus} />

            <main className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_400px]">
                <div className="flex flex-col gap-4">
                    <MainDashboard match={match} matchStatus={matchStatus} />
                    <SessionConfiguration
                        matchStatus={matchStatus}
                        episodeCount={episodeCount}
                        setEpisodeCount={setEpisodeCount}
                        clearTrainedNetworks={clearTrainedNetworks}
                    />
                    <AgentConfigPanel
                        locked={locked}
                        whiteAlgorithm={whiteAlgorithm}
                        blackAlgorithm={blackAlgorithm}
                        setWhiteAlgorithm={setWhiteAlgorithm}
                        setBlackAlgorithm={setBlackAlgorithm}
                        whiteMode={whiteMode}
                        blackMode={blackMode}
                        setWhiteMode={setWhiteMode}
                        setBlackMode={setBlackMode}
                        whiteConfig={whiteConfig}
                        blackConfig={blackConfig}
                        setWhiteConfig={setWhiteConfig}
                        setBlackConfig={setBlackConfig}
                    />
                    <SimulationControls
                        startGame={showCountdownOverlay}
                        pauseGame={pauseGame}
                        resumeGame={resumeGame}
                        resetGame={resetGame}
                        showCountdown={showCountdown}
                        onCompleteCountdown={onCompleteCountdown}
                        moveInterval={moveInterval}
                        setMoveInterval={setMoveInterval}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <MainGameBoard match={match} />
                    {(matchStatus == "PAUSED" ||
                        matchStatus == "IN_PROGRESS" ||
                        matchStatus == "COMPLETED") && <MoveHistory match={match} />}
                </div>

                <div className="flex flex-col gap-4">
                    {(matchStatus == "IN_PROGRESS" ||
                        matchStatus == "PAUSED" ||
                        matchStatus == "COMPLETED") && <MatchInfo match={match} />}
                    <StatsPanel
                        whiteAlgorithm={whiteAlgorithm}
                        blackAlgorithm={blackAlgorithm}
                        whiteMode={whiteMode}
                        blackMode={blackMode}
                        whiteStats={whiteStats}
                        blackStats={blackStats}
                    />
                    {
                        <MatchStatistics
                            match={match}
                            matchTime={matchTime}
                            whiteWins={whiteWins}
                            blackWins={blackWins}
                            draws={draws}
                            episodesCompleted={episodesCompleted}
                            episodeCount={episodeCount}
                            resetStatistics={resetStatistics}
                        />
                    }
                </div>
            </main>
        </div>
    );
}
