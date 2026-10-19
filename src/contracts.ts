import type {
  GamePhase,
  PlayerKey,
  Rank,
  Scores,
  Settings,
  Stats,
  Suit,
} from './engine/types';

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

export interface TableView {
  readonly phase: 'ready' | GamePhase;
  readonly seats: readonly SeatView[];
  readonly hand: readonly CardView[];
  readonly plays: readonly { readonly playerKey: PlayerKey; readonly card: CardView; readonly order: number }[];
  readonly roundNumber: number;
  readonly trickNumber: number;
  readonly completedTricks: number;
  readonly trump: Suit | null;
  readonly ledSuit: Suit | null;
  readonly rounds: readonly { readonly key: string; readonly label: string; readonly outcome: 'won' | 'lost' | 'pending' }[];
  readonly paused: boolean;
  readonly pauseLabel: string | null;
  readonly deadline: number | null;
  readonly now: number;
  readonly winnerLabel: string | null;
  readonly canPlay: boolean;
  readonly settings: Settings;
}

export type TableCommand =
  | 'start'
  | 'pause'
  | 'resume'
  | 'continue'
  | 'results'
  | 'scores'
  | 'rules'
  | 'settings';

export type ShellCommand = 'rules' | 'settings' | 'new-game';

export interface ScoreHistoryView {
  readonly totals: readonly { readonly key: PlayerKey; readonly label: string; readonly value: number; readonly stage?: string }[];
  readonly rounds: readonly { readonly roundNumber: number; readonly scores: Scores }[];
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
      readonly rows: ScoreHistoryView['totals'];
      readonly totals: ScoreHistoryView['totals'];
      readonly nextTrump: Suit | null;
    }
  | {
      readonly kind: 'game';
      readonly outcome: 'won' | 'lost' | 'draw';
      readonly winnerNames: readonly string[];
      readonly rows: ScoreHistoryView['totals'];
      readonly stats: Stats;
    };
