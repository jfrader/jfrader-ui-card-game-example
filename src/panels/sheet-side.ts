import type { DrawerSide } from '@jfrader/ui/drawer';
import { useCompactLayout } from '../app/use-media-query';

/** Drawers rise from the bottom on phones and slide in from the end edge elsewhere. */
export function useSheetSide(): DrawerSide {
  return useCompactLayout() ? 'bottom' : 'inline-end';
}
