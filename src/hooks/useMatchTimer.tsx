import { useEffect, useRef, useState } from "react";
import { AgentMode, Match } from "../components/arena/Game";
import { Algorithm } from "@/types/Algorithm";

type MatchStatus = "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";

export function useMatchTimer() {
    const [moveInterval, setMoveInterval] = useState(3500);
    const [matchTime, setMatchTime] = useState(0);
    const [matchStatus, setMatchStatus] = useState<MatchStatus>("NOT_STARTED");
    const [showCountdown, setShowCountdown] = useState(false);
    const [whiteAlgorithm, setWhiteAlgorithm] = useState(Algorithm.STANDARD);
    const [blackAlgorithm, setBlackAlgorithm] = useState(Algorithm.STANDARD);
    const [whiteMode, setWhiteMode] = useState<AgentMode>(1);
    const [blackMode, setBlackMode] = useState<AgentMode>(1);
    const [whiteWins, setWhiteWins] = useState(0);
    const [blackWins, setBlackWins] = useState(0);
    const [draws, setDraws] = useState(0);
    const [episodeCount, setEpisodeCount] = useState(1);
    const [episodesCompleted, setEpisodesCompleted] = useState(0);
    const canChangeAlgorithms = matchStatus === "NOT_STARTED";

    const [match, setMatch] = useState<Match | null>(null);
    const [running, setRunning] = useState(false);
    const [, setTick] = useState(0);
    const pendingCapture = useRef<{ match: Match; capture: number } | null>(null);
    const completedEpisodes = useRef(0);

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
                if (match.getWinner() === "White") {
                    setWhiteWins((wins) => wins + 1);
                } else if (match.getWinner() === "Black") {
                    setBlackWins((wins) => wins + 1);
                } else {
                    setDraws((draws) => draws + 1);
                }
                completedEpisodes.current += 1;
                setEpisodesCompleted(completedEpisodes.current);

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
        resetStatistics,
    };
}
