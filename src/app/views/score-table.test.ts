import { describe, expect, it } from 'vitest';
import { toScoreTable } from './score-table';
import { findState, journey } from './test-states';

describe('toScoreTable', () => {
  it('has empty upcoming rounds before a game starts', () => {
    const table = toScoreTable(null);
    expect(table.players.map(({ total, leader }) => ({ total, leader }))).toEqual(
      Array.from({ length: 4 }, () => ({ total: 0, leader: false })),
    );
    expect(table.rounds).toEqual([
      { number: 1, state: 'upcoming', trump: 'hearts', scores: {} },
      { number: 2, state: 'upcoming', trump: 'diamonds', scores: {} },
      { number: 3, state: 'upcoming', trump: 'clubs', scores: {} },
      { number: 4, state: 'upcoming', trump: 'spades', scores: {} },
      { number: 5, state: 'upcoming', trump: null, scores: {} },
    ]);
  });

  it('distinguishes done, current, and upcoming rounds without double-counting points', () => {
    const states = journey();
    const complete = findState(states, (state) => state.revision === 25);
    expect(toScoreTable(complete).rounds[0]?.state).toBe('done');
    const next = findState(states, (state) => state.revision === 26);
    const table = toScoreTable(next);
    expect(table.rounds).toEqual([
      { number: 1, state: 'done', trump: 'hearts', scores: { south: 0, west: 1, north: 0, east: 4 } },
      { number: 2, state: 'current', trump: 'diamonds', scores: { south: 0, west: 0, north: 0, east: 0 } },
      { number: 3, state: 'upcoming', trump: 'clubs', scores: {} },
      { number: 4, state: 'upcoming', trump: 'spades', scores: {} },
      { number: 5, state: 'upcoming', trump: null, scores: {} },
    ]);
    expect(table.players.map(({ key, total, leader }) => ({ key, total, leader }))).toEqual([
      { key: 'south', total: 0, leader: false },
      { key: 'west', total: 1, leader: false },
      { key: 'north', total: 0, leader: false },
      { key: 'east', total: 4, leader: true },
    ]);
  });

  it('marks every tied leader and finishes every round in the final table', () => {
    const final = findState(journey(12), (state) => state.phase === 'gameComplete');
    const table = toScoreTable(final);
    expect(table.players.map(({ key, total, leader }) => ({ key, total, leader }))).toEqual([
      { key: 'south', total: 8, leader: true },
      { key: 'west', total: 5, leader: false },
      { key: 'north', total: 8, leader: true },
      { key: 'east', total: 4, leader: false },
    ]);
    expect(table.rounds.map((round) => round.state)).toEqual(['done', 'done', 'done', 'done', 'done']);
  });
});
