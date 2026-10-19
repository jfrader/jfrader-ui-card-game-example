import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadSettings,
  loadStats,
  resetStats,
  saveSettings,
  saveStats,
  type StorageLike,
} from './storage';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('storage', () => {
  it('round-trips valid settings', () => {
    const storage = new MemoryStorage();
    const settings = {
      difficulty: 'hard',
      showLegalHints: false,
      turnTimer: true,
      autoSortHand: false,
    } as const;
    expect(saveSettings(settings, storage)).toBe(true);
    expect(loadSettings(storage)).toEqual({ value: settings, error: null });
  });

  it('falls back to defaults for missing settings without an error', () => {
    expect(loadSettings(new MemoryStorage())).toEqual({ value: DEFAULT_SETTINGS, error: null });
  });

  it('reports invalid settings and keeps defaults', () => {
    const storage = new MemoryStorage();
    storage.setItem(config.storage.settings, '{"difficulty":"impossible"}');
    expect(loadSettings(storage)).toEqual({ value: DEFAULT_SETTINGS, error: 'invalid' });
  });

  it('reports invalid JSON and keeps defaults', () => {
    const storage = new MemoryStorage();
    storage.setItem(config.storage.settings, '{not json');
    expect(loadSettings(storage)).toEqual({ value: DEFAULT_SETTINGS, error: 'invalid' });
  });

  it('reports unavailable storage', () => {
    expect(loadSettings(null)).toEqual({ value: DEFAULT_SETTINGS, error: 'unavailable' });
    expect(saveSettings(DEFAULT_SETTINGS, null)).toBe(false);
  });

  it('round-trips valid stats', () => {
    const storage = new MemoryStorage();
    const stats = { gamesPlayed: 4, gamesWon: 2, lastCountedGameId: 'game-1' };
    expect(saveStats(stats, storage)).toBe(true);
    expect(loadStats(storage)).toEqual({ value: stats, error: null });
  });

  it('rejects negative counters and wins above played', () => {
    const storage = new MemoryStorage();
    storage.setItem(config.storage.stats, JSON.stringify({ gamesPlayed: 1, gamesWon: 2, lastCountedGameId: null }));
    expect(loadStats(storage)).toEqual({ value: DEFAULT_STATS, error: 'invalid' });
    storage.setItem(config.storage.stats, JSON.stringify({ gamesPlayed: -1, gamesWon: 0, lastCountedGameId: null }));
    expect(loadStats(storage)).toEqual({ value: DEFAULT_STATS, error: 'invalid' });
  });

  it('resets stats without touching another key', () => {
    const storage = new MemoryStorage();
    saveStats({ gamesPlayed: 3, gamesWon: 1, lastCountedGameId: 'game-3' }, storage);
    storage.setItem('unrelated', 'keep');
    expect(resetStats(storage)).toBe(true);
    expect(loadStats(storage).value).toEqual(DEFAULT_STATS);
    expect(storage.getItem('unrelated')).toBe('keep');
  });

  it('keeps the pre-paint theme key in sync with the runtime config', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(html).toContain(`'${config.storage.theme}'`);
  });
});
