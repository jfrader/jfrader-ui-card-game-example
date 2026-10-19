import { describe, expect, it } from 'vitest';
import { createGame, legalMoves, rankStrength, resolveTrick, sortHand } from './index';
import type { Card, GameState, PlayerKey, Rank, Suit, TrickPlay } from './types';

function card(suit: Suit, rank: Rank): Card { return { suit, rank, id: `${suit}-${rank}` }; }
function play(playerKey: PlayerKey, suit: Suit, rank: Rank): TrickPlay { return { playerKey, card: card(suit, rank) }; }
function position(hand: readonly Card[], plays: readonly TrickPlay[]): GameState {
  const state = createGame({ id: 'rules', seed: 1, at: 0 });
  return { ...state, round: { ...state.round, hands: { ...state.round.hands, south: hand },
    currentTrick: { number: 1, leader: plays.length ? 'east' : 'south', plays, winner: null } } };
}

describe('rules', () => {
  it('allows all held cards on an empty trick and no moves out of turn or phase', () => {
    const state = position([card('hearts', '2'), card('clubs', 'A')], []);
    expect(legalMoves(state, 'south')).toEqual(state.round.hands.south);
    expect(legalMoves(state, 'west')).toEqual([]);
    expect(legalMoves({ ...state, phase: 'trickComplete' }, 'south')).toEqual([]);
  });

  it('requires following suit even with a winning trump available', () => {
    const state = position([card('hearts', 'A'), card('clubs', '2')], [play('east', 'clubs', 'K')]);
    expect(legalMoves(state, 'south')).toEqual([card('clubs', '2')]);
  });

  it('allows any held card when void in the led suit', () => {
    const state = position([card('hearts', 'A'), card('diamonds', '2')], [play('east', 'clubs', 'K')]);
    expect(legalMoves(state, 'south')).toEqual(state.round.hands.south);
  });

  it('compares only led suit unless trump is played, with ace high', () => {
    const plays = [play('south', 'clubs', 'K'), play('west', 'spades', 'A'), play('north', 'clubs', 'A')];
    expect(resolveTrick(plays, 'hearts')).toBe('north');
    expect(resolveTrick(plays, null)).toBe('north');
    expect(rankStrength('A')).toBeGreaterThan(rankStrength('K'));
    expect(resolveTrick([play('south', 'clubs', '2'), play('west', 'spades', 'A')], null)).toBe('south');
  });

  it('lets the lowest trump beat an ace and the highest trump win', () => {
    const plays = [play('south', 'clubs', 'A'), play('west', 'hearts', '2')];
    expect(resolveTrick(plays, 'hearts')).toBe('west');
    expect(resolveTrick([...plays, play('north', 'hearts', '3')], 'hearts')).toBe('north');
  });

  it('compares partial tricks and rejects invalid lists', () => {
    const first = play('south', 'clubs', '2');
    expect(resolveTrick([first], null)).toBe('south');
    const sparse = [first];
    delete sparse[0];
    const invalid = [[], sparse, [first, first], [first, { ...first, playerKey: 'west' as const }],
      [first, play('south', 'clubs', '3')], [{ ...first, card: { ...first.card, id: 'bad' } }],
      Array.from({ length: 5 }, () => first)];
    for (const plays of invalid) expect(() => resolveTrick(plays, null)).toThrow(RangeError);
  });

  it('sorts display hands by suit then rank without changing deal order', () => {
    const cards = Object.freeze([card('spades', '2'), card('hearts', 'A'), card('hearts', '2')]);
    expect(sortHand(cards)).toEqual([cards[2], cards[1], cards[0]]);
    expect(cards[0]!.suit).toBe('spades');
  });
});
