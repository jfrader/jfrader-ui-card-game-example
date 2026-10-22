import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { config } from '../config';
import { useMediaQuery } from '../ui/use-media-query';
import type { GameController, TableCommand } from '../contracts';
import { toResultsView, toScoreHistoryView, toScoreTable, toTableView } from './views';
import { useDialogs } from './use-dialogs';
import { useMatch } from './use-match';
import { usePauseState } from './use-pause-state';
import { usePreferences } from './use-preferences';
import { useTurnClock } from './use-turn-clock';

export type { DialogKey, GameController } from '../contracts';

export function useGameController(): GameController {
  const location = useLocation();
  const inlineScores = useMediaQuery(`(min-width: ${config.breakpoints.inlineSidebar}px)`);
  const { dialogs, anyDialog, openDialog, closeDialog, resetDialogs } = useDialogs(inlineScores);
  const { paused, pauseLabel, pause, resume } = usePauseState(anyDialog, location.pathname !== '/');
  const { settings, stats, updateSettings, countGame, resetStatsFor } = usePreferences();
  const openResults = useCallback(() => openDialog('results'), [openDialog]);
  const closeResults = useCallback(() => closeDialog('results'), [closeDialog]);
  const match = useMatch({ paused, settings, resume, resetDialogs, openResults, closeResults, countGame });
  const { game, startGame, continueGame, selectCard, playCard, selectedCardId, playCardInternal } = match;
  const { deadline, now } = useTurnClock(game, settings.turnTimer, paused, playCardInternal);
  const requestNewGame = useCallback(() => {
    if (game && game.phase !== 'gameComplete') openDialog('newGame');
    else startGame();
  }, [game, openDialog, startGame]);
  const resetStats = useCallback(() => resetStatsFor(game), [game, resetStatsFor]);
  const handleCommand = useCallback(
    (command: TableCommand) => {
      const commands: Record<TableCommand, () => void> = {
        start: startGame,
        pause,
        resume,
        continue: continueGame,
        results: () => openDialog('results'),
        scores: () => openDialog('scores'),
        rules: () => openDialog('rules'),
        settings: () => openDialog('settings'),
      };
      commands[command]();
    },
    [continueGame, openDialog, pause, resume, startGame],
  );
  const handleShellCommand = useCallback(
    (command: 'rules' | 'settings' | 'new-game') => {
      if (command === 'new-game') requestNewGame();
      else openDialog(command);
    },
    [openDialog, requestNewGame],
  );
  const view = useMemo(
    () => toTableView(game, settings, { paused, pauseLabel, deadline, now }),
    [game, settings, paused, pauseLabel, deadline, now],
  );
  const table = useMemo(() => toScoreTable(game), [game]);
  const scoreHistory = useMemo(() => toScoreHistoryView(game, table), [game, table]);
  const results = useMemo(() => toResultsView(game, stats, table), [game, stats, table]);
  return {
    view,
    scoreHistory,
    results,
    selectedCardId,
    settings,
    stats,
    now,
    dialogs,
    canResetStats: !game || game.phase === 'gameComplete',
    startGame,
    requestNewGame,
    confirmNewGame: startGame,
    continueGame,
    selectCard,
    playCard,
    handleCommand,
    handleShellCommand,
    updateSettings,
    resetStats,
    openDialog,
    closeDialog,
  };
}
