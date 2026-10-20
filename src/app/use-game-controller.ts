import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@jfrader/ui/toast';
import { config } from '../config';
import { copy } from '../content/en';
import {
  createGame,
  currentPlayer,
  gameReducer,
  legalMoves,
  lowestLegalCard,
  scoreGame,
} from '../engine';
import type { GameAction, GameState, PlayerKey, RuleError, Settings, Stats, Suit } from '../engine/types';
import type { ResultsView, ScoreHistoryView, TableCommand, TableView } from '../contracts';
import { toResultsView, toScoreHistoryView, toTableView } from './presentation';
import { useAiTurn } from './use-ai-turn';
import { usePauseState } from './use-pause-state';
import {
  DEFAULT_STATS,
  loadSettings,
  loadStats,
  resetStats as persistResetStats,
  saveSettings,
  saveStats,
} from './storage';

function ruleErrorMessage(error: RuleError, ledSuit: Suit | null): string {
  switch (error) {
    case 'must-follow-suit':
      return ledSuit ? copy.errors.mustFollowSuit(copy.suits[ledSuit]) : copy.errors.wrongPhase;
    case 'wrong-player':
      return copy.errors.wrongTurn;
    case 'stale-action':
      return copy.errors.stale;
    case 'unknown-card':
      return copy.errors.unknownCard;
    case 'wrong-phase':
      return copy.errors.wrongPhase;
  }
}

export type DialogKey = 'rules' | 'settings' | 'newGame' | 'results' | 'scores';

const EMPTY_DIALOGS: Record<DialogKey, boolean> = {
  rules: false,
  settings: false,
  newGame: false,
  results: false,
  scores: false,
};

export interface GameController {
  readonly view: TableView;
  readonly scoreHistory: ScoreHistoryView;
  readonly results: ResultsView | null;
  readonly selectedCardId: string | null;
  readonly settings: Settings;
  readonly stats: Stats;
  readonly now: number;
  readonly dialogs: Record<DialogKey, boolean>;
  readonly canResetStats: boolean;
  startGame: () => void;
  requestNewGame: () => void;
  confirmNewGame: () => void;
  continueGame: () => void;
  selectCard: (id: string | null) => void;
  playCard: (id: string) => void;
  handleCommand: (command: TableCommand) => void;
  handleShellCommand: (command: 'rules' | 'settings' | 'new-game') => void;
  updateSettings: (next: Settings) => void;
  resetStats: () => Promise<void>;
  openDialog: (key: DialogKey) => void;
  closeDialog: (key: DialogKey) => void;
  setRoutePaused: (paused: boolean) => void;
}

