import { describe, expect, it } from 'vitest';
import {
  TURN_ORDER, TRUMPS, advanceRound, chooseAiCard, createGame, currentPlayer, gameReducer,
  legalMoves, lowestLegalCard, playCard, roundOutcomes, roundScores, scoreGame, sortHand,
} from './index';
import { canonicalDeck } from './deck';
import type { Difficulty, GameAction, GameState, PlayerKey, RoundState, Transition, Trick } from './types';

function accept(result: Transition): GameState {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function action(state: GameState): GameAction {
  const base = { gameId: state.id, expectedRevision: state.revision, at: state.revision + 1 };
  if (state.phase === 'playing') {
    const playerKey = currentPlayer(state)!;
    return { ...base, type: 'PLAY_CARD', playerKey, cardId: lowestLegalCard(state, playerKey)!.id, automatic: true };
  }
  return { ...base, type: state.phase === 'trickComplete' ? 'CONTINUE_TRICK' : 'ADVANCE_ROUND' };
}

function until(state: GameState, phase: GameState['phase']): GameState {
  while (state.phase !== phase) state = accept(gameReducer(state, action(state)));
  return state;
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) freeze(nested);
  }
  return value;
}

function invariant(state: GameState): void {
  for (const round of [...state.completedRounds, state.round]) {
    const cards = [...Object.values(round.hands).flat(), ...round.undealt,
      ...round.completedTricks.flatMap((trick) => trick.plays.map((play) => play.card)),
      ...(round.currentTrick.winner === null ? round.currentTrick.plays.map((play) => play.card) : [])];
    expect(cards).toHaveLength(52);
    expect(new Set(cards.map((card) => card.id)).size).toBe(52);
    expect(new Set(round.completedTricks.map((trick) => trick.number)).size).toBe(round.completedTricks.length);
    expect(Object.values(roundScores(round)).reduce((sum, score) => sum + score, 0)).toBe(round.completedTricks.length);
  }
  expect(Object.values(scoreGame(state).totals).reduce((sum, score) => sum + score, 0)).toBe(
    [...state.completedRounds, state.round].reduce((sum, round) => sum + round.completedTricks.length, 0));
  expect(new Set(state.log.map((event) => event.id)).size).toBe(state.log.length);
}

function scoredRound(base: RoundState, winners: readonly PlayerKey[], number = 1): RoundState {
  const completedTricks: Trick[] = winners.map((winner, index) => ({ number: index + 1, leader: winner, plays: [], winner }));
  return { ...base, number, completedTricks };
}

