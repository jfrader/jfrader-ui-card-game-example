import { copy, trumpLabel } from '../../content/en';
import { ROUND_COUNT, roundOutcomes, TRICKS_PER_ROUND } from '../../engine';
import type { GameState, LogEvent } from '../../engine/types';
import type { ScoreHistoryView, ScoreTableView } from '../../contracts';
import { toScoreTable } from './score-table';
import { cardLabel, playerName, trickWinnerText } from './text';

function logEvent(state: GameState, event: LogEvent): ScoreHistoryView['events'][number] {
  const identity = { id: event.id, at: event.at };
  switch (event.kind) {
    case 'round-start':
      return {
        ...identity,
        title: copy.timeline.roundStart(event.roundNumber, trumpLabel(event.trump)),
        detail: `${copy.table.dealer}: ${playerName(state, event.dealer)}`,
      };
    case 'card-played':
      return {
        ...identity,
        actor: playerName(state, event.playerKey),
        title: copy.timeline.played(playerName(state, event.playerKey), cardLabel(event.card)),
        detail: event.automatic && event.playerKey === 'south' ? copy.timeline.autoPlayed : undefined,
      };
    case 'trick-won':
      return {
        ...identity,
        actor: playerName(state, event.playerKey),
        title: trickWinnerText(state, event.playerKey),
        detail: copy.table.trickOf(event.trickNumber, TRICKS_PER_ROUND),
      };
    case 'round-end':
      return {
        ...identity,
        title: copy.timeline.roundEnd(event.roundNumber),
        detail: state.players.map((player) => `${player.name} ${event.scores[player.key]}`).join(' · '),
      };
    case 'game-end':
      return {
        ...identity,
        title: copy.results.finalEyebrow,
        detail: event.winners.map((key) => playerName(state, key)).join(' · '),
      };
  }
}

export function toScoreHistoryView(
  state: GameState | null,
  table: ScoreTableView = toScoreTable(state),
): ScoreHistoryView {
  const outcomes = state
    ? roundOutcomes(state)
    : Array.from({ length: ROUND_COUNT }, () => 'pending' as const);
  const roundLeads = outcomes.map((outcome, index) => ({
    key: `round-${index + 1}`,
    label: copy.table.round(index + 1),
    outcome,
  }));
  return { table, roundLeads, events: state ? state.log.map((event) => logEvent(state, event)) : [] };
}
