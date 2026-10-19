import { useEffect, useState } from 'react';
import { config } from '../config';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** True at phone widths, where the table, drawers and ready screen switch to their compact form. */
export function useCompactLayout(): boolean {
  return useMediaQuery(`(max-width: ${config.breakpoints.compactChrome}px)`);
}
