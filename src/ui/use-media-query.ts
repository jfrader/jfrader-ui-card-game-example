import { useCallback, useSyncExternalStore } from 'react';
import { config } from '../config';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True at phone widths, where the table, drawers and ready screen switch to their compact form. */
export function useCompactLayout(): boolean {
  return useMediaQuery(`(max-width: ${config.breakpoints.compactChrome}px)`);
}
