import { useEffect } from 'react';
import { chooseAiCard, currentPlayer, lowestLegalCard } from '../engine';
import type { Difficulty, GameState, PlayerKey } from '../engine/types';
import { config } from '../config';

interface UseAiTurnOptions {
  readonly game: GameState | null;
  readonly paused: boolean;
  readonly difficulty: Difficulty;
  readonly playCard: (playerKey: PlayerKey, cardId: string, automatic: boolean) => boolean;
}

/**
 * Plays one AI turn at a time. The watchdog is deliberate: if the main timer is lost or its
 * chosen card is rejected, the lowest legal card is played instead of leaving the table stuck.
 */
export function useAiTurn({ game, paused, difficulty, playCard }: UseAiTurnOptions): void {
  useEffect(() => {
    if (!game || game.phase !== 'playing' || paused) return;
    const actor = currentPlayer(game);
    if (!actor || actor === 'south') return;

    let settled = false;
    const play = (card: ReturnType<typeof chooseAiCard>) => {
      if (settled || !card) return;
      settled = playCard(actor, card.id, true);
    };
    const main = window.setTimeout(() => {
      play(chooseAiCard(game, actor, difficulty));
    }, config.timing.aiDelayMs);
    const watchdog = window.setTimeout(() => {
      if (settled) return;
      play(lowestLegalCard(game, actor));
    }, config.timing.aiDelayMs + 1_200);

    return () => {
      window.clearTimeout(main);
      window.clearTimeout(watchdog);
    };
  }, [game, paused, difficulty, playCard]);
}
