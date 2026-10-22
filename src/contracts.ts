import type { GamePhase, PlayerKey, Rank, Settings, Stats, Suit } from './engine/types';

/** View models the table and panels consume. Renderers never call the engine. */
export interface CardView {
  readonly id: string;
  readonly label: string;
  readonly value: { readonly deck: 'french'; readonly suit: Suit; readonly rank: Rank };
  readonly legal: boolean;
}

export interface SeatView {
  readonly key: PlayerKey;
  readonly name: string;
  readonly isMe: boolean;
  readonly handCount: number;
  readonly totalPoints: number;
  readonly roundPoints: number;
  readonly dealer: boolean;
  readonly active: boolean;
}

export interface PlayView {
  readonly playerKey: PlayerKey;
  readonly card: CardView;
  readonly order: number;
}

/** What the table is waiting for, phrased for the status line. */
export interface TableStatus {
  readonly tone: 'turn' | 'waiting' | 'resolved' | 'paused';
  readonly title: string;
  readonly detail: string;
}

/** The single next step the dock offers besides playing a card. */
export type TableAdvance = 'continue' | 'results' | null;

export interface TableView {
  readonly phase: 'ready' | GamePhase;
  readonly seats: readonly SeatView[];
  readonly hand: readonly CardView[];
  readonly plays: readonly PlayView[];
  readonly roundNumber: number;
  readonly roundCount: number;
  readonly trickNumber: number;
  readonly trickCount: number;
  readonly completedTricks: number;
  readonly trump: Suit | null;
  readonly ledSuit: Suit | null;
  readonly winnerKey: PlayerKey | null;
  readonly status: TableStatus;
  readonly advance: TableAdvance;
  readonly advanceLabel: string | null;
  readonly paused: boolean;
  readonly deadline: number | null;
  readonly now: number;
  readonly canPlay: boolean;
  readonly settings: Settings;
}

export type TableCommand =
  'start' | 'pause' | 'resume' | 'continue' | 'results' | 'scores' | 'rules' | 'settings';

export type ShellCommand = 'rules' | 'settings' | 'new-game';

export interface ScoreTableView {
  readonly players: readonly {
    readonly key: PlayerKey;
    readonly name: string;
    readonly isMe: boolean;
    readonly total: number;
    readonly leader: boolean;
  }[];
  readonly rounds: readonly {
    readonly number: number;
    readonly state: 'done' | 'current' | 'upcoming';
    readonly trump: Suit | null;
    readonly scores: Partial<Record<PlayerKey, number>>;
  }[];
}

export interface RoundLeadView {
  readonly key: string;
  readonly label: string;
  readonly outcome: 'won' | 'lost' | 'pending';
}

export interface ScoreHistoryView {
  readonly table: ScoreTableView;
  readonly roundLeads: readonly RoundLeadView[];
  readonly events: readonly {
    readonly id: string;
    readonly at: number;
    readonly actor?: string;
    readonly title: string;
    readonly detail?: string;
  }[];
}

export type ResultsView =
  | {
      readonly kind: 'round';
      readonly roundNumber: number;
      readonly roundCount: number;
      readonly yourTricks: number;
      readonly lead: 'sole' | 'joint' | 'behind';
      readonly table: ScoreTableView;
      readonly nextTrump: Suit | null;
    }
  | {
      readonly kind: 'game';
      readonly outcome: 'won' | 'lost' | 'draw';
      readonly winnerNames: readonly string[];
      readonly yourPoints: number;
      readonly table: ScoreTableView;
      readonly stats: Stats;
    };
