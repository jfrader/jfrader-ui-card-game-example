import { useEffect, useState, useSyncExternalStore } from 'react';
import { config } from '../config';
import { currentPlayer, lowestLegalCard } from '../engine';
import type { GameState, PlayerKey } from '../engine/types';

function createTicker(tickMs: number) {
  let tick = Date.now();
  const listeners = new Set<() => void>();
  let interval: ReturnType<typeof setInterval> | undefined;
  const subscribe = (listener: () => void) => {
    if (listeners.size === 0) {
      tick = Date.now();
      interval = setInterval(() => {
        tick = Date.now();
        for (const notify of listeners) notify();
      }, tickMs);
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) clearInterval(interval);
    };
  };
  return { subscribe, getSnapshot: () => tick };
}

const turnTicker = createTicker(config.timing.statusTickMs);
const idleTicker = createTicker(config.timing.idleTickMs);

interface ClockState {
  readonly turn: string | null;
  readonly paused: boolean;
  readonly deadline: number | null;
  readonly remaining: number;
}

function nextClock(previous: ClockState, turn: string | null, paused: boolean): ClockState {
  let remaining = previous.remaining;
  if (turn !== previous.turn) remaining = config.timing.turnDurationMs;
  else if (previous.deadline !== null) remaining = Math.max(0, previous.deadline - Date.now());
  return { turn, paused, remaining, deadline: turn && !paused ? Date.now() + remaining : null };
}

export function useTurnClock(
  game: GameState | null,
  enabled: boolean,
  paused: boolean,
  playCard: (player: PlayerKey, id: string, automatic: boolean) => boolean,
) {
  const turn =
    enabled && game?.phase === 'playing' && currentPlayer(game) === 'south'
      ? `${game.id}:${game.round.number}:${game.round.currentTrick.number}:${game.round.currentTrick.plays.length}`
      : null;
  const [clock, setClock] = useState<ClockState>(() =>
    nextClock(
      {
        turn: null,
        paused,
        deadline: null,
        remaining: config.timing.turnDurationMs,
      },
      turn,
      paused,
    ),
  );
  let current = clock;
  if (clock.turn !== turn || clock.paused !== paused) {
    current = nextClock(clock, turn, paused);
    setClock(current);
  }
  const deadline = current.deadline;
  const ticker = deadline === null ? idleTicker : turnTicker;
  const now = useSyncExternalStore(ticker.subscribe, ticker.getSnapshot, ticker.getSnapshot);
  useEffect(() => {
    if (deadline === null || !game || paused) return;
    const id = window.setTimeout(
      () => {
        const card = lowestLegalCard(game, 'south');
        if (card) playCard('south', card.id, true);
      },
      Math.max(0, deadline - Date.now()),
    );
    return () => window.clearTimeout(id);
  }, [deadline, game, paused, playCard]);
  return { deadline, now };
}
