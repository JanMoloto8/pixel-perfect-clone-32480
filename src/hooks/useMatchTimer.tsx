import { useEffect, useRef, useState } from "react";
import { AgentMode, AgentSetup, Binary, Match, resetLearning, resetStats, sessionStats } from "../components/arena/Game";
import { Algorithm } from "@/types/Algorithm";
import { AgentConfig, DEFAULT_AGENT_CONFIG, clampConfig } from "@/types/AgentConfig";
import { StatsRow } from "@/rl/episodeStats";

type MatchStatus = "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";

export function useMatchTimer() {
    const [moveInterval, setMoveInterval] = useState(3500);
    const [matchTime, setMatchTime] = useState(0);
    const [matchStatus, setMatchStatus] = useState<MatchStatus>("NOT_STARTED");
    const [showCountdown, setShowCountdown] = useState(false);
    const [whiteAlgorithm, setWhiteAlgorithm] = useState(Algorithm.TD);
    const [blackAlgorithm, setBlackAlgorithm] = useState(Algorithm.TD);
    const [whiteMode, setWhiteMode] = useState<AgentMode>(1);
    const [blackMode, setBlackMode] = useState<AgentMode>(1);
    const [whiteWins, setWhiteWins] = useState(0);
    const [blackWins, setBlackWins] = useState(0);
    const [draws, setDraws] = useState(0);
    const [episodeCount, setEpisodeCount] = useState(1);
    const [episodesCompleted, setEpisodesCompleted] = useState(0);
    const [whiteConfig, setWhiteConfigRaw] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
    const [blackConfig, setBlackConfigRaw] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
    /** Bumped whenever a stats row is appended, so panels re-render. */
    const [statsVersion, setStatsVersion] = useState(0);
    const canChangeAlgorithms = matchStatus === "NOT_STARTED";

    // Settings are read when each episode's Match is built, so changing them
    // mid-session would silently split a run across two configurations.
    const setWhiteConfig = (c: AgentConfig) => canChangeAlgorithms && setWhiteConfigRaw(clampConfig(c));
    const setBlackConfig = (c: AgentConfig) => canChangeAlgorithms && setBlackConfigRaw(clampConfig(c));

    const [match, setMatch] = useState<Match | null>(null);
    const [running, setRunning] = useState(false);
    const [, setTick] = useState(0);
    const pendingCapture = useRef<{ match: Match; capture: number } | null>(null);
    const completedEpisodes = useRef(0);
    /**
     * The match we have already counted.
     *
     * Without this the episode counter double-counts: after a game ends we call
     * startNextEpisode(), but React does not run the effect cleanup (which
     * clears this interval) until the re-render commits, so the old interval can
     * fire once more, still holding the finished match, and count it again. A
     * "5 episode" session then only plays 3 games.
     */
    const countedMatch = useRef<Match | null>(null);

    useEffect(() => {
        if (!running) return;

        const interval = setInterval(() => {
            setMatchTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [running]);

    useEffect(() => {
        if (!running || !match) return;

        const interval = setInterval(() => {
            if (match.isGameOver()) {
                // Only ever count a given match once (see countedMatch).
                if (countedMatch.current === match) return;
                countedMatch.current = match;

                if (match.getWinner() === "White") {
                    setWhiteWins((wins) => wins + 1);
                } else if (match.getWinner() === "Black") {
                    setBlackWins((wins) => wins + 1);
                } else {
                    setDraws((draws) => draws + 1);
                }
                completedEpisodes.current += 1;
                setEpisodesCompleted(completedEpisodes.current);
                // isGameOver() just recorded this episode's stats row.
                setStatsVersion((v) => v + 1);

                if (completedEpisodes.current < episodeCount) {
                    startNextEpisode();
                } else {
                    setRunning(false);
                    setMatchStatus("COMPLETED");
                    clearInterval(interval);
                }
                return;
            }

            if (match.isMove) {
                const [capture, move] = match.getCurrentPlayerAgent().chooseMoveAndCapture(match);
                pendingCapture.current = { match, capture };
                match.doMoveOrCapture(move, capture);
            } else {
                const cachedCapture = pendingCapture.current?.match === match ? pendingCapture.current.capture : -1;
                const capture = cachedCapture === -1 && match.mill.length > 0
                    ? match.getCurrentPlayerAgent().chooseCapture(match)
                    : cachedCapture;

                pendingCapture.current = null;
                match.doMoveOrCapture({ from: -1, to: -1 }, capture);
            }
            
            setTick((t) => t + 1);
        }, moveInterval);

        return () => clearInterval(interval);
    }, [running, match, moveInterval]);

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
        const white: AgentSetup = { algorithm: whiteAlgorithm, mode: whiteMode, config: whiteConfig };
        const black: AgentSetup = { algorithm: blackAlgorithm, mode: blackMode, config: blackConfig };
        const newMatch = new Match(white, black, completedEpisodes.current, episodeCount);

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
     * session starts from the shipped td-agent.json instead of continuing.
     */
    function clearTrainedNetworks(): number {
        const removed = resetLearning();
        resetStatistics();
        setEpisodesCompleted(0);
        completedEpisodes.current = 0;
        setStatsVersion((v) => v + 1);
        return removed;
    }

    /** Clears just the stats for one side, keeping the trained network. */
    function clearAgentStats(player: Binary): void {
        resetStats(player);
        setStatsVersion((v) => v + 1);
    }

    const whiteStats: StatsRow[] = sessionStats(0)?.rows ?? [];
    const blackStats: StatsRow[] = sessionStats(1)?.rows ?? [];

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
        statsVersion,
    };
}