describe('transitions', () => {
  it('follows the actual leader cyclically and resolves the fourth play atomically', () => {
    let state = createGame({ id: 'sequence', seed: 4, at: 0 });
    for (const expected of ['west', 'north', 'east', 'south']) {
      expect(currentPlayer(state)).toBe(expected);
      const previous = state;
      const request = action(state);
      state = accept(gameReducer(state, request));
      expect(state.revision).toBe(previous.revision + 1);
      if (request.type === 'PLAY_CARD') expect(state.round.hands[request.playerKey]).toHaveLength(4);
    }
    expect(state.phase).toBe('trickComplete');
    expect(state.round.currentTrick.plays).toHaveLength(4);
    expect(state.round.completedTricks).toEqual([state.round.currentTrick]);
    expect(Object.values(roundScores(state.round)).reduce((a, b) => a + b, 0)).toBe(1);
    expect(currentPlayer(state)).toBeNull();
    const winner = state.round.currentTrick.winner;
    const next = accept(gameReducer(state, action(state)));
    expect(currentPlayer(next)).toBe(winner);
    expect(next.round.currentTrick.plays).toEqual([]);
    expect(next.round.currentTrick.number).toBe(2);
  });

  it('rejects wrong actors, unknown cards, failure to follow suit and duplicate requests unchanged', () => {
    const decks = Array.from({ length: 5 }, canonicalDeck);
    let state = createGame({ id: 'invalid', seed: 1, at: 0, decks });
    const first = action(state);
    if (first.type !== 'PLAY_CARD') throw new Error('Expected play');
    expect(playCard(state, { ...first, playerKey: 'south' })).toEqual({ ok: false, state, error: 'wrong-player' });
    expect(playCard(state, { ...first, cardId: 'absent' })).toEqual({ ok: false, state, error: 'unknown-card' });
    state = accept(playCard(state, first));
    const request = action(state);
    if (request.type !== 'PLAY_CARD') throw new Error('Expected play');
    const offSuit = state.round.hands[request.playerKey].find((card) => card.suit !== 'hearts')!;
    expect(playCard(state, { ...request, cardId: offSuit.id })).toEqual({ ok: false, state, error: 'must-follow-suit' });
    const repeated = playCard(state, first);
    expect(repeated).toEqual({ ok: false, state, error: 'stale-action' });
    expect(repeated.state).toBe(state);
    expect(playCard(state, { ...request, gameId: 'previous-game' })).toEqual({ ok: false, state, error: 'stale-action' });
  });

  it('checks revision before phase, and gates continue/advance/play by phase', () => {
    let state = createGame({ id: 'gates', seed: 7, at: 0 });
    const base = { gameId: state.id, expectedRevision: state.revision, at: 0 };
    expect(gameReducer(state, { ...base, type: 'CONTINUE_TRICK' })).toEqual({ ok: false, state, error: 'wrong-phase' });
    expect(advanceRound(state, { ...base, type: 'ADVANCE_ROUND' })).toEqual({ ok: false, state, error: 'wrong-phase' });
    state = until(state, 'trickComplete');
    expect(gameReducer(state, { ...base, type: 'CONTINUE_TRICK' })).toEqual({ ok: false, state, error: 'stale-action' });
    expect(playCard(state, { ...base, expectedRevision: state.revision, type: 'PLAY_CARD', playerKey: 'south', cardId: '', automatic: false })).toEqual({ ok: false, state, error: 'wrong-phase' });
    const request = action(state);
    state = accept(gameReducer(state, request));
    expect(gameReducer(state, request)).toEqual({ ok: false, state, error: 'stale-action' });
  });

  it('keeps fifth-trick review visible before round results, archives only on deal', () => {
    let state = createGame({ id: 'round', seed: 7, at: 0 });
    while (state.round.completedTricks.length < 5) state = accept(gameReducer(state, action(state)));
    expect(state.phase).toBe('trickComplete');
    expect(roundOutcomes(state)).toEqual(Array(5).fill('pending'));
    state = accept(gameReducer(state, action(state)));
    expect(state.phase).toBe('roundComplete');
    expect(state.round.currentTrick.plays).toHaveLength(4);
    expect(state.completedRounds).toHaveLength(0);
    const totals = scoreGame(state).totals;
    const request = action(state);
    state = accept(gameReducer(state, request));
    expect(state.completedRounds).toHaveLength(1);
    expect(state.round.number).toBe(2);
    expect(Object.values(state.round.hands).map((hand) => hand.length)).toEqual([5, 5, 5, 5]);
    expect(Object.values(roundScores(state.round))).toEqual([0, 0, 0, 0]);
    expect(scoreGame(state).totals).toEqual(totals);
    expect(gameReducer(state, request)).toEqual({ ok: false, state, error: 'stale-action' });
  });

  it('rotates all dealers, first leaders and trumps and ends at 25 points with no sixth round', () => {
    let state = createGame({ id: 'full', seed: 123, at: 0 });
    for (let index = 0; index < 5; index += 1) {
      expect(state.round.dealer).toBe(TURN_ORDER[index % 4]);
      expect(currentPlayer(state)).toBe(TURN_ORDER[(index + 1) % 4]);
      expect(state.round.trump).toBe(TRUMPS[index]);
      state = until(state, index === 4 ? 'gameComplete' : 'roundComplete');
      if (index < 4) state = accept(gameReducer(state, action(state)));
    }
    expect(scoreGame(state).final).toBe(true);
    expect(Object.values(scoreGame(state).totals).reduce((a, b) => a + b, 0)).toBe(25);
    expect(state.log.filter((event) => event.kind === 'card-played')).toHaveLength(100);
    expect(state.log.filter((event) => event.kind === 'trick-won')).toHaveLength(25);
    expect(state.log.filter((event) => event.kind === 'round-end')).toHaveLength(5);
    expect(state.log.filter((event) => event.kind === 'game-end')).toHaveLength(1);
    expect(gameReducer(state, action(state))).toEqual({ ok: false, state, error: 'wrong-phase' });
  });

  it('distinguishes sole human/AI winners and all top-tie cardinalities, including AI-only ties', () => {
    const base = createGame({ id: 'scores', seed: 1, at: 0 });
    const cases: readonly (readonly PlayerKey[])[] = [
      ['south', 'south', 'west'], ['west', 'west', 'south'], ['south', 'west'],
      ['west', 'north'], ['south', 'west', 'north'], ['south', 'west', 'north', 'east'],
    ];
    const outcomes = ['won', 'lost', 'draw', 'draw', 'draw', 'draw'];
    cases.forEach((winners, index) => {
      const state: GameState = { ...base, phase: 'gameComplete', round: scoredRound(base.round, winners) };
      expect(scoreGame(state).outcome).toBe(outcomes[index]);
      expect(scoreGame(state).winners).toHaveLength(index < 2 ? 1 : winners.length);
    });
  });

  it('marks joint South round leads won, lower scores lost and unfinished/future rounds pending', () => {
    const state = createGame({ id: 'outcomes', seed: 1, at: 0 });
    const tied = scoredRound(state.round, ['south', 'south', 'west', 'west', 'east']);
    expect(roundOutcomes({ ...state, phase: 'roundComplete', round: tied })).toEqual(['won', 'pending', 'pending', 'pending', 'pending']);
    expect(roundOutcomes({ ...state, phase: 'roundComplete', round: scoredRound(state.round, ['west', 'west', 'west', 'south', 'east']) })[0]).toBe('lost');
  });

  it('preserves conservation, legal AI choices and frozen inputs after every action across seeded games', () => {
    const difficulties: readonly Difficulty[] = ['easy', 'normal', 'hard'];
    for (let seed = 0; seed < 12; seed += 1) {
      let state = freeze(createGame({ id: `seed-${seed}`, seed, at: 0 }));
      while (state.phase !== 'gameComplete') {
        invariant(state);
        const before = JSON.stringify(state);
        let request = action(state);
        if (request.type === 'PLAY_CARD') {
          for (const difficulty of difficulties) {
            const card = chooseAiCard(state, request.playerKey, difficulty);
            expect(legalMoves(state, request.playerKey)).toContainEqual(card);
          }
          request = { ...request, cardId: chooseAiCard(state, request.playerKey, difficulties[seed % 3]!)!.id };
          sortHand(state.round.hands[request.playerKey]);
        }
        roundOutcomes(state);
        const next = accept(gameReducer(state, freeze(request)));
        expect(JSON.stringify(state)).toBe(before);
        expect(next.revision).toBe(state.revision + 1);
        state = freeze(next);
      }
      invariant(state);
    }
  }, 20_000);

  it('replays identical actions into deeply equal states and logs', () => {
    let left = createGame({ id: 'repeat', seed: 33, at: 0 });
    let right = createGame({ id: 'repeat', seed: 33, at: 0 });
    while (left.phase !== 'gameComplete') {
      const request = action(left);
      left = accept(gameReducer(left, request));
      right = accept(gameReducer(right, request));
    }
    expect(left).toEqual(right);
  });
});
