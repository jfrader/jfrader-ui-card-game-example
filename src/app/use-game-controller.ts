import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@jfrader/ui/toast';
import { config } from '../config';
import { copy } from '../content/en';
import {
  chooseAiCard,
  createGame,
  currentPlayer,
  gameReducer,
  legalMoves,
  lowestLegalCard,
  scoreGame,
} from '../engine';
import type { GameAction, GameState, PlayerKey, RuleError, Settings, Stats } from '../engine/types';
import type { ResultsView, ScoreHistoryView, TableCommand, TableView } from '../contracts';
import { toResultsView, toScoreHistoryView, toTableView } from './presentation';
import {
  DEFAULT_STATS,
  loadNoticeDismissed,
  loadSettings,
  loadStats,
  resetStats as persistResetStats,
  saveNoticeDismissed,
  saveSettings,
  saveStats,
} from './storage';

export type PauseReason = 'manual' | 'modal' | 'route' | 'hidden';

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
  readonly error: RuleError | 'storage' | null;
  readonly selectedCardId: string | null;
  readonly settings: Settings;
  readonly stats: Stats;
  readonly noticeDismissed: boolean;
  readonly paused: boolean;
  readonly pauseLabel: string | null;
  readonly deadline: number | null;
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
  dismissNotice: () => void;
  clearError: () => void;
  openDialog: (key: DialogKey) => void;
  closeDialog: (key: DialogKey) => void;
  setRoutePaused: (paused: boolean) => void;
  pause: () => void;
  resume: () => void;
}

export function useGameController(): GameController {
  const { toast } = useToast();
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings().value);
  const [stats, setStats] = useState<Stats>(() => loadStats().value);
  const [noticeDismissed, setNoticeDismissed] = useState(() => loadNoticeDismissed());
  const [pauseReasons, setPauseReasons] = useState<ReadonlySet<PauseReason>>(() => new Set());
  const [deadline, setDeadlineState] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<RuleError | 'storage' | null>(null);
  const [dialogs, setDialogs] = useState<Record<DialogKey, boolean>>({ ...EMPTY_DIALOGS });

  const storageChecked = useRef(false);
  const deadlineRef = useRef<number | null>(null);
  const remainingRef = useRef<number | null>(null);
  const turnRef = useRef<string | null>(null);

  const setDeadline = useCallback((value: number | null) => {
    deadlineRef.current = value;
    setDeadlineState(value);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), config.timing.statusTickMs);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (storageChecked.current) return;
    storageChecked.current = true;
    const settingsResult = loadSettings();
    const statsResult = loadStats();
    if (settingsResult.error || statsResult.error) {
      toast({ title: copy.toast.storageWarning, tone: 'warning' });
    }
  }, [toast]);

  const addReason = useCallback((reason: PauseReason) => {
    setPauseReasons((previous) => {
      if (previous.has(reason)) return previous;
      const next = new Set(previous);
      next.add(reason);
      return next;
    });
  }, []);

  const removeReason = useCallback((reason: PauseReason) => {
    setPauseReasons((previous) => {
      if (!previous.has(reason)) return previous;
      const next = new Set(previous);
      next.delete(reason);
      return next;
    });
  }, []);

  const resume = useCallback(() => setPauseReasons(new Set()), []);

  const paused = pauseReasons.size > 0;
  const pauseLabel = pauseReasons.has('manual')
    ? copy.pause.manual
    : pauseReasons.has('modal')
      ? copy.pause.modal
      : pauseReasons.has('route')
        ? copy.pause.route
        : pauseReasons.has('hidden')
          ? copy.pause.hidden
          : null;

  const anyDialog = Object.values(dialogs).some(Boolean);
  useEffect(() => {
    if (anyDialog) addReason('modal');
    else removeReason('modal');
  }, [anyDialog, addReason, removeReason]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) addReason('hidden');
    };
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [addReason]);

  const setRoutePaused = useCallback(
    (value: boolean) => {
      if (value) addReason('route');
      else removeReason('route');
    },
    [addReason, removeReason],
  );

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
        setError(null);
        return true;
      }
      setError(result.error);
      return false;
    },
    [game],
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

  useEffect(() => {
    if (!game || game.phase !== 'playing' || paused) return;
    const actor = currentPlayer(game);
    if (!actor || actor === 'south') return;
    let settled = false;
    const play = (card: ReturnType<typeof chooseAiCard>) => {
      if (settled || !card) return;
      settled = playCardInternal(actor, card.id, true);
    };
    const main = window.setTimeout(() => {
      play(chooseAiCard(game, actor, settings.difficulty));
    }, config.timing.aiDelayMs);
    const watchdog = window.setTimeout(() => {
      if (settled) return;
      play(lowestLegalCard(game, actor));
    }, config.timing.aiDelayMs + 1_200);
    return () => {
      window.clearTimeout(main);
      window.clearTimeout(watchdog);
    };
  }, [game, paused, settings.difficulty, playCardInternal]);

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
    setPauseReasons(new Set());
    setDeadline(null);
    remainingRef.current = null;
    turnRef.current = null;
    setError(null);
    setDialogs({ ...EMPTY_DIALOGS });
  }, [setDeadline]);

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
      setError(null);
      setDialogs((previous) => ({ ...previous, results: false }));
    } else {
      setError(result.error);
    }
  }, [game, startGame]);

  const selectCard = useCallback(
    (id: string | null) => {
      if (!game || game.phase !== 'playing' || paused) return;
      if (id === null) {
        setSelectedCardId(null);
        return;
      }
      if (currentPlayer(game) !== 'south') {
        setError('wrong-player');
        return;
      }
      const legal = legalMoves(game, 'south').some((card) => card.id === id);
      if (!legal) {
        const inHand = game.round.hands.south.some((card) => card.id === id);
        setError(inHand ? 'must-follow-suit' : 'unknown-card');
        return;
      }
      setSelectedCardId(id);
      setError(null);
    },
    [game, paused],
  );

  const playCard = useCallback(
    (cardId: string) => {
      if (!game) return;
      if (currentPlayer(game) !== 'south') {
        setError('wrong-player');
        return;
      }
      playCardInternal('south', cardId, false);
    },
    [game, playCardInternal],
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
          addReason('manual');
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
    [addReason, continueGame, openDialog, resume, startGame],
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

  const dismissNotice = useCallback(() => {
    setNoticeDismissed(true);
    if (!saveNoticeDismissed()) {
      toast({ title: copy.toast.storageWarning, tone: 'warning' });
    }
  }, [toast]);

  const view = useMemo(
    () =>
      toTableView(game, settings, {
        selectedCardId,
        paused,
        pauseLabel,
        deadline,
        now,
      }),
    [game, settings, selectedCardId, paused, pauseLabel, deadline, now],
  );

  const scoreHistory = useMemo(() => toScoreHistoryView(game), [game]);
  const results = useMemo(() => toResultsView(game, stats), [game, stats]);
  const canResetStats = !game || game.phase === 'gameComplete';

  return {
    view,
    scoreHistory,
    results,
    error,
    selectedCardId,
    settings,
    stats,
    noticeDismissed,
    paused,
    pauseLabel,
    deadline,
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
    dismissNotice,
    clearError: () => setError(null),
    openDialog,
    closeDialog,
    setRoutePaused,
    pause: () => addReason('manual'),
    resume,
  };
}
