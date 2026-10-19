import { mulberry32 } from './deck';
import { legalMoves, resolveTrick } from './rules';
import { compareLowest } from './selectors';
import type { Card, Difficulty, GameState, PlayerKey } from './types';

export function lowestLegalCard(state: GameState, playerKey: PlayerKey): Card | null {
  return [...legalMoves(state, playerKey)].sort(compareLowest)[0] ?? null;
}

export function chooseAiCard(state: GameState, playerKey: PlayerKey, difficulty: Difficulty): Card | null {
  const legal = [...legalMoves(state, playerKey)].sort(compareLowest);
  if (legal.length === 0) return null;
  if (difficulty === 'easy') {
    const seed = (state.seed ^ Math.imul(state.revision + 1, 0x9E3779B9)) >>> 0;
    return legal[Math.floor(mulberry32(seed)() * legal.length)]!;
  }
  if (difficulty === 'normal') return legal[0]!;
  const { currentTrick, trump } = state.round;
  const winning = currentTrick.plays.length === 0 ? [] : legal.filter((card) =>
    resolveTrick([...currentTrick.plays, { playerKey, card }], trump) === playerKey);
  const candidates = winning.length > 0 ? winning : legal;
  return candidates.find((card) => card.suit !== trump) ?? candidates[0]!;
}
