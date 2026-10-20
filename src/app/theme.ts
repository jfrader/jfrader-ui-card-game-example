import { useCallback, useEffect, useState } from 'react';
import { config } from '../config';

export type Theme = 'light' | 'dark';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(config.storage.theme);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(config.storage.theme, next);
    } catch {
      // Storage is optional; the in-memory choice still applies for this visit.
    }
  }, []);

  return { theme, setTheme };
}
