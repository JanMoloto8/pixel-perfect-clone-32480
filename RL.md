# TD(0) agents for Morabaraba

## What was wrong

The agents did not learn, and most gradients were zero, because of several problems working together:

1. **The network blew up and its ReLUs died.** The inputs were not scaled (cow counts up to 12), the step size was 0.1, and rewards went up to 5. The weights grew quickly. After about 10 training games every unit in the first layer output 0, and the gradient of a dead ReLU is exactly 0. From then on, no update could change the hidden layers.
2. **The dead weights were reloaded forever.** They were saved to localStorage after each game and loaded again at the start of the next one, so a broken network stayed broken.
3. **The wrong positions were being trained.** The agent picked moves using V(position after my move), but the update was done on V(position before my move). The values used to choose moves were never trained directly.
4. **Losing was never punished.** The losing agent never got a final update, because only the player who ended the game did an update. Also, a loss gave reward 0, which is better than the -1 given for an ordinary move.
5. **Inconsistent positions were compared.** When choosing a move, positions with a capture were evaluated after the turn passed to the opponent, and positions without a capture were evaluated before it passed. So the network compared two different kinds of positions.
6. **Game bugs:**
   - Point 18 was listed as next to 7 instead of 17.
   - Minimax/alpha-beta never played the opponent's reply unless a mill was formed.
   - Black's alpha-beta tried to capture its own cows.
   - A blocked player did not lose.
   - Games had no length limit.

## What the fix does

- `src/rl/engine.ts`: a small, fast game engine. One action is a whole turn (move + capture).
- `src/rl/features.ts`: 54 inputs, all scaled to [0, 1], written from the moving player's point of view ("my cows / their cows"). This lets one network play either colour, which is what makes self-play possible.
- `src/rl/valueNet.ts`: the same 54-64-64-1 network, with the **semi-gradient TD(0)** update `w <- w + alpha * (target - V(x)) * grad V(x)`. The target is a plain number, so no gradient goes through it.
- `src/rl/agents.ts`:
  - `TDAgent` learns **afterstate values**. After each of its moves, it updates its previous afterstate towards `r + gamma * V(new afterstate)`. When the game ends, it updates towards +1 for a win, -1 for a loss and 0 for a draw. This happens for both players.
  - There is a small optional reward of 0.05 per capture.
  - `RandomAgent` and `AlphaBetaAgent` (depth 1–3) are the baselines.
- The website (`Game.tsx`, `helperFunctions.tsx`, `neuralNetwork.tsx`) now uses the same agent:
  - Old saved weights are ignored (new storage key `-v2`).
  - If nothing has been trained in the browser yet, the network starts from fresh random weights (Glorot uniform initialisation).

## Running things

```sh
npm run rl:test          # engine + TD update sanity checks
npm run rl:arena-test    # plays the website's own game loop for every agent pairing
npm run rl:train -- --opponent self --episodes 5000 --name self-s1 --seed 1
npm run rl:train -- --opponent ab1  --episodes 5000 --name ab1-s1  --seed 1
npm run rl:compare -- --runs self-s1,ab1-s1 --games 100
```

`--opponent` can be `self`, `random`, `ab1`, `ab2` or `ab3`.

Every `--eval-every` games, training stops to play the greedy agent against `--eval-vs` (default `random,ab1,ab2`). It writes:

- `results/<name>/eval.csv`: wins, draws, losses and score against each opponent
- `results/<name>/train.csv`: mean |TD error|, gradient norm, share of zero-gradient updates, dead ReLU share, weight norm and V(opening)
- `results/<name>/best-weights.json`: the weights with the best evaluation score

`results/summary/` has the combined CSVs from the runs below.

## Results (5,000 games per run, 2 seeds each)

Tournament scores are (wins + ½ draws) / 100 games, averaged over the 2 seeds:

| Trained by | vs random | vs alpha-beta d1 | vs alpha-beta d2 | vs alpha-beta d3 |
|---|---|---|---|---|
| Self-play | 0.98 | 0.28 | 0.04 | 0.00 |
| vs random | 0.97 | 0.14 | 0.05 | 0.01 |
| vs alpha-beta d1 | 0.46 | 0.16 | 0.12 | 0.00 |
| vs alpha-beta d2 | 0.55 | 0.10 | 0.09 | 0.00 |

- No run logged a zero-gradient update, and dead units stayed below 7%.
- **Self-play is best**, and it also beats every other trained agent head to head.
- Agents trained against alpha-beta lose almost every training game. They learn to hold draws against alpha-beta, but they never learn how to win, and they even lose to the random player.
- All TD agents still lose to alpha-beta at depth 2 and above. A one-ply value agent cannot match a search agent yet.

