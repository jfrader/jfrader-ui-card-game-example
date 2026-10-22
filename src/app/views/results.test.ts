import { describe, expect, it } from 'vitest';
import { DEFAULT_STATS } from '../storage';
import { toResultsView } from './results';
import { toScoreTable } from './score-table';
import { findState, journey } from './test-states';

describe('toResultsView', () => {
  it('has no results before a round is complete', () => {
    expect(toResultsView(null, DEFAULT_STATS)).toBeNull();
    const states = journey();
    expect(
      toResultsView(
        findState(states, (state) => state.revision === 0),
        DEFAULT_STATS,
      ),
    ).toBeNull();
    expect(
      toResultsView(
        findState(states, (state) => state.revision === 4),
        DEFAULT_STATS,
      ),
    ).toBeNull();
  });

  it.each([
    { seed: 5, round: 1, tricks: 2, lead: 'sole', nextTrump: 'diamonds' },
    { seed: 1, round: 2, tricks: 2, lead: 'joint', nextTrump: 'clubs' },
    { seed: 1, round: 1, tricks: 0, lead: 'behind', nextTrump: 'diamonds' },
    { seed: 1, round: 4, tricks: 2, lead: 'sole', nextTrump: null },
  ])('maps round $round ($lead, seed $seed)', ({ seed, round, tricks, lead, nextTrump }) => {
    const state = findState(
      journey(seed),
      (item) => item.phase === 'roundComplete' && item.round.number === round,
    );
    const table = toScoreTable(state);
    const view = toResultsView(state, DEFAULT_STATS, table);
    expect(view).toEqual({
      kind: 'round',
      roundNumber: round,
      roundCount: 5,
      yourTricks: tricks,
      lead,
      table,
      nextTrump,
    });
    expect(view?.table).toBe(table);
  });

  it.each([
    { seed: 1, outcome: 'lost', points: 6, winners: ['Iris'] },
    { seed: 4, outcome: 'won', points: 8, winners: ['You'] },
    { seed: 12, outcome: 'draw', points: 8, winners: ['You', 'Milo'] },
    { seed: 45, outcome: 'draw', points: 3, winners: ['Ada', 'Milo'] },
  ])('maps the final $outcome outcome (seed $seed)', ({ seed, outcome, points, winners }) => {
    const state = findState(journey(seed), (item) => item.phase === 'gameComplete');
    const stats = { gamesPlayed: 3, gamesWon: 1, lastCountedGameId: state.id };
    const table = toScoreTable(state);
    const view = toResultsView(state, stats, table);
    expect(view).toEqual({ kind: 'game', outcome, winnerNames: winners, yourPoints: points, table, stats });
    expect(view?.table).toBe(table);
    expect(state.round.number).toBe(5);
    expect(state.round.trump).toBeNull();
    expect(view).not.toHaveProperty('nextTrump');
  });
});
