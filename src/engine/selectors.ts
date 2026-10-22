import { RANKS, ROUND_COUNT, SUITS, TURN_ORDER, nextSeat } from './constants';
import type { Card, GameScoreResult, GameState, PlayerKey, Rank, RoundState, Scores } from './types';

export function rankStrength(rank: Rank): number {
  return RANKS.indexOf(rank) + 2;
}

export function compareLowest(left: Card, right: Card): number {
  return (
    rankStrength(left.rank) - rankStrength(right.rank) ||
    SUITS.indexOf(left.suit) - SUITS.indexOf(right.suit) ||
    (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
  );
}

export function sortHand(cards: readonly Card[]): readonly Card[] {
  return cards.toSorted(
    (left, right) => SUITS.indexOf(left.suit) - SUITS.indexOf(right.suit) || compareLowest(left, right),
  );
}

export function currentPlayer(state: GameState): PlayerKey | null {
  return state.phase === 'playing'
    ? nextSeat(state.round.currentTrick.leader, state.round.currentTrick.plays.length)
    : null;
}

export function roundScores(round: RoundState): Scores {
  const scores = { south: 0, west: 0, north: 0, east: 0 };
  for (const trick of round.completedTricks) {
    if (trick.winner !== null) scores[trick.winner] += 1;
  }
  return scores;
}

export function scoreGame(state: GameState): GameScoreResult {
  const totals = { south: 0, west: 0, north: 0, east: 0 };
  for (const round of [...state.completedRounds, state.round]) {
    const scores = roundScores(round);
    for (const seat of TURN_ORDER) totals[seat] += scores[seat];
  }
  const highest = Math.max(...Object.values(totals));
  const winners = TURN_ORDER.filter((seat) => totals[seat] === highest);
  return {
    totals,
    winners,
    final: state.phase === 'gameComplete',
    outcome: winners.length > 1 ? 'draw' : winners[0] === 'south' ? 'won' : 'lost',
  };
}

export function roundOutcomes(state: GameState): readonly ('won' | 'lost' | 'pending')[] {
  const finished = [
    ...state.completedRounds,
    ...(state.phase === 'roundComplete' || state.phase === 'gameComplete' ? [state.round] : []),
  ];
  return Array.from({ length: ROUND_COUNT }, (_, index) => {
    const round = finished.find((item) => item.number === index + 1);
    if (!round) return 'pending';
    const scores = roundScores(round);
    return scores.south === Math.max(...Object.values(scores)) ? 'won' : 'lost';
  });
}
