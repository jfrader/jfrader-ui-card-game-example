import { useCallback, useEffect, useState } from 'react';
import { copy } from '../content/en';

export type PauseReason = 'manual' | 'modal' | 'route' | 'hidden';

export interface PauseState {
  readonly paused: boolean;
  readonly pauseLabel: string | null;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly setRoutePaused: (paused: boolean) => void;
}

/**
 * Owns every reason the match can be paused. Modal dialogs and route changes add and remove
 * their own reason; a hidden tab stays paused until the user explicitly resumes.
 */
export function usePauseState(anyDialog: boolean): PauseState {
  const [reasons, setReasons] = useState<ReadonlySet<PauseReason>>(() => new Set());

  const addReason = useCallback((reason: PauseReason) => {
    setReasons((previous) => {
      if (previous.has(reason)) return previous;
      const next = new Set(previous);
      next.add(reason);
      return next;
    });
  }, []);

  const removeReason = useCallback((reason: PauseReason) => {
    setReasons((previous) => {
      if (!previous.has(reason)) return previous;
      const next = new Set(previous);
      next.delete(reason);
      return next;
    });
  }, []);

  const pause = useCallback(() => addReason('manual'), [addReason]);
  const resume = useCallback(() => setReasons(new Set()), []);

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

  const paused = reasons.size > 0;
  const pauseLabel = reasons.has('manual')
    ? copy.pause.manual
    : reasons.has('modal')
      ? copy.pause.modal
      : reasons.has('route')
        ? copy.pause.route
        : reasons.has('hidden')
          ? copy.pause.hidden
          : null;

  return { paused, pauseLabel, pause, resume, setRoutePaused };
}
