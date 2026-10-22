export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type PlayerKey = 'south' | 'west' | 'north' | 'east';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Scores = Readonly<Record<PlayerKey, number>>;

export interface Card {
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
}

export interface Player {
  readonly key: PlayerKey;
  readonly name: string;
  readonly isMe: boolean;
  readonly kind: 'human' | 'ai';
}

export interface TrickPlay {
  readonly playerKey: PlayerKey;
  readonly card: Card;
}

export interface Trick {
  readonly number: number;
  readonly leader: PlayerKey;
  readonly plays: readonly TrickPlay[];
  readonly winner: PlayerKey | null;
}

export interface RoundState {
  readonly number: number;
  readonly dealer: PlayerKey;
  readonly trump: Suit | null;
  readonly hands: Readonly<Record<PlayerKey, readonly Card[]>>;
  readonly undealt: readonly Card[];
  readonly completedTricks: readonly Trick[];
  readonly currentTrick: Trick;
}

export type GamePhase = 'playing' | 'trickComplete' | 'roundComplete' | 'gameComplete';

export interface GameState {
  readonly id: string;
  readonly seed: number;
  readonly revision: number;
  readonly phase: GamePhase;
  readonly players: readonly Player[];
  readonly decks: readonly (readonly Card[])[];
  readonly completedRounds: readonly RoundState[];
  readonly round: RoundState;
  readonly log: readonly LogEvent[];
}

export interface Settings {
  readonly difficulty: Difficulty;
  readonly showLegalHints: boolean;
  readonly turnTimer: boolean;
  readonly autoSortHand: boolean;
}

export interface Stats {
  readonly gamesPlayed: number;
  readonly gamesWon: number;
  readonly lastCountedGameId: string | null;
}

export type LogEvent = {
  readonly id: string;
  readonly at: number;
  readonly roundNumber: number;
} & (
  | { readonly kind: 'round-start'; readonly dealer: PlayerKey; readonly trump: Suit | null }
  | {
      readonly kind: 'card-played';
      readonly playerKey: PlayerKey;
      readonly card: Card;
      readonly automatic: boolean;
    }
  | {
      readonly kind: 'trick-won';
      readonly playerKey: PlayerKey;
      readonly trickNumber: number;
    }
  | { readonly kind: 'round-end'; readonly scores: Scores }
  | { readonly kind: 'game-end'; readonly winners: readonly PlayerKey[]; readonly scores: Scores }
);

export interface CreateGameOptions {
  readonly id: string;
  readonly seed: number;
  readonly at: number;
  readonly decks?: readonly (readonly Card[])[];
}

export type GameAction =
  | {
      readonly type: 'PLAY_CARD';
      readonly gameId: string;
      readonly expectedRevision: number;
      readonly playerKey: PlayerKey;
      readonly cardId: string;
      readonly at: number;
      readonly automatic: boolean;
    }
  | {
      readonly type: 'CONTINUE_TRICK';
      readonly gameId: string;
      readonly expectedRevision: number;
      readonly at: number;
    }
  | {
      readonly type: 'ADVANCE_ROUND';
      readonly gameId: string;
      readonly expectedRevision: number;
      readonly at: number;
    };

export type RuleError = 'stale-action' | 'wrong-phase' | 'wrong-player' | 'unknown-card' | 'must-follow-suit';

export type Transition =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly state: GameState; readonly error: RuleError };

export interface GameScoreResult {
  readonly totals: Scores;
  readonly winners: readonly PlayerKey[];
  readonly outcome: 'won' | 'lost' | 'draw';
  readonly final: boolean;
}
