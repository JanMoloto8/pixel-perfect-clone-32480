import { createFileRoute, Link } from "@tanstack/react-router";
import { ExperimentPanel } from "@/components/arena/ExperimentPanel";

export const Route = createFileRoute("/experiment")({
    head: () => ({
        meta: [
            { title: "Morabaraba Arena — Experiments" },
            {
                name: "description",
                content:
                    "Run reproducible training experiments with TD learning agents in Morabaraba. Configure runs, evaluate checkpoints, and download results.",
            },
        ],
    }),
    component: ExperimentPage,
});

function ExperimentPage() {
    return (
        <div className="min-h-screen bg-background p-4 text-foreground lg:p-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="font-heading text-xl font-bold tracking-tight lg:text-2xl">
                        Morabaraba Experiments
                    </h1>
                </div>
                <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    ← Back to Arena
                </Link>
            </header>

            <main className="mt-4 mx-auto max-w-2xl">
                <ExperimentPanel />
            </main>
        </div>
    );
}