## Closing the gap: search beats a better learning rule

Two things were tried against that last point. Only one of them worked.

### What did not work: longer training, and TD(λ)

The eval curves say extra episodes are wasted. Against random, self-play reaches
0.96 within 250 games. Against alpha-beta depth 1, learning stops around episode
500 and then only oscillates (seed 1 goes 0.25 → 0.39 → 0.20 → 0.11 → 0.45 with
no trend). `mean_abs_td` is 0.147 at episode 250 and 0.152 at episode 5000, so
the value function never settles. **1,000–2,000 episodes gets everything this
setup gives**; 5,000 buys nothing measurable.

TD(λ=0.7) with linear decay of alpha (0.01 → 0.002) and epsilon (0.1 → 0.02) did
fix the convergence symptom — `mean_abs_td` finally falls, to 0.108 — but it did
**not** make the agents stronger. Scores are inside the noise of plain TD(0),
and TD(0) wins the head-to-head (0.610 for `self-s1` over `lam-s1` at depth 2).
A negative result worth reporting: the learning rule was not the bottleneck.

### What worked: searching over the learned V

`SearchTDAgent` runs negamax with the trained network as the leaf evaluator
instead of picking the best immediate afterstate. Nothing is retrained — the
weights are identical, only move selection changes. Depth 1 reduces exactly to
the greedy agent (verified move-for-move in the test suite), so the depth rows
are directly comparable.

The shipped self-play model, played at each depth, 100 games per pairing
(`npm run rl:search`, scores are (wins + ½ draws)/games with standard errors):

| search depth | vs random | vs AB d1 | vs AB d2 | vs AB d3 | sec/game |
|---|---|---|---|---|---|
| 1 (greedy) | 0.990 ±0.010 | 0.250 ±0.043 | 0.050 ±0.022 | 0.020 ±0.014 | 0.02–0.06 |
| 2 | 1.000 ±0.000 | 0.475 ±0.050 | 0.210 ±0.041 | 0.055 ±0.023 | 0.2–1.4 |
| **3** | 1.000 ±0.000 | **0.860** ±0.035 | **0.545** ±0.050 | **0.245** ±0.043 | 12–38 |

Depth 2 roughly doubles the score against alpha-beta depth 1 and quadruples it
against depth 2. Depth 3 is the real jump: **it beats alpha-beta depth 2
outright** (0.545 > 0.5) and takes 0.245 off depth 3, up from 0.020 greedy.
Every step is many standard errors clear of the one below it.

Cross-checked on two seeds of separately trained weights at depth 2
(`results/summary/search_vs_greedy.csv`), which agrees: TD(0) self-play goes
from 0.268 to 0.558 against depth 1 and 0.045 to 0.255 against depth 2.

**Conclusion: the gap was a search problem, not a learning problem.** The learned
value function was good enough all along; selecting greedily from one ply threw
most of its value away. No weights were retrained to produce any row above.

The cost is real — depth 3 is roughly 500x the time per move of greedy — so the
browser arena uses depth 2 by default (`ARENA_SEARCH_DEPTH` in `Game.tsx`).

### Arena bug found along the way

`Algorithm.MINIMAX` is the string `"Alpha-Beta"`, but `Game.tsx` compared
`this.name` against `"AlphaBeta"` and `"Minimax"`. Neither ever matched, so
choosing the alpha-beta agent in the web arena fell through to `getRandomMove`
and **played randomly**. The headless scripts call the engine directly and were
never affected. Dispatch now compares against the `Algorithm` enum.
`Algorithm.MCTS` still has no implementation; `IMPLEMENTED_ALGORITHMS` lists
what actually works so the UI can avoid offering it.

### Honest caveats

- `best-weights.json` is the max over ~21 evaluation checkpoints of 40–50 games
  each. Taking a maximum over that many noisy measurements selects partly on
  luck, so those scores are optimistic. Use `--final`, or re-evaluate the top
  checkpoints with several hundred games, for a headline number.
- Two seeds is enough to catch a broken run, not enough for a confident
  difference. Use 3–5 and report the spread.
- The original agent's playing strength was never benchmarked, only its
  gradients. So there is no before/after win rate for the fix itself — the
  argument is that an all-dead first layer makes V constant, which makes every
  move a tie, which is random play.

### Remaining ideas

  - train *with* search in the loop (TD-leaf), so V learns to be a good leaf
    evaluator rather than a good one-ply ranker
  - deeper search with better move ordering and a transposition table
  - start with self-play, then mix in alpha-beta opponents
