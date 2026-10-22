import { useCallback, useRef } from 'react';
import { useToast } from '@jfrader/ui/toast';
import { copy } from '../content/en';
import type { GameState, RuleError } from '../engine/types';

export function useRuleErrors(game: GameState | null) {
  const { toast, dismiss } = useToast();
  const errorToast = useRef<string | null>(null);
  const clearRuleError = useCallback(() => {
    if (errorToast.current) dismiss(errorToast.current);
    errorToast.current = null;
  }, [dismiss]);
  const reportRuleError = useCallback(
    (error: RuleError) => {
      clearRuleError();
      const ledSuit = game?.round.currentTrick.plays[0]?.card.suit;
      const messages: Record<RuleError, string> = {
        'must-follow-suit': ledSuit
          ? copy.errors.mustFollowSuit(copy.suits[ledSuit])
          : copy.errors.wrongPhase,
        'wrong-player': copy.errors.wrongTurn,
        'stale-action': copy.errors.stale,
        'unknown-card': copy.errors.unknownCard,
        'wrong-phase': copy.errors.wrongPhase,
      };
      errorToast.current = toast({ title: messages[error], tone: 'warning' });
    },
    [clearRuleError, game, toast],
  );
  return { clearRuleError, reportRuleError };
}
