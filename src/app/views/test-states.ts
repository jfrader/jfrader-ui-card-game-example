import { createGame, currentPlayer, gameReducer, lowestLegalCard } from '../../engine';
import type { GameAction, GameState } from '../../engine/types';

export function step(state: GameState): GameState {
  const common = { gameId: state.id, expectedRevision: state.revision, at: state.revision + 1 };
  let action: GameAction;
  if (state.phase === 'playing') {
    const playerKey = currentPlayer(state);
    if (!playerKey) throw new Error('Expected an active player');
    const card = lowestLegalCard(state, playerKey);
    if (!card) throw new Error('Expected a legal card');
    action = { ...common, type: 'PLAY_CARD', playerKey, cardId: card.id, automatic: true };
  } else if (state.phase === 'trickComplete') {
    action = { ...common, type: 'CONTINUE_TRICK' };
  } else {
    action = { ...common, type: 'ADVANCE_ROUND' };
  }
  const result = gameReducer(state, action);
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

export function journey(seed = 1): readonly GameState[] {
  let state = createGame({ id: `views-${seed}`, seed, at: 0 });
  const states = [state];
  while (state.phase !== 'gameComplete') {
    state = step(state);
    states.push(state);
  }
  return states;
}

export function findState(states: readonly GameState[], predicate: (state: GameState) => boolean): GameState {
  const state = states.find(predicate);
  if (!state) throw new Error('Expected a matching engine state');
  return state;
}
