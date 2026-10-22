import { describe, expect, it } from 'vitest';
import { chooseAiCard, createGame, lowestLegalCard } from './index';
import type { Card, GameState, Rank, Suit, TrickPlay } from './types';

function card(suit: Suit, rank: Rank): Card {
  return { suit, rank, id: `${suit}-${rank}` };
}
function position(
  hand: readonly Card[],
  plays: readonly TrickPlay[] = [],
  trump: Suit | null = 'hearts',
): GameState {
  const state = createGame({ id: 'ai', seed: 123, at: 0 });
  return {
    ...state,
    round: {
      ...state.round,
      trump,
      hands: { ...state.round.hands, west: hand },
      currentTrick: { number: 1, leader: plays.length ? 'south' : 'west', plays, winner: null },
    },
  };
}
const lead = (suit: Suit, rank: Rank): TrickPlay => ({ playerKey: 'south', card: card(suit, rank) });

describe('AI', () => {
  it('repeats easy choices and returns null out of turn or during review', () => {
    const state = createGame({ id: 'ai', seed: 123, at: 0 });
    expect(chooseAiCard(state, 'west', 'easy')).toEqual(chooseAiCard(state, 'west', 'easy'));
    expect(chooseAiCard(state, 'south', 'easy')).toBeNull();
    expect(chooseAiCard({ ...state, phase: 'trickComplete' }, 'west', 'hard')).toBeNull();
    expect(lowestLegalCard(state, 'south')).toBeNull();
  });

  it('uses rank-first lowest order with canonical suit tie breaks for normal and timers', () => {
    const state = position([card('hearts', 'A'), card('spades', '2'), card('clubs', '2')]);
    expect(chooseAiCard(state, 'west', 'normal')).toEqual(card('clubs', '2'));
    expect(lowestLegalCard(state, 'west')).toEqual(card('clubs', '2'));
  });

  it('leads the lowest non-trump or the lowest when all are trump', () => {
    expect(
      chooseAiCard(position([card('hearts', '2'), card('clubs', 'K'), card('spades', '3')]), 'west', 'hard'),
    ).toEqual(card('spades', '3'));
    expect(chooseAiCard(position([card('hearts', 'A'), card('hearts', '3')]), 'west', 'hard')).toEqual(
      card('hearts', '3'),
    );
  });

  it('plays the cheapest current winner while following suit', () => {
    const state = position(
      [card('clubs', '2'), card('clubs', 'J'), card('clubs', 'A'), card('hearts', '2')],
      [lead('clubs', '10')],
    );
    expect(chooseAiCard(state, 'west', 'hard')).toEqual(card('clubs', 'J'));
  });

  it('prefers a winning non-trump, otherwise the lowest winning trump', () => {
    expect(
      chooseAiCard(
        position([card('clubs', 'J'), card('hearts', '2')], [lead('clubs', '10')]),
        'west',
        'hard',
      ),
    ).toEqual(card('clubs', 'J'));
    expect(
      chooseAiCard(
        position([card('spades', '2'), card('hearts', 'K'), card('hearts', '3')], [lead('clubs', 'A')]),
        'west',
        'hard',
      ),
    ).toEqual(card('hearts', '3'));
  });

  it('dumps the lowest losing non-trump but follows a trump lead even when losing', () => {
    const state = position([card('hearts', '2'), card('spades', '3')], [lead('hearts', 'A')]);
    expect(chooseAiCard(state, 'west', 'hard')).toEqual(card('hearts', '2'));
    const losing = position(
      [card('hearts', '2'), card('spades', '3')],
      [lead('clubs', 'A'), { playerKey: 'west', card: card('hearts', 'A') }],
    );
    const north: GameState = {
      ...losing,
      round: { ...losing.round, hands: { ...losing.round.hands, north: losing.round.hands.west } },
    };
    expect(chooseAiCard(north, 'north', 'hard')).toEqual(card('spades', '3'));
  });

  it('does not inspect opponents, future decks, or undealt cards', () => {
    const state = position([card('clubs', 'J'), card('hearts', '2')], [lead('clubs', '10')]);
    const hidden: GameState = {
      ...state,
      decks: [],
      round: {
        ...state.round,
        undealt: [],
        hands: {
          ...state.round.hands,
          south: [],
          north: [],
          east: [],
        },
      },
    };
    expect(chooseAiCard(hidden, 'west', 'hard')).toEqual(chooseAiCard(state, 'west', 'hard'));
  });
});
