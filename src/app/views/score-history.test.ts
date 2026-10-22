import { describe, expect, it } from 'vitest';
import { copy } from '../../content/en';
import { gameReducer } from '../../engine';
import { toScoreHistoryView } from './score-history';
import { toScoreTable } from './score-table';
import { findState, journey } from './test-states';

const states = journey();

describe('toScoreHistoryView', () => {
  it('starts with five pending round leads and no events', () => {
    const view = toScoreHistoryView(null);
    expect(view.events).toEqual([]);
    expect(view.roundLeads).toEqual(
      Array.from({ length: 5 }, (_, index) => ({
        key: `round-${index + 1}`,
        label: copy.table.round(index + 1),
        outcome: 'pending',
      })),
    );
  });

  it('maps round-start, card-played and trick-won with stable ids, times, and actors', () => {
    const state = findState(states, (item) => item.revision === 4);
    const table = toScoreTable(state);
    const view = toScoreHistoryView(state, table);
    expect(view.table).toBe(table);
    expect(view.events).toEqual([
      {
        id: 'views-1:0:0',
        at: 0,
        title: copy.timeline.roundStart(1, 'Hearts'),
        detail: `${copy.table.dealer}: You`,
      },
      {
        id: 'views-1:1:0',
        at: 1,
        actor: 'Ada',
        title: copy.timeline.played('Ada', 'Three of spades'),
        detail: undefined,
      },
      {
        id: 'views-1:2:0',
        at: 2,
        actor: 'Milo',
        title: copy.timeline.played('Milo', 'Seven of spades'),
        detail: undefined,
      },
      {
        id: 'views-1:3:0',
        at: 3,
        actor: 'Iris',
        title: copy.timeline.played('Iris', 'King of spades'),
        detail: undefined,
      },
      {
        id: 'views-1:4:0',
        at: 4,
        actor: 'You',
        title: copy.timeline.played('You', 'Four of spades'),
        detail: copy.timeline.autoPlayed,
      },
      {
        id: 'views-1:4:1',
        at: 4,
        actor: 'Iris',
        title: copy.status.takes('Iris'),
        detail: copy.table.trickOf(1, 5),
      },
    ]);
  });

  it('does not mark a manually played human card as automatic', () => {
    const state = findState(states, (item) => item.revision === 3);
    const result = gameReducer(state, {
      type: 'PLAY_CARD',
      gameId: state.id,
      expectedRevision: 3,
      playerKey: 'south',
      cardId: 'spades-4',
      at: 4,
      automatic: false,
    });
    if (!result.ok) throw new Error(result.error);
    expect(toScoreHistoryView(result.state).events.find((event) => event.id === 'views-1:4:0')).toEqual({
      id: 'views-1:4:0',
      at: 4,
      actor: 'You',
      title: copy.timeline.played('You', 'Four of spades'),
      detail: undefined,
    });
  });

  it('maps round-end scores and completed round leads', () => {
    const state = findState(states, (item) => item.revision === 25);
    const view = toScoreHistoryView(state);
    expect(view.events.at(-1)).toEqual({
      id: 'views-1:25:0',
      at: 25,
      title: copy.timeline.roundEnd(1),
      detail: 'You 0 · Ada 1 · Milo 0 · Iris 4',
    });
    expect(view.roundLeads.map((round) => round.outcome)).toEqual([
      'lost',
      'pending',
      'pending',
      'pending',
      'pending',
    ]);
    const joint = findState(states, (item) => item.phase === 'roundComplete' && item.round.number === 2);
    expect(toScoreHistoryView(joint).roundLeads.map((round) => round.outcome)).toEqual([
      'lost',
      'won',
      'pending',
      'pending',
      'pending',
    ]);
  });

  it('maps game-end winners and all five round leads', () => {
    const state = findState(states, (item) => item.phase === 'gameComplete');
    const view = toScoreHistoryView(state);
    expect(view.events.at(-1)).toEqual({
      id: 'views-1:129:1',
      at: 129,
      title: copy.results.finalEyebrow,
      detail: 'Iris',
    });
    expect(view.roundLeads.map((round) => round.outcome)).toEqual(['lost', 'won', 'won', 'won', 'lost']);
  });
});
