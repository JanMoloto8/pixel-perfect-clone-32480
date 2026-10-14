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
  - If nothing has been trained in the browser yet, it loads `public/models/td-agent.json`, a model trained by self-play.

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
- Ideas to close that gap:
  - add a 1–2 ply lookahead on top of V
  - train for longer
  - use TD(λ)
  - start with self-play, then mix in alpha-beta opponents
