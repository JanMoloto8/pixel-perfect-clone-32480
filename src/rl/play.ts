import { DEFAULT_RULES, GameState, Player, Rules, applyActionInPlace, initialState, legalActions } from "./engine";
import { Agent, outcomeFor } from "./agents";

export type GameRecord = {
    /** 0 = White won, 1 = Black won, 2 = draw */
    result: Player | 2;
    plies: number;
    final: GameState;
};

/**
 * `randomOpening` plies are played at random before the agents take over.
 * Greedy agents are deterministic, so without this two TD agents would play
 * the same two games over and over.
 */
export function playGame(
    white: Agent,
    black: Agent,
    rng: () => number,
    rules: Rules = DEFAULT_RULES,
    randomOpening = 0,
): GameRecord {
    const s = initialState();
    white.startGame(0);
    black.startGame(1);
    while (s.result === null && s.ply < randomOpening) {
        const acts = legalActions(s);
        applyActionInPlace(s, acts[Math.floor(rng() * acts.length)], rules);
    }
    while (s.result === null) {
        const agent = s.toMove === 0 ? white : black;
        const a = agent.selectAction(s, rng);
        applyActionInPlace(s, a, rules);
    }
    white.endGame(s);
    black.endGame(s);
    return { result: s.result, plies: s.ply, final: s };
}

export type MatchSummary = {
    games: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    /** (wins + 0.5 * draws) / games */
    score: number;
    avgPlies: number;
};

/** Plays `games` games, alternating colours, and scores them for `agent`. */
export function evaluate(
    agent: Agent,
    opponent: Agent,
    games: number,
    rng: () => number,
    rules: Rules = DEFAULT_RULES,
    randomOpening = 0,
): MatchSummary {
    let wins = 0, draws = 0, losses = 0, plies = 0;
    for (let g = 0; g < games; g++) {
        const agentIsWhite = g % 2 === 0;
        const rec = agentIsWhite ? playGame(agent, opponent, rng, rules, randomOpening)
            : playGame(opponent, agent, rng, rules, randomOpening);
        const o = outcomeFor(rec.final, agentIsWhite ? 0 : 1);
        if (o > 0) wins++;
        else if (o < 0) losses++;
        else draws++;
        plies += rec.plies;
    }
    return {
        games,
        wins,
        draws,
        losses,
        winRate: wins / games,
        score: (wins + 0.5 * draws) / games,
        avgPlies: plies / games,
    };
}
