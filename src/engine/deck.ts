import { DECK_SIZE, RANKS, ROUND_COUNT, SUITS, TRICKS_PER_ROUND, TRUMPS, TURN_ORDER, nextSeat } from './constants';
import type { Card, CreateGameOptions, PlayerKey, RoundState } from './types';

const UINT32_RANGE = 0x1_0000_0000;

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

export function canonicalDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ id: `${suit}-${rank}`, suit, rank })));
}

export function validCard(card: Card): boolean {
  return card != null && SUITS.includes(card.suit) && RANKS.includes(card.rank)
    && card.id === `${card.suit}-${card.rank}`;
}

export function prepareDecks(options: CreateGameOptions): readonly (readonly Card[])[] {
  if (typeof options.id !== 'string' || options.id.trim().length === 0
    || !Number.isInteger(options.seed) || options.seed < 0 || options.seed >= UINT32_RANGE
    || !Number.isFinite(options.at)) {
    throw new RangeError('Invalid game options');
  }
  if (options.decks !== undefined) {
    if (!Array.isArray(options.decks) || options.decks.length !== ROUND_COUNT || Array.from(options.decks).some((deck) =>
      !Array.isArray(deck) || deck.length !== DECK_SIZE || Array.from(deck).some((card) => !validCard(card))
      || new Set(deck.map((card) => card.id)).size !== DECK_SIZE)) {
      throw new RangeError('Expected five complete canonical decks');
    }
    return options.decks.map((deck: readonly Card[]) => deck.map((card) => ({ ...card })));
  }
  const random = mulberry32(options.seed);
  return Array.from({ length: ROUND_COUNT }, () => {
    const deck = canonicalDeck();
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [deck[index], deck[swap]] = [deck[swap]!, deck[index]!];
    }
    return deck;
  });
}

export function dealRound(deck: readonly Card[], number: number): RoundState {
  const dealer = TURN_ORDER[(number - 1) % TURN_ORDER.length]!;
  const leader = nextSeat(dealer);
  const hands: Record<PlayerKey, Card[]> = { south: [], west: [], north: [], east: [] };
  const dealtCount = TRICKS_PER_ROUND * TURN_ORDER.length;
  for (let index = 0; index < dealtCount; index += 1) {
    hands[nextSeat(leader, index)].push(deck[index]!);
  }
  return {
    number, dealer, trump: TRUMPS[number - 1]!, hands,
    undealt: deck.slice(dealtCount), completedTricks: [],
    currentTrick: { number: 1, leader, plays: [], winner: null },
  };
}
