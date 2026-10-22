import { useCallback, useState } from 'react';
import { currentPlayer, legalMoves } from '../engine';
import type { GameState, RuleError } from '../engine/types';

export function useCardSelection(
  game: GameState | null,
  paused: boolean,
  reportRuleError: (error: RuleError) => void,
  clearRuleError: () => void,
) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const clearSelection = useCallback(() => setSelectedCardId(null), []);
  const selectCard = useCallback(
    (id: string | null) => {
      if (!game || game.phase !== 'playing' || paused) return;
      if (id === null) {
        clearSelection();
        return;
      }
      if (currentPlayer(game) !== 'south') {
        reportRuleError('wrong-player');
        return;
      }
      if (!legalMoves(game, 'south').some((card) => card.id === id)) {
        const inHand = game.round.hands.south.some((card) => card.id === id);
        reportRuleError(inHand ? 'must-follow-suit' : 'unknown-card');
        return;
      }
      setSelectedCardId(id);
      clearRuleError();
    },
    [clearRuleError, clearSelection, game, paused, reportRuleError],
  );
  return { selectedCardId, selectCard, clearSelection };
}
