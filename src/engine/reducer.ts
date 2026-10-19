import { PLAYERS, ROUND_COUNT, TRICKS_PER_ROUND, TURN_ORDER } from './constants';
import { dealRound, prepareDecks } from './deck';
import { legalMoves, resolveTrick } from './rules';
import { currentPlayer, roundScores, scoreGame } from './selectors';
import type { CreateGameOptions, GameAction, GameState, LogEvent, RuleError, Transition } from './types';

type EventDetail = LogEvent extends infer Event ? Event extends LogEvent
  ? Omit<Event, 'id' | 'at' | 'roundNumber'> : never : never;

function appendEvents(state: GameState, revision: number, at: number, details: readonly EventDetail[]): readonly LogEvent[] {
  return [...state.log, ...details.map((detail, ordinal) => ({
    ...detail, id: `${state.id}:${revision}:${ordinal}`, at, roundNumber: state.round.number,
  }))];
}

function reject(state: GameState, error: RuleError): Transition {
  return { ok: false, state, error };
}

function stale(state: GameState, action: GameAction): boolean {
  return action.gameId !== state.id || action.expectedRevision !== state.revision;
}

export function createGame(options: CreateGameOptions): GameState {
  const decks = prepareDecks(options);
  const round = dealRound(decks[0]!, 1);
  const state: GameState = {
    id: options.id, seed: options.seed, revision: 0, phase: 'playing',
    players: PLAYERS.map((player) => ({ ...player })), decks, completedRounds: [], round, log: [],
  };
  return { ...state, log: appendEvents(state, 0, options.at, [
    { kind: 'round-start', dealer: round.dealer, trump: round.trump },
  ]) };
}

export function playCard(state: GameState, action: Extract<GameAction, { type: 'PLAY_CARD' }>): Transition {
  if (stale(state, action)) return reject(state, 'stale-action');
  if (state.phase !== 'playing') return reject(state, 'wrong-phase');
  if (currentPlayer(state) !== action.playerKey) return reject(state, 'wrong-player');
  const card = state.round.hands[action.playerKey].find((item) => item.id === action.cardId);
  if (!card) return reject(state, 'unknown-card');
  if (!legalMoves(state, action.playerKey).some((item) => item.id === card.id)) return reject(state, 'must-follow-suit');
  const plays = [...state.round.currentTrick.plays, { playerKey: action.playerKey, card }];
  const winner = plays.length === TURN_ORDER.length ? resolveTrick(plays, state.round.trump) : null;
  const currentTrick = { ...state.round.currentTrick, plays, winner };
  const revision = state.revision + 1;
  const events: EventDetail[] = [{ kind: 'card-played', playerKey: action.playerKey, card, automatic: action.automatic }];
  if (winner !== null) events.push({ kind: 'trick-won', playerKey: winner, trickNumber: currentTrick.number });
  return { ok: true, state: {
    ...state, revision, phase: winner === null ? 'playing' : 'trickComplete',
    round: {
      ...state.round, currentTrick,
      hands: { ...state.round.hands, [action.playerKey]: state.round.hands[action.playerKey].filter((item) => item.id !== card.id) },
      completedTricks: winner === null ? state.round.completedTricks : [...state.round.completedTricks, currentTrick],
    },
    log: appendEvents(state, revision, action.at, events),
  } };
}

function continueTrick(state: GameState, action: Extract<GameAction, { type: 'CONTINUE_TRICK' }>): Transition {
  if (stale(state, action)) return reject(state, 'stale-action');
  if (state.phase !== 'trickComplete') return reject(state, 'wrong-phase');
  const revision = state.revision + 1;
  if (state.round.completedTricks.length < TRICKS_PER_ROUND) {
    return { ok: true, state: { ...state, revision, phase: 'playing', round: {
      ...state.round, currentTrick: {
        number: state.round.currentTrick.number + 1, leader: state.round.currentTrick.winner!, plays: [], winner: null,
      },
    } } };
  }
  const final = state.round.number === ROUND_COUNT;
  const events: EventDetail[] = [{ kind: 'round-end', scores: roundScores(state.round) }];
  if (final) {
    const result = scoreGame(state);
    events.push({ kind: 'game-end', winners: result.winners, scores: result.totals });
  }
  return { ok: true, state: { ...state, revision, phase: final ? 'gameComplete' : 'roundComplete',
    log: appendEvents(state, revision, action.at, events) } };
}

export function advanceRound(state: GameState, action: Extract<GameAction, { type: 'ADVANCE_ROUND' }>): Transition {
  if (stale(state, action)) return reject(state, 'stale-action');
  if (state.phase !== 'roundComplete' || state.round.number >= ROUND_COUNT) return reject(state, 'wrong-phase');
  const round = dealRound(state.decks[state.round.number]!, state.round.number + 1);
  const revision = state.revision + 1;
  const next: GameState = { ...state, revision, phase: 'playing', round,
    completedRounds: [...state.completedRounds, state.round] };
  return { ok: true, state: { ...next, log: appendEvents(next, revision, action.at, [
    { kind: 'round-start', dealer: round.dealer, trump: round.trump },
  ]) } };
}

export function gameReducer(state: GameState, action: GameAction): Transition {
  switch (action.type) {
    case 'PLAY_CARD': return playCard(state, action);
    case 'CONTINUE_TRICK': return continueTrick(state, action);
    case 'ADVANCE_ROUND': return advanceRound(state, action);
  }
}
