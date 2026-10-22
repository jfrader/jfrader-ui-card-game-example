import { describe, expect, it } from 'vitest';
import { canonicalDeck } from './deck';
import { createGame } from './index';

const options = { id: 'test', seed: 123, at: 100 };

describe('decks', () => {
  it('contains 52 canonical unique cards and copies supplied arrays and cards', () => {
    const decks = Array.from({ length: 5 }, canonicalDeck);
    const state = createGame({ ...options, decks });
    expect(new Set(decks[0]!.map((card) => card.id)).size).toBe(52);
    expect(state.decks).toEqual(decks);
    expect(state.decks[0]).not.toBe(decks[0]);
    expect(state.decks[0]![0]).not.toBe(decks[0]![0]);
  });

  it('locks the seed 123 shuffle and round-one deal', () => {
    const state = createGame(options);
    expect(state.decks[0]!.slice(0, 20).map((card) => card.id)).toEqual([
      'spades-K',
      'hearts-7',
      'diamonds-4',
      'clubs-A',
      'clubs-7',
      'hearts-Q',
      'clubs-Q',
      'spades-7',
      'clubs-6',
      'clubs-4',
      'spades-J',
      'spades-5',
      'diamonds-Q',
      'diamonds-8',
      'hearts-4',
      'hearts-10',
      'clubs-J',
      'spades-Q',
      'clubs-9',
      'hearts-A',
    ]);
    expect(state.round.hands.west.map((card) => card.id)).toEqual([
      'spades-K',
      'clubs-7',
      'clubs-6',
      'diamonds-Q',
      'clubs-J',
    ]);
    expect(Object.values(state.round.hands).map((hand) => hand.length)).toEqual([5, 5, 5, 5]);
    expect(state.round.undealt).toHaveLength(32);
    expect(state.round.dealer).toBe('south');
    expect(state.round.currentTrick.leader).toBe('west');
  });

  it('repeats every shuffle deterministically and changes only log times with at', () => {
    expect(createGame(options)).toEqual(createGame(options));
    const later = createGame({ ...options, at: 999 });
    expect({ ...later, log: later.log.map((event) => ({ ...event, at: 100 })) }).toEqual(createGame(options));
    expect(new Set(createGame(options).decks.map((deck) => deck.map((card) => card.id).join())).size).toBe(5);
  });

  it('rejects duplicate, missing, inconsistent, invalid and incorrectly sized decks', () => {
    const deck = canonicalDeck();
    const sparse = [...deck];
    delete sparse[0];
    const badDecks = [
      deck.slice(1),
      [...deck, deck[0]!],
      [deck[0]!, ...deck.slice(0, 51)],
      sparse,
      [{ ...deck[0]!, id: 'bad' }, ...deck.slice(1)],
      [{ ...deck[0]!, suit: 'invalid' }, ...deck.slice(1)],
    ];
    for (const bad of badDecks) {
      expect(() =>
        createGame({ ...options, decks: [bad, deck, deck, deck, deck] as (typeof deck)[] }),
      ).toThrow(RangeError);
    }
    expect(() => createGame({ ...options, decks: [deck] })).toThrow(RangeError);
  });

  it('validates IDs, unsigned seeds and supplied timestamps before starting', () => {
    for (const seed of [-1, 2 ** 32, 0.5, NaN, Infinity])
      expect(() => createGame({ ...options, seed })).toThrow(RangeError);
    for (const id of ['', '  ']) expect(() => createGame({ ...options, id })).toThrow(RangeError);
    expect(() => createGame({ ...options, at: NaN })).toThrow(RangeError);
    expect(() => createGame({ ...options, seed: 0 })).not.toThrow();
    expect(() => createGame({ ...options, seed: 0xffff_ffff })).not.toThrow();
  });
});
