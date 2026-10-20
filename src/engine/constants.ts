import type { Difficulty, Player, PlayerKey, Rank, Suit } from './types';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'normal', 'hard'];
export const isDifficulty = (value: unknown): value is Difficulty =>
  (DIFFICULTIES as readonly unknown[]).includes(value);

export const TURN_ORDER: readonly PlayerKey[] = ['south', 'west', 'north', 'east'];
export const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RED_SUITS: readonly Suit[] = SUITS.slice(0, 2);
export const RANKS: readonly Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const TRUMPS: readonly (Suit | null)[] = [...SUITS, null];
export const ROUND_COUNT = 5;
export const TRICKS_PER_ROUND = 5;
export const DECK_SIZE = 52;
export const PLAYERS: readonly Player[] = [
  { key: 'south', name: 'You', isMe: true, kind: 'human' },
  { key: 'west', name: 'Ada', isMe: false, kind: 'ai' },
  { key: 'north', name: 'Milo', isMe: false, kind: 'ai' },
  { key: 'east', name: 'Iris', isMe: false, kind: 'ai' },
];

export function nextSeat(seat: PlayerKey, offset = 1): PlayerKey {
  return TURN_ORDER[(TURN_ORDER.indexOf(seat) + offset) % TURN_ORDER.length]!;
}
