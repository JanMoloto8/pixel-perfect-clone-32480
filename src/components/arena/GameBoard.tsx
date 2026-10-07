import { EDGES, POINTS } from "./Constants";
import type { Props } from "./Game";
import { setMillEdges } from "../../utilities/helperFunctions";
import { useEffect, useRef, useState } from "react";

export function GameBoard({ cells, mill, lastMove, whiteReserve = 12, blackReserve = 12 }: Props) {
    const millSet = new Set(mill);
    const millEdges = setMillEdges(mill);
    const [showMill, setShowMill] = useState(true);
    const [lastMoveState, setLastMoveState] = useState<[number, number]>(lastMove);
    const audioContextRef = useRef<AudioContext | null>(null);
    const playedMoveRef = useRef<string | null>(null);
    const renderReserve = (player: "white" | "black", count: number) => {
        count = 0;
        const safeCount = Math.max(0, count);
        if (safeCount <= 0) return null;

        const x = player === "white" ? -30 : 660;
        const baseY = 300 - ((safeCount - 1) * 22) / 2;

        return Array.from({ length: safeCount }, (_, index) => (
            <circle
                key={`${player}-${index}`}
                cx={x}
                cy={baseY + index * 22}
                r={12}
                fill={player === "white" ? "var(--piece-white)" : "var(--piece-black)"}
                stroke="var(--border)"
                strokeWidth={2}
            />
        ));
    };
    useEffect(() => {
        if (lastMove[0] !== -1 || lastMove[1] !== -1) {
            setLastMoveState(lastMove);
        }
    }, [lastMove]);

    useEffect(() => {
        if (lastMove[0] === -1 || lastMove[1] === -1) return;

        const moveKey = `${lastMove[0]}-${lastMove[1]}`;
        if (playedMoveRef.current === moveKey) return;
        playedMoveRef.current = moveKey;

        const audioContext = audioContextRef.current ?? new AudioContext();
        audioContextRef.current = audioContext;
        void audioContext.resume();

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startTime = audioContext.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(500, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(660, startTime + 0.08);
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.14);
    }, [lastMove]);

    useEffect(() => {
        return () => {
            void audioContextRef.current?.close();
        };
    }, []);

    useEffect(() => {
        if (mill.length === 0) return;

        setShowMill(true);

        const timer = setTimeout(() => {
            setShowMill(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [mill]);

    return (
        <svg
            viewBox="-40 -40 680 680"
            className="h-full w-full"
            role="img"
            aria-label="Morabaraba board"
        >
            <defs>
                <filter id="mill-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="8" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {renderReserve("white", whiteReserve)}
            {renderReserve("black", blackReserve)}

            {EDGES.map(([a, b], i) => (
                <line
                    key={i}
                    x1={POINTS[a][0]}
                    y1={POINTS[a][1]}
                    x2={POINTS[b][0]}
                    y2={POINTS[b][1]}
                    stroke="var(--wood)"
                    strokeWidth={10}
                    strokeLinecap="round"
                />
            ))}

            {millEdges.map(([a, b], i) => (
                <line
                    key={`m${i}`}
                    x1={POINTS[a][0]}
                    y1={POINTS[a][1]}
                    x2={POINTS[b][0]}
                    y2={POINTS[b][1]}
                    stroke={showMill ? "var(--mill)" : "var(--wood)"}
                    strokeWidth={2}
                    strokeLinecap="round"
                    filter={showMill ? "url(#mill-glow)" : undefined}
                />
            ))}

            {lastMoveState[0] !== -1 && lastMoveState[1] !== -1 && (
                <line
                    x1={POINTS[lastMoveState[0]][0]}
                    y1={POINTS[lastMoveState[0]][1]}
                    x2={POINTS[lastMoveState[1]][0]}
                    y2={POINTS[lastMoveState[1]][1]}
                    stroke="var(--info)"
                    strokeWidth={5}
                    strokeDasharray="14 12"
                    strokeLinecap="round"
                />
            )}

            {POINTS.map(([x, y], i) => {
                const cell = cells[i];
                if (cell === null)
                    return <circle key={i} cx={x} cy={y} r={0} fill="var(--wood)" opacity={0.45} />;
                const isMill = millSet.has(i);
                const isLast = lastMoveState.includes(i);
                return (
                    <g key={i} filter={isMill && showMill ? "url(#mill-glow)" : undefined}>
                        <circle
                            cx={x}
                            cy={y}
                            r={23}
                            fill={cell === 0 ? "var(--piece-white)" : "var(--piece-black)"}
                            stroke={
                                isMill && showMill
                                    ? "var(--mill)"
                                    : isLast
                                      ? "var(--info)"
                                      : "var(--border)"
                            }
                            strokeWidth={isMill || isLast ? 4 : 2}
                        />
                    </g>
                );
            })}
        </svg>
    );
}
