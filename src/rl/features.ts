import { GameState, Player, other, PIECES_PER_PLAYER } from "./engine";

export const FEATURE_SIZE = 54;

/**
 * Encodes a position from the point of view of player `me`.
 *
 * Using "my pieces / opponent pieces" instead of "white / black" means one
 * network can play either colour, which is what makes self-play work.
 * Every feature is scaled to [0, 1] so a plain SGD step can't blow up.
 *
 *   [0..23]  my cows
 *   [24..47] opponent cows
 *   48 my cows in hand / 12      49 opponent cows in hand / 12
 *   50 my cows on board / 12     51 opponent cows on board / 12
 *   52 1 if it is my turn        53 1 if I am flying (3 cows, none in hand)
 */
export function encode(s: GameState, me: Player, out?: Float32Array, offset = 0): Float32Array {
    const x = out ?? new Float32Array(FEATURE_SIZE);
    const mine = me + 1;
    const theirs = other(me) + 1;
    const opp = other(me);
    for (let i = 0; i < 24; i++) {
        const c = s.board[i];
        x[offset + i] = c === mine ? 1 : 0;
        x[offset + 24 + i] = c === theirs ? 1 : 0;
    }
    x[offset + 48] = s.inHand[me] / PIECES_PER_PLAYER;
    x[offset + 49] = s.inHand[opp] / PIECES_PER_PLAYER;
    x[offset + 50] = s.onBoard[me] / PIECES_PER_PLAYER;
    x[offset + 51] = s.onBoard[opp] / PIECES_PER_PLAYER;
    x[offset + 52] = s.toMove === me ? 1 : 0;
    x[offset + 53] = s.inHand[me] === 0 && s.onBoard[me] === 3 ? 1 : 0;
    return x;
}
