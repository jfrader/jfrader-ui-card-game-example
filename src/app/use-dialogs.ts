import { useCallback, useState } from 'react';

import type { DialogKey } from '../contracts';

export type { DialogKey } from '../contracts';
const EMPTY_DIALOGS: Record<DialogKey, boolean> = {
  rules: false,
  settings: false,
  newGame: false,
  results: false,
  scores: false,
};

interface DialogControls {
  readonly dialogs: Record<DialogKey, boolean>;
  openDialog: (key: DialogKey) => void;
  closeDialog: (key: DialogKey) => void;
}

export function dialogBinding(controls: DialogControls, key: DialogKey) {
  return {
    open: controls.dialogs[key],
    onOpenChange: (open: boolean) => {
      if (open) controls.openDialog(key);
      else controls.closeDialog(key);
    },
  };
}

export function useDialogs(inlineScores: boolean) {
  const [dialogs, setDialogs] = useState({ ...EMPTY_DIALOGS });
  if (inlineScores && dialogs.scores) {
    setDialogs({ ...dialogs, scores: false });
  }
  const openDialog = useCallback(
    (key: DialogKey) => {
      if (key === 'scores' && inlineScores) {
        document.getElementById('score-rail')?.focus();
        return;
      }
      setDialogs((previous) => ({ ...previous, [key]: true }));
    },
    [inlineScores],
  );
  const closeDialog = useCallback((key: DialogKey) => {
    setDialogs((previous) => ({ ...previous, [key]: false }));
  }, []);
  const resetDialogs = useCallback(() => setDialogs({ ...EMPTY_DIALOGS }), []);
  const controls = { dialogs, openDialog, closeDialog };
  const binding = (key: DialogKey) => dialogBinding(controls, key);
  return { ...controls, binding, resetDialogs, anyDialog: Object.values(dialogs).some(Boolean) };
}
