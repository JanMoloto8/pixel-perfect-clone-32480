import { Trophy } from "lucide-react";

type VictoryOverlayProps = {
    winner: string | null;
};

const confetti = [
    [7, 8, 0, "#facc15"],
    [15, 3, 1, "#4ade80"],
    [24, 12, 2, "#60a5fa"],
    [33, 5, 3, "#fb7185"],
    [42, 16, 4, "#c084fc"],
    [51, 2, 5, "#facc15"],
    [61, 11, 6, "#4ade80"],
    [70, 6, 7, "#60a5fa"],
    [79, 14, 8, "#fb7185"],
    [88, 4, 9, "#c084fc"],
    [93, 17, 10, "#facc15"],
    [3, 19, 11, "#60a5fa"],
] as const;

export function VictoryOverlay({ winner }: VictoryOverlayProps) {
    const isDraw = winner === null;

    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-live="polite">
            <div className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-lg border border-success/50 bg-background/95 px-8 py-6 text-center shadow-2xl victory-message">
                <Trophy className="mx-auto mb-2 h-10 w-10 text-warning" />
                <p className="font-display text-3xl font-bold uppercase tracking-[0.12em] text-success">
                    {isDraw ? "Match Ended" : "Congratulations!"}
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {isDraw ? "The match ended in a draw" : `${winner} wins the match`}
                </p>
            </div>
            {!isDraw &&
                confetti.map(([left, delay, rotation, color], index) => (
                    <span
                        key={index}
                        className="confetti-piece"
                        style={{
                            left: `${left}%`,
                            animationDelay: `${delay * 80}ms`,
                            backgroundColor: color,
                            transform: `rotate(${rotation * 20}deg)`,
                        }}
                    />
                ))}
        </div>
    );
}
