import { copy, trumpLabel } from '../content/en';
import {
  currentPlayer,
  legalMoves,
  PLAYERS,
  ROUND_COUNT,
  roundOutcomes,
  roundScores,
  scoreGame,
  sortHand,
  TRICKS_PER_ROUND,
  TRUMPS,
} from '../engine';
import type { Card, GameState, PlayerKey, Settings, Stats } from '../engine/types';
import type {
  CardView,
  ResultsView,
  ScoreHistoryView,
  ScoreTableView,
  SeatView,
  TableStatus,
  TableView,
} from '../contracts';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cardLabel(card: Card): string {
  return `${capitalize(copy.ranks[card.rank])} of ${copy.suits[card.suit]}`;
}

function cardView(card: Card, legal: boolean): CardView {
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

interface TableUiState {
  readonly paused: boolean;
  readonly pauseLabel: string | null;
  readonly deadline: number | null;
  readonly now: number;
}

function trickWinnerText(state: GameState, winner: PlayerKey | null): string {
  if (!winner) return '';
  return winner === 'south' ? copy.status.youTake : copy.status.takes(playerName(state, winner));
}

function tableStatus(
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

function advanceFor(state: GameState): Pick<TableView, 'advance' | 'advanceLabel'> {
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

function roundState(state: GameState, number: number): ScoreTableView['rounds'][number]['state'] {
  if (state.completedRounds.some((round) => round.number === number)) return 'done';
  if (state.round.number !== number) return 'upcoming';
  return state.phase === 'roundComplete' || state.phase === 'gameComplete' ? 'done' : 'current';
}

function toScoreTable(state: GameState | null): ScoreTableView {
  const trumps = Array.from({ length: ROUND_COUNT }, (_, index) => TRUMPS[index] ?? null);
  if (!state) {
    return {
      players: PLAYERS.map((player) => ({
        key: player.key,
        name: player.name,
        isMe: player.isMe,
        total: 0,
        leader: false,
      })),
      rounds: trumps.map((trump, index) => ({ number: index + 1, state: 'upcoming', trump, scores: {} })),
    };
  }
  const { totals } = scoreGame(state);
  const top = Math.max(...Object.values(totals));
  const played = [...state.completedRounds, state.round];
  return {
    players: state.players.map((player) => ({
      key: player.key,
      name: player.name,
      isMe: player.isMe,
      total: totals[player.key],
      leader: top > 0 && totals[player.key] === top,
    })),
    rounds: trumps.map((trump, index) => {
      const number = index + 1;
      const round = played.find((item) => item.number === number);
      return {
        number,
        state: roundState(state, number),
        trump,
        scores: round ? roundScores(round) : {},
      };
    }),
  };
}

export function toScoreHistoryView(state: GameState | null): ScoreHistoryView {
  const outcomes = state
    ? roundOutcomes(state)
    : Array.from({ length: ROUND_COUNT }, () => 'pending' as const);
  const roundLeads = outcomes.map((outcome, index) => ({
    key: `round-${index + 1}`,
    label: copy.table.round(index + 1),
    outcome,
  }));
  if (!state) return { table: toScoreTable(null), roundLeads, events: [] };

  const events = state.log.map((event) => {
    switch (event.kind) {
      case 'round-start':
        return {
          id: event.id,
          at: event.at,
          title: copy.timeline.roundStart(event.roundNumber, trumpLabel(event.trump)),
          detail: `${copy.table.dealer}: ${playerName(state, event.dealer)}`,
        };
      case 'card-played':
        return {
          id: event.id,
          at: event.at,
          actor: playerName(state, event.playerKey),
          title: copy.timeline.played(playerName(state, event.playerKey), cardLabel(event.card)),
          detail: event.automatic && event.playerKey === 'south' ? copy.timeline.autoPlayed : undefined,
        };
      case 'trick-won':
        return {
          id: event.id,
          at: event.at,
          actor: playerName(state, event.playerKey),
          title: trickWinnerText(state, event.playerKey),
          detail: copy.table.trickOf(event.trickNumber, TRICKS_PER_ROUND),
        };
      case 'round-end':
        return {
          id: event.id,
          at: event.at,
          title: copy.timeline.roundEnd(event.roundNumber),
          detail: state.players.map((player) => `${player.name} ${event.scores[player.key]}`).join(' · '),
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

  return { table: toScoreTable(state), roundLeads, events };
}

export function toResultsView(state: GameState | null, stats: Stats): ResultsView | null {
  if (!state) return null;
  if (state.phase === 'roundComplete') {
    const scores = roundScores(state.round);
    const top = Math.max(...Object.values(scores));
    const leaders = Object.values(scores).filter((value) => value === top).length;
    return {
      kind: 'round',
      roundNumber: state.round.number,
      roundCount: ROUND_COUNT,
      yourTricks: scores.south,
      lead: scores.south < top ? 'behind' : leaders > 1 ? 'joint' : 'sole',
      table: toScoreTable(state),
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
      table: toScoreTable(state),
      stats,
    };
  }
  return null;
}
