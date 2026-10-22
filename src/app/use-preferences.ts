import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@jfrader/ui/toast';
import { copy } from '../content/en';
import { scoreGame } from '../engine';
import type { GameState, Settings, Stats } from '../engine/types';
import { DEFAULT_STATS, loadSettings, loadStats, saveSettings, saveStats } from './storage';

export function usePreferences() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(() => loadSettings().value);
  const [stats, setStats] = useState<Stats>(() => loadStats().value);
  const statsRef = useRef(stats);
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    if (loadSettings().error || loadStats().error) {
      toast({ title: copy.toast.storageWarning, tone: 'warning' });
    }
  }, [toast]);
  const updateSettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      if (!saveSettings(next)) toast({ title: copy.toast.storageWarning, tone: 'warning' });
    },
    [toast],
  );
  const countGame = useCallback(
    (game: GameState) => {
      const previous = statsRef.current;
      if (game.phase !== 'gameComplete' || previous.lastCountedGameId === game.id) return;
      const next: Stats = {
        gamesPlayed: previous.gamesPlayed + 1,
        gamesWon: previous.gamesWon + Number(scoreGame(game).outcome === 'won'),
        lastCountedGameId: game.id,
      };
      statsRef.current = next;
      setStats(next);
      if (!saveStats(next)) toast({ title: copy.toast.storageWarning, tone: 'warning' });
    },
    [toast],
  );
  const resetStatsFor = useCallback(
    async (game: GameState | null) => {
      if (game && game.phase !== 'gameComplete') return;
      const next = { ...DEFAULT_STATS, lastCountedGameId: game?.id ?? null };
      if (!saveStats(next)) {
        toast({ title: copy.toast.storageWarning, tone: 'danger' });
        throw new Error(copy.settings.resetStatsError);
      }
      statsRef.current = next;
      setStats(next);
    },
    [toast],
  );
  return { settings, stats, updateSettings, countGame, resetStatsFor };
}
