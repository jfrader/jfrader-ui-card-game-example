import { config } from '../config';
import type { Settings, Stats } from '../engine/types';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StorageError = 'unavailable' | 'invalid';

export interface LoadResult<T> {
  readonly value: T;
  readonly error: StorageError | null;
}

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'normal',
  showLegalHints: true,
  turnTimer: false,
  autoSortHand: true,
};

export const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  lastCountedGameId: null,
};

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readJson(storage: StorageLike | null, key: string): unknown {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  return (
    (value.difficulty === 'easy' || value.difficulty === 'normal' || value.difficulty === 'hard') &&
    isBoolean(value.showLegalHints) &&
    isBoolean(value.turnTimer) &&
    isBoolean(value.autoSortHand)
  );
}

export function isStats(value: unknown): value is Stats {
  if (!isRecord(value)) return false;
  return (
    isCount(value.gamesPlayed) &&
    isCount(value.gamesWon) &&
    value.gamesWon <= value.gamesPlayed &&
    (value.lastCountedGameId === null || typeof value.lastCountedGameId === 'string')
  );
}

export function loadSettings(storage: StorageLike | null = defaultStorage()): LoadResult<Settings> {
  if (!storage) return { value: DEFAULT_SETTINGS, error: 'unavailable' };
  const raw = readJson(storage, config.storage.settings);
  if (raw === null) return { value: DEFAULT_SETTINGS, error: null };
  return isSettings(raw)
    ? { value: raw, error: null }
    : { value: DEFAULT_SETTINGS, error: 'invalid' };
}

export function saveSettings(settings: Settings, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(config.storage.settings, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function loadStats(storage: StorageLike | null = defaultStorage()): LoadResult<Stats> {
  if (!storage) return { value: DEFAULT_STATS, error: 'unavailable' };
  const raw = readJson(storage, config.storage.stats);
  if (raw === null) return { value: DEFAULT_STATS, error: null };
  return isStats(raw) ? { value: raw, error: null } : { value: DEFAULT_STATS, error: 'invalid' };
}

export function saveStats(stats: Stats, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(config.storage.stats, JSON.stringify(stats));
    return true;
  } catch {
    return false;
  }
}

export function resetStats(storage: StorageLike | null = defaultStorage()): boolean {
  return saveStats(DEFAULT_STATS, storage);
}

export function loadNoticeDismissed(storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(config.storage.notice) === 'dismissed';
  } catch {
    return false;
  }
}

export function saveNoticeDismissed(storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(config.storage.notice, 'dismissed');
    return true;
  } catch {
    return false;
  }
}
