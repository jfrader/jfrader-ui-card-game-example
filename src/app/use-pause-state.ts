import { useCallback, useEffect, useState } from 'react';
import { copy } from '../content/en';

export function usePauseState(anyDialog: boolean, routePaused: boolean) {
  const [manual, setManual] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const pause = useCallback(() => setManual(true), []);
  const resume = useCallback(() => {
    setManual(false);
    setHidden(false);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) setHidden(true);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const reasons = [
    { active: manual, label: copy.pause.manual },
    { active: anyDialog, label: copy.pause.modal },
    { active: routePaused, label: copy.pause.route },
    { active: hidden, label: copy.pause.hidden },
  ];
  const pauseLabel = reasons.find((reason) => reason.active)?.label ?? null;
  return { paused: pauseLabel !== null, pauseLabel, pause, resume };
}
