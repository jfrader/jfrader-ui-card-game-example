import { useCallback, useState } from 'react';
import { createGame, currentPlayer, gameReducer } from '../engine';
import type { GameAction, GameState, PlayerKey, Settings } from '../engine/types';
import { useAiTurn } from './use-ai-turn';
import { useCardSelection } from './use-card-selection';
import { useRuleErrors } from './use-rule-errors';

interface MatchOptions {
  readonly paused: boolean;
  readonly settings: Settings;
  readonly resume: () => void;
  readonly resetDialogs: () => void;
  readonly openResults: () => void;
  readonly closeResults: () => void;
  readonly countGame: (game: GameState) => void;
}

const CONTINUE_ACTIONS = {
  playing: null,
  trickComplete: 'CONTINUE_TRICK',
  roundComplete: 'ADVANCE_ROUND',
  gameComplete: null,
} as const;

export function useMatch(options: MatchOptions) {
  const { paused, settings, resume, resetDialogs, openResults, closeResults, countGame } = options;
  const [game, setGame] = useState<GameState | null>(null);
  const { clearRuleError, reportRuleError } = useRuleErrors(game);
  const { selectedCardId, selectCard, clearSelection } = useCardSelection(
    game,
    paused,
    reportRuleError,
    clearRuleError,
  );
  const applyTransition = useCallback(
    (next: GameState, restart = false) => {
      if (restart) {
        resetDialogs();
        resume();
      }
      setGame(next);
      clearSelection();
      clearRuleError();
      countGame(next);
      if (next.phase === 'roundComplete' || next.phase === 'gameComplete') openResults();
      else closeResults();
    },
    [clearRuleError, clearSelection, closeResults, countGame, openResults, resetDialogs, resume],
  );

  const startGame = useCallback(() => {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
    applyTransition(createGame({ id: crypto.randomUUID(), seed, at: Date.now() }), true);
  }, [applyTransition]);

  const playCardInternal = useCallback(
    (playerKey: PlayerKey, cardId: string, automatic: boolean) => {
      if (!game || paused) return false;
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
        applyTransition(result.state);
        return true;
      }
      if (playerKey === 'south') reportRuleError(result.error);
      return false;
    },
    [applyTransition, game, paused, reportRuleError],
  );

  const continueGame = useCallback(() => {
    if (!game) return;
    if (game.phase === 'gameComplete') {
      startGame();
      return;
    }
    const type = CONTINUE_ACTIONS[game.phase];
    if (!type) return;
    const result = gameReducer(game, {
      type,
      gameId: game.id,
      expectedRevision: game.revision,
      at: Date.now(),
    });
    if (result.ok) applyTransition(result.state);
    else reportRuleError(result.error);
  }, [applyTransition, game, reportRuleError, startGame]);

  const playCard = useCallback(
    (id: string) => {
      if (!game || paused) return;
      if (currentPlayer(game) !== 'south') reportRuleError('wrong-player');
      else playCardInternal('south', id, false);
    },
    [game, paused, playCardInternal, reportRuleError],
  );

  useAiTurn({ game, paused, difficulty: settings.difficulty, playCard: playCardInternal });
  return { game, selectedCardId, selectCard, playCard, playCardInternal, startGame, continueGame };
}