export function useGameController(): GameController {
  const { toast, dismiss } = useToast();
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings().value);
  const [stats, setStats] = useState<Stats>(() => loadStats().value);
  const [deadline, setDeadlineState] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [dialogs, setDialogs] = useState<Record<DialogKey, boolean>>({ ...EMPTY_DIALOGS });
  const anyDialog = Object.values(dialogs).some(Boolean);
  const { paused, pauseLabel, pause, resume, setRoutePaused } = usePauseState(anyDialog);

  const storageChecked = useRef(false);
  const deadlineRef = useRef<number | null>(null);
  const remainingRef = useRef<number | null>(null);
  const turnRef = useRef<string | null>(null);
  const errorToastRef = useRef<string | null>(null);

  const clearRuleError = useCallback(() => {
    if (errorToastRef.current) dismiss(errorToastRef.current);
    errorToastRef.current = null;
  }, [dismiss]);

  const reportRuleError = useCallback((error: RuleError) => {
    clearRuleError();
    const ledSuit = game?.round.currentTrick.plays[0]?.card.suit ?? null;
    errorToastRef.current = toast({ title: ruleErrorMessage(error, ledSuit), tone: 'warning' });
  }, [clearRuleError, game, toast]);

  const setDeadline = useCallback((value: number | null) => {
    deadlineRef.current = value;
    setDeadlineState(value);
  }, []);

  useEffect(() => {
    const tickMs = deadline === null ? config.timing.idleTickMs : config.timing.statusTickMs;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    if (storageChecked.current) return;
    storageChecked.current = true;
    const settingsResult = loadSettings();
    const statsResult = loadStats();
    if (settingsResult.error || statsResult.error) {
      toast({ title: copy.toast.storageWarning, tone: 'warning' });
    }
  }, [toast]);

  const humanTurnId =
    game && game.phase === 'playing' && currentPlayer(game) === 'south'
      ? `${game.id}:${game.round.number}:${game.round.currentTrick.number}:${game.round.currentTrick.plays.length}`
      : null;

  useEffect(() => {
    if (turnRef.current !== humanTurnId) {
      turnRef.current = humanTurnId;
      remainingRef.current = null;
    }
    if (!humanTurnId || !settings.turnTimer) {
      remainingRef.current = null;
      setDeadline(null);
      return;
    }
    if (paused) {
      if (deadlineRef.current !== null) {
        remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
        setDeadline(null);
      }
      return;
    }
    setDeadline(Date.now() + (remainingRef.current ?? config.timing.turnDurationMs));
    remainingRef.current = null;
  }, [humanTurnId, settings.turnTimer, paused, setDeadline]);

  const playCardInternal = useCallback(
    (playerKey: PlayerKey, cardId: string, automatic: boolean): boolean => {
      if (!game) return false;
      const action: GameAction = {
        type: 'PLAY_CARD',
        gameId: game.id,
        expectedRevision: game.revision,
        playerKey,
        cardId,
        at: Date.now(),
        automatic,
      };
      const result = gameReducer(game, action);
      if (result.ok) {
        setGame(result.state);
        setSelectedCardId(null);
        if (playerKey === 'south') clearRuleError();
        return true;
      }
      if (playerKey === 'south') reportRuleError(result.error);
      return false;
    },
    [clearRuleError, game, reportRuleError],
  );

  useEffect(() => {
    if (!deadline || !game || game.phase !== 'playing' || paused) return;
    const delay = Math.max(0, deadline - Date.now());
    const id = window.setTimeout(() => {
      const card = lowestLegalCard(game, 'south');
      if (card) playCardInternal('south', card.id, true);
    }, delay);
    return () => window.clearTimeout(id);
  }, [deadline, game, paused, playCardInternal]);

  useAiTurn({ game, paused, difficulty: settings.difficulty, playCard: playCardInternal });

  useEffect(() => {
    if (!game || game.phase !== 'roundComplete' && game.phase !== 'gameComplete') return;
    setDialogs((previous) => (previous.results ? previous : { ...previous, results: true }));
  }, [game?.phase, game?.id]);

  useEffect(() => {
    if (!game || game.phase !== 'gameComplete') return;
    if (stats.lastCountedGameId === game.id) return;
    const score = scoreGame(game);
    const next: Stats = {
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon + (score.outcome === 'won' ? 1 : 0),
      lastCountedGameId: game.id,
    };
    setStats(next);
    if (!saveStats(next)) {
      toast({ title: copy.toast.storageWarning, tone: 'warning' });
    }
  }, [game, stats, toast]);

  useEffect(() => {
    setSelectedCardId(null);
  }, [game?.id, game?.round.number, game?.round.currentTrick.number]);

  const startGame = useCallback(() => {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
    const next = createGame({ id: crypto.randomUUID(), seed, at: Date.now() });
    setGame(next);
    setSelectedCardId(null);
    resume();
    setDeadline(null);
    remainingRef.current = null;
    turnRef.current = null;
    clearRuleError();
    setDialogs({ ...EMPTY_DIALOGS });
  }, [clearRuleError, resume, setDeadline]);

  const requestNewGame = useCallback(() => {
    if (game && game.phase !== 'gameComplete') {
      setDialogs((previous) => ({ ...previous, newGame: true }));
      return;
    }
    startGame();
  }, [game, startGame]);

  const confirmNewGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const continueGame = useCallback(() => {
    if (!game) return;
    if (game.phase === 'gameComplete') {
      startGame();
      return;
    }
    if (game.phase !== 'trickComplete' && game.phase !== 'roundComplete') return;
    const action: GameAction =
      game.phase === 'roundComplete'
        ? { type: 'ADVANCE_ROUND', gameId: game.id, expectedRevision: game.revision, at: Date.now() }
        : { type: 'CONTINUE_TRICK', gameId: game.id, expectedRevision: game.revision, at: Date.now() };
    const result = gameReducer(game, action);
    if (result.ok) {
      setGame(result.state);
      setSelectedCardId(null);
      clearRuleError();
      setDialogs((previous) => ({ ...previous, results: false }));
    } else {
      reportRuleError(result.error);
    }
  }, [clearRuleError, game, reportRuleError, startGame]);

  const selectCard = useCallback(
    (id: string | null) => {
      if (!game || game.phase !== 'playing' || paused) return;
      if (id === null) {
        setSelectedCardId(null);
        return;
      }
      if (currentPlayer(game) !== 'south') {
        reportRuleError('wrong-player');
        return;
      }
      const legal = legalMoves(game, 'south').some((card) => card.id === id);
      if (!legal) {
        const inHand = game.round.hands.south.some((card) => card.id === id);
        reportRuleError(inHand ? 'must-follow-suit' : 'unknown-card');
        return;
      }
      setSelectedCardId(id);
      clearRuleError();
    },
    [clearRuleError, game, paused, reportRuleError],
  );

  const playCard = useCallback(
    (cardId: string) => {
      if (!game) return;
      if (currentPlayer(game) !== 'south') {
        reportRuleError('wrong-player');
        return;
      }
      playCardInternal('south', cardId, false);
    },
    [game, playCardInternal, reportRuleError],
  );

  const openDialog = useCallback((key: DialogKey) => {
    setDialogs((previous) => ({ ...previous, [key]: true }));
  }, []);

  const closeDialog = useCallback((key: DialogKey) => {
    setDialogs((previous) => ({ ...previous, [key]: false }));
  }, []);

  const handleCommand = useCallback(
    (command: TableCommand) => {
      switch (command) {
        case 'start':
          startGame();
          break;
        case 'pause':
          pause();
          break;
        case 'resume':
          resume();
          break;
        case 'continue':
          continueGame();
          break;
        case 'results':
          openDialog('results');
          break;
        case 'scores':
          openDialog('scores');
          break;
        case 'rules':
          openDialog('rules');
          break;
        case 'settings':
          openDialog('settings');
          break;
      }
    },
    [continueGame, openDialog, pause, resume, startGame],
  );

  const handleShellCommand = useCallback(
    (command: 'rules' | 'settings' | 'new-game') => {
      if (command === 'rules') openDialog('rules');
      else if (command === 'settings') openDialog('settings');
      else requestNewGame();
    },
    [openDialog, requestNewGame],
  );

  const updateSettings = useCallback(
    (next: Settings) => {
      setSettingsState(next);
      if (!saveSettings(next)) {
        toast({ title: copy.toast.storageWarning, tone: 'warning' });
      }
    },
    [toast],
  );

  const resetStats = useCallback(async () => {
    if (game && game.phase !== 'gameComplete') return;
    if (!persistResetStats()) {
      toast({ title: copy.toast.storageWarning, tone: 'danger' });
      throw new Error('Could not reset stats');
    }
    setStats(DEFAULT_STATS);
  }, [game, toast]);

  const view = useMemo(
    () => toTableView(game, settings, { paused, pauseLabel, deadline, now }),
    [game, settings, paused, pauseLabel, deadline, now],
  );

  const scoreHistory = useMemo(() => toScoreHistoryView(game), [game]);
  const results = useMemo(() => toResultsView(game, stats), [game, stats]);
  const canResetStats = !game || game.phase === 'gameComplete';

  return {
    view,
    scoreHistory,
    results,
    selectedCardId,
    settings,
    stats,
    now,
    dialogs,
    canResetStats,
    startGame,
    requestNewGame,
    confirmNewGame,
    continueGame,
    selectCard,
    playCard,
    handleCommand,
    handleShellCommand,
    updateSettings,
    resetStats,
    openDialog,
    closeDialog,
    setRoutePaused,
  };
}
