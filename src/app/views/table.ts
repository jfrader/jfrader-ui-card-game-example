import {
  currentPlayer,
  legalMoves,
  PLAYERS,
  ROUND_COUNT,
  roundScores,
  scoreGame,
  sortHand,
  TRICKS_PER_ROUND,
  TRUMPS,
} from '../../engine';
import type { Card, GameState, PlayerKey, Settings } from '../../engine/types';
import type { CardView, SeatView, TableView } from '../../contracts';
import { cardLabel } from './text';
import { advanceFor, tableStatus, type TableUiState } from './table-status';

function cardView(card: Card, legal: boolean): CardView {
  return {
    id: card.id,
    label: cardLabel(card),
    value: { deck: 'french', suit: card.suit, rank: card.rank },
    legal,
  };
}

function seatViews(state: GameState, active: PlayerKey | null): readonly SeatView[] {
  const totals = scoreGame(state).totals;
  const round = roundScores(state.round);
  return state.players.map((player) => ({
    key: player.key,
    name: player.name,
    isMe: player.isMe,
    handCount: state.round.hands[player.key].length,
    totalPoints: totals[player.key],
    roundPoints: round[player.key],
    dealer: state.round.dealer === player.key,
    active: active === player.key,
  }));
}

function readySeats(): readonly SeatView[] {
  return PLAYERS.map((player) => ({
    key: player.key,
    name: player.name,
    isMe: player.isMe,
    handCount: 0,
    totalPoints: 0,
    roundPoints: 0,
    dealer: player.isMe,
    active: false,
  }));
}

export function toTableView(state: GameState | null, settings: Settings, ui: TableUiState): TableView {
  if (!state) {
    return {
      phase: 'ready',
      seats: readySeats(),
      hand: [],
      plays: [],
      roundNumber: 1,
      roundCount: ROUND_COUNT,
      trickNumber: 1,
      trickCount: TRICKS_PER_ROUND,
      completedTricks: 0,
      trump: TRUMPS[0] ?? null,
      ledSuit: null,
      winnerKey: null,
      status: { tone: 'waiting', title: '', detail: '' },
      advance: null,
      advanceLabel: null,
      paused: ui.paused,
      deadline: null,
      now: ui.now,
      canPlay: false,
      settings,
    };
  }
  const active = state.phase === 'playing' ? currentPlayer(state) : null;
  const canPlay = state.phase === 'playing' && active === 'south' && !ui.paused;
  const legalIds = new Set(canPlay ? legalMoves(state, 'south').map((card) => card.id) : []);
  const hand = settings.autoSortHand ? sortHand(state.round.hands.south) : state.round.hands.south;
  const winner = state.phase === 'playing' ? null : state.round.currentTrick.winner;
  return {
    phase: state.phase,
    seats: seatViews(state, active),
    hand: hand.map((card) => cardView(card, legalIds.has(card.id))),
    plays: state.round.currentTrick.plays.map((play, order) => ({
      playerKey: play.playerKey,
      card: cardView(play.card, false),
      order,
    })),
    roundNumber: state.round.number,
    roundCount: ROUND_COUNT,
    trickNumber: state.round.currentTrick.number,
    trickCount: TRICKS_PER_ROUND,
    completedTricks: state.round.completedTricks.length,
    trump: state.round.trump,
    ledSuit: state.round.currentTrick.plays[0]?.card.suit ?? null,
    winnerKey: winner,
    status: tableStatus(state, ui, active, winner),
    ...advanceFor(state),
    paused: ui.paused,
    deadline: ui.deadline,
    now: ui.now,
    canPlay,
    settings,
  };
}
