import { useEffect, useState } from "react";

type CountdownOverlayProps = {
    open: boolean;
    onComplete: () => void;
};

export function CountdownOverlay({ open, onComplete }: CountdownOverlayProps) {
    const [count, setCount] = useState(5);
    const [message, setMessage] = useState(false);

    useEffect(() => {
        if (!open) return;

        setCount(5);
        setMessage(false);

        const interval = setInterval(() => {
            setCount((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    setMessage(true);

                    setTimeout(() => {
                        onComplete();
                    }, 1200);

                    return 1;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [open, onComplete]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50 animate-in fade-in duration-300">
            {!message ? (
                <h1 className="animate-in zoom-in-50 text-8xl font-display font-bold text-white">
                    {count}
                </h1>
            ) : (
                <h1 className="animate-in zoom-in-75 text-center text-6xl font-display font-bold text-success">
                    White Agent Starts
                </h1>
            )}
        </div>
    );
}
