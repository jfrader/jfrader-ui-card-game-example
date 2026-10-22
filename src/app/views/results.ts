import { ROUND_COUNT, roundScores, scoreGame, TRUMPS } from '../../engine';
import type { GameState, Stats } from '../../engine/types';
import type { ResultsView, ScoreTableView } from '../../contracts';
import { toScoreTable } from './score-table';
import { playerName } from './text';

export function toResultsView(
  state: GameState | null,
  stats: Stats,
  table: ScoreTableView = toScoreTable(state),
): ResultsView | null {
  if (!state) return null;
  if (state.phase === 'roundComplete') {
    const scores = roundScores(state.round);
    const top = Math.max(...Object.values(scores));
    const leaders = Object.values(scores).filter((value) => value === top).length;
    let lead: 'sole' | 'joint' | 'behind' = 'sole';
    if (scores.south < top) lead = 'behind';
    else if (leaders > 1) lead = 'joint';
    return {
      kind: 'round',
      roundNumber: state.round.number,
      roundCount: ROUND_COUNT,
      yourTricks: scores.south,
      lead,
      table,
      nextTrump: TRUMPS[state.round.number] ?? null,
    };
  }
  if (state.phase === 'gameComplete') {
    const score = scoreGame(state);
    return {
      kind: 'game',
      outcome: score.outcome,
      winnerNames: score.winners.map((key) => playerName(state, key)),
      yourPoints: score.totals.south,
      table,
      stats,
    };
  }
  return null;
}
