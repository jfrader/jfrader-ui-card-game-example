import { copy } from '../content/en';
import {
  currentPlayer,
  legalMoves,
  roundOutcomes,
  roundScores,
  scoreGame,
  sortHand,
  TRUMPS,
} from '../engine';
import type { Card, GameState, PlayerKey, Settings, Stats, Suit } from '../engine/types';
import type {
  CardView,
  ResultsView,
  ScoreHistoryView,
  SeatView,
  TableView,
} from '../contracts';

const READY_ORDER: readonly PlayerKey[] = ['south', 'west', 'north', 'east'];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function cardLabel(card: Card): string {
  return `${capitalize(copy.ranks[card.rank])} of ${copy.suits[card.suit]}`;
}

export function trumpLabel(trump: Suit | null): string {
  return trump ? `${capitalize(copy.suits[trump])}` : copy.table.noTrump;
}

export function cardView(card: Card, legal: boolean): CardView {
  return {
    id: card.id,
    label: cardLabel(card),
    value: { deck: 'french', suit: card.suit, rank: card.rank },
    legal,
  };
}

function playerName(state: GameState, key: PlayerKey): string {
  return state.players.find((player) => player.key === key)?.name ?? key;
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
  return READY_ORDER.map((key) => ({
    key,
    name: copy.seats[key],
    isMe: key === 'south',
    handCount: 0,
    totalPoints: 0,
    roundPoints: 0,
    dealer: key === 'south',
    active: false,
  }));
}

function readyRounds(): TableView['rounds'] {
  return Array.from({ length: 5 }, (_, index) => ({
    key: `round-${index + 1}`,
    label: copy.table.round(index + 1),
    outcome: 'pending' as const,
  }));
}

export interface TableUiState {
  readonly selectedCardId: string | null;
  readonly paused: boolean;
  readonly pauseLabel: string | null;
  readonly deadline: number | null;
  readonly now: number;
}

export function toTableView(
  state: GameState | null,
  settings: Settings,
  ui: TableUiState,
): TableView {
  if (!state) {
    return {
      phase: 'ready',
      seats: readySeats(),
      hand: [],
      plays: [],
      roundNumber: 1,
      trickNumber: 1,
      completedTricks: 0,
      trump: 'hearts',
      ledSuit: null,
      rounds: readyRounds(),
      paused: ui.paused,
      pauseLabel: ui.pauseLabel,
      deadline: null,
      now: ui.now,
      winnerLabel: null,
      canPlay: false,
      settings,
    };
  }

  const active = state.phase === 'playing' ? currentPlayer(state) : null;
  const canPlay = state.phase === 'playing' && active === 'south' && !ui.paused;
  const legalIds = new Set(
    canPlay ? legalMoves(state, 'south').map((card) => card.id) : [],
  );
  const hand = settings.autoSortHand
    ? sortHand(state.round.hands.south)
    : state.round.hands.south;
  const plays = state.round.currentTrick.plays.map((play, order) => ({
    playerKey: play.playerKey,
    card: cardView(play.card, false),
    order,
  }));
  const winner =
    state.phase === 'trickComplete' ||
    state.phase === 'roundComplete' ||
    state.phase === 'gameComplete'
      ? state.round.currentTrick.winner
      : null;

  return {
    phase: state.phase,
    seats: seatViews(state, active),
    hand: hand.map((card) => cardView(card, legalIds.has(card.id))),
    plays,
    roundNumber: state.round.number,
    trickNumber: state.round.currentTrick.number,
    completedTricks: state.round.completedTricks.length,
    trump: state.round.trump,
    ledSuit: state.round.currentTrick.plays[0]?.card.suit ?? null,
    rounds: roundOutcomes(state).map((outcome, index) => ({
      key: `round-${index + 1}`,
      label: copy.table.round(index + 1),
      outcome,
    })),
    paused: ui.paused,
    pauseLabel: ui.pauseLabel,
    deadline: ui.deadline,
    now: ui.now,
    winnerLabel: winner ? copy.table.trickWon(playerName(state, winner), winner === 'south') : null,
    canPlay,
    settings,
  };
}

function totalsRows(state: GameState): ScoreHistoryView['totals'] {
  const totals = scoreGame(state).totals;
  return state.players.map((player) => ({
    key: player.key,
    label: player.name,
    value: totals[player.key],
    stage: copy.table.round(state.round.number),
  }));
}

function scoreLine(state: GameState, scores: Readonly<Record<PlayerKey, number>>): string {
  return state.players.map((player) => `${player.name}: ${scores[player.key]}`).join(' · ');
}

export function emptyScoreHistory(): ScoreHistoryView {
  return {
    totals: READY_ORDER.map((key) => ({
      key,
      label: copy.seats[key],
      value: 0,
    })),
    rounds: [],
    events: [],
  };
}

export function toScoreHistoryView(state: GameState | null): ScoreHistoryView {
  if (!state) return emptyScoreHistory();
  const rounds = [...state.completedRounds, state.round].map((round) => ({
    roundNumber: round.number,
    scores: roundScores(round),
  }));
  const events = state.log.map((event) => {
    switch (event.kind) {
      case 'round-start':
        return {
          id: event.id,
          at: event.at,
          title: `${copy.table.round(event.roundNumber)} — ${trumpLabel(event.trump)}`,
          detail: `${copy.table.dealer}: ${playerName(state, event.dealer)}`,
        };
      case 'card-played':
        return {
          id: event.id,
          at: event.at,
          actor: playerName(state, event.playerKey),
          title: `${playerName(state, event.playerKey)} played ${cardLabel(event.card)}`,
          detail: event.automatic ? copy.table.playing : undefined,
        };
      case 'trick-won':
        return {
          id: event.id,
          at: event.at,
          actor: playerName(state, event.playerKey),
          title: copy.table.trickWon(playerName(state, event.playerKey), event.playerKey === 'south'),
          detail: `${copy.table.trick(event.trickNumber)}`,
        };
      case 'round-end':
        return {
          id: event.id,
          at: event.at,
          title: `${copy.table.round(event.roundNumber)} complete`,
          detail: scoreLine(state, event.scores),
        };
      case 'game-end':
        return {
          id: event.id,
          at: event.at,
          title: copy.results.finalEyebrow,
          detail: event.winners.map((key) => playerName(state, key)).join(' · '),
        };
    }
  });

  return {
    totals: totalsRows(state),
    rounds,
    events,
  };
}

export function toResultsView(
  state: GameState | null,
  stats: Stats,
): ResultsView | null {
  if (!state) return null;
  const score = scoreGame(state);
  if (state.phase === 'roundComplete') {
    const round = roundScores(state.round);
    const rows = state.players.map((player) => ({
      key: player.key,
      label: player.name,
      value: round[player.key],
    }));
    return {
      kind: 'round',
      roundNumber: state.round.number,
      rows,
      totals: totalsRows(state),
      nextTrump: TRUMPS[state.round.number] ?? null,
    };
  }
  if (state.phase === 'gameComplete') {
    return {
      kind: 'game',
      outcome: score.outcome,
      winnerNames: score.winners.map((key) => playerName(state, key)),
      rows: totalsRows(state),
      stats,
    };
  }
  return null;
}
