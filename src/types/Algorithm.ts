export enum Algorithm {
    STANDARD = "Standard",
    TD = "TD",
    /** The learned value function, but chosen through a 2-ply negamax search. */
    TD_SEARCH = "TD + Search",
    MINIMAX = "Alpha-Beta",
    MCTS = "Monte Carlo Tree Search",
    RANDOM = "Random",
}
//standard TD, TD(λ), Monte Carlo learning, and Minimax-guided TD learning

/** Agents that are actually implemented in Game.tsx (MCTS is not yet). */
export const IMPLEMENTED_ALGORITHMS: Algorithm[] = [
    Algorithm.STANDARD,
    Algorithm.TD,
    Algorithm.TD_SEARCH,
    Algorithm.MINIMAX,
    Algorithm.RANDOM,
];
