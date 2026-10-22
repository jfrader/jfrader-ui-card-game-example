import { copy } from '../../content/en';
import { ROUND_COUNT, TRICKS_PER_ROUND } from '../../engine';
import type { GameState, PlayerKey } from '../../engine/types';
import type { TableStatus, TableView } from '../../contracts';
import { playerName, trickWinnerText } from './text';

export interface TableUiState {
  readonly paused: boolean;
  readonly pauseLabel: string | null;
  readonly deadline: number | null;
  readonly now: number;
}

export function tableStatus(
  state: GameState,
  ui: TableUiState,
  active: PlayerKey | null,
  winner: PlayerKey | null,
): TableStatus {
  const ledSuit = state.round.currentTrick.plays[0]?.card.suit ?? null;
  switch (state.phase) {
    case 'playing':
      if (ui.paused) return { tone: 'paused', title: copy.status.paused, detail: ui.pauseLabel ?? '' };
      if (active === 'south') {
        return {
          tone: 'turn',
          title: copy.table.yourTurn,
          detail: ledSuit ? copy.status.follow(copy.suits[ledSuit]) : copy.status.lead,
        };
      }
      return {
        tone: 'waiting',
        title: copy.status.waiting(active ? playerName(state, active) : ''),
        detail: copy.status.waitingDetail,
      };
    case 'trickComplete':
      return {
        tone: 'resolved',
        title: trickWinnerText(state, winner),
        detail: copy.status.tricksPlayed(state.round.completedTricks.length, TRICKS_PER_ROUND),
      };
    case 'roundComplete':
      return {
        tone: 'resolved',
        title: copy.status.roundOver(state.round.number),
        detail: trickWinnerText(state, winner),
      };
    case 'gameComplete':
      return { tone: 'resolved', title: copy.status.matchOver, detail: trickWinnerText(state, winner) };
  }
}

export function advanceFor(state: GameState): Pick<TableView, 'advance' | 'advanceLabel'> {
  const finalRound = state.round.number >= ROUND_COUNT;
  const resultsLabel = finalRound ? copy.table.finalResults : copy.table.roundResults;
  switch (state.phase) {
    case 'trickComplete':
      return {
        advance: 'continue',
        advanceLabel:
          state.round.completedTricks.length < TRICKS_PER_ROUND ? copy.table.nextTrick : resultsLabel,
      };
    case 'roundComplete':
    case 'gameComplete':
      return { advance: 'results', advanceLabel: resultsLabel };
    case 'playing':
      return { advance: null, advanceLabel: null };
  }
}
