import { describe, expect, it } from 'vitest';
import { copy } from '../../content/en';
import { DEFAULT_SETTINGS } from '../storage';
import { toTableView } from './table';
import { findState, journey } from './test-states';

const states = journey();
const ui = { paused: false, pauseLabel: null, deadline: 30_000, now: 1_000 };
const viewAt = (revision: number) =>
  toTableView(
    findState(states, (state) => state.revision === revision),
    DEFAULT_SETTINGS,
    ui,
  );

describe('toTableView', () => {
  it('maps the ready table without a deadline or playable cards', () => {
    const view = toTableView(null, DEFAULT_SETTINGS, ui);
    expect(view).toMatchObject({
      phase: 'ready',
      hand: [],
      plays: [],
      roundNumber: 1,
      roundCount: 5,
      trickNumber: 1,
      trickCount: 5,
      completedTricks: 0,
      trump: 'hearts',
      ledSuit: null,
      winnerKey: null,
      advance: null,
      advanceLabel: null,
      status: { tone: 'waiting', title: '', detail: '' },
      deadline: null,
      now: 1_000,
      canPlay: false,
    });
    expect(view.seats).toEqual([
      {
        key: 'south',
        name: 'You',
        isMe: true,
        handCount: 0,
        totalPoints: 0,
        roundPoints: 0,
        dealer: true,
        active: false,
      },
      {
        key: 'west',
        name: 'Ada',
        isMe: false,
        handCount: 0,
        totalPoints: 0,
        roundPoints: 0,
        dealer: false,
        active: false,
      },
      {
        key: 'north',
        name: 'Milo',
        isMe: false,
        handCount: 0,
        totalPoints: 0,
        roundPoints: 0,
        dealer: false,
        active: false,
      },
      {
        key: 'east',
        name: 'Iris',
        isMe: false,
        handCount: 0,
        totalPoints: 0,
        roundPoints: 0,
        dealer: false,
        active: false,
      },
    ]);
    expect(view.settings).toBe(DEFAULT_SETTINGS);
  });

  it('describes waiting, following suit, and leading', () => {
    expect(viewAt(0).status).toEqual({
      tone: 'waiting',
      title: copy.status.waiting('Ada'),
      detail: copy.status.waitingDetail,
    });
    const following = viewAt(3);
    expect(following.status).toEqual({
      tone: 'turn',
      title: copy.table.yourTurn,
      detail: copy.status.follow(copy.suits.spades),
    });
    expect(following.canPlay).toBe(true);
    expect(following.deadline).toBe(30_000);
    expect(following.plays.map((play) => play.order)).toEqual([0, 1, 2]);
    expect(following.hand.find((card) => card.id === 'spades-4')).toEqual({
      id: 'spades-4',
      label: 'Four of spades',
      value: { deck: 'french', suit: 'spades', rank: '4' },
      legal: true,
    });
    expect(viewAt(36).status).toEqual({ tone: 'turn', title: copy.table.yourTurn, detail: copy.status.lead });
    expect(viewAt(36)).toMatchObject({ roundNumber: 2, trickNumber: 3 });
  });

  it('disables play and shows the active pause reason', () => {
    const state = findState(states, (item) => item.revision === 3);
    const view = toTableView(state, DEFAULT_SETTINGS, { ...ui, paused: true, pauseLabel: copy.pause.modal });
    expect(view.status).toEqual({ tone: 'paused', title: copy.status.paused, detail: copy.pause.modal });
    expect(view.canPlay).toBe(false);
    expect(view.hand.every((card) => !card.legal)).toBe(true);
  });

  it.each([
    {
      revision: 4,
      phase: 'trickComplete',
      advance: 'continue',
      label: copy.table.nextTrick,
      title: copy.status.takes('Iris'),
      detail: copy.status.tricksPlayed(1, 5),
    },
    {
      revision: 24,
      phase: 'trickComplete',
      advance: 'continue',
      label: copy.table.roundResults,
      title: copy.status.takes('Iris'),
      detail: copy.status.tricksPlayed(5, 5),
    },
    {
      revision: 25,
      phase: 'roundComplete',
      advance: 'results',
      label: copy.table.roundResults,
      title: copy.status.roundOver(1),
      detail: copy.status.takes('Iris'),
    },
    {
      revision: 35,
      phase: 'trickComplete',
      advance: 'continue',
      label: copy.table.nextTrick,
      title: copy.status.youTake,
      detail: copy.status.tricksPlayed(2, 5),
    },
    {
      revision: 128,
      phase: 'trickComplete',
      advance: 'continue',
      label: copy.table.finalResults,
      title: copy.status.takes('Milo'),
      detail: copy.status.tricksPlayed(5, 5),
    },
    {
      revision: 129,
      phase: 'gameComplete',
      advance: 'results',
      label: copy.table.finalResults,
      title: copy.status.matchOver,
      detail: copy.status.takes('Milo'),
    },
  ])(
    'offers the correct advance at revision $revision ($phase)',
    ({ revision, phase, advance, label, title, detail }) => {
      expect(viewAt(revision)).toMatchObject({
        phase,
        advance,
        advanceLabel: label,
        status: { tone: 'resolved', title, detail },
        canPlay: false,
      });
    },
  );
});
