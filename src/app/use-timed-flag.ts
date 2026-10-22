import { useEffect, useState } from 'react';

/**
 * True while `trigger` has changed within the last `durationMs`.
 *
 * The reveal is derived from the trigger itself; the effect only schedules the expiry, so the
 * caller never stores "is it playing" state. Triggers are expected to advance monotonically
 * (round numbers, turn ids), which is what every caller does.
 */
export function useTimedFlag(trigger: number | string | null, durationMs: number): boolean {
  const [settled, setSettled] = useState<number | string | null>(null);

  useEffect(() => {
    if (trigger === null) return;
    const timeout = window.setTimeout(() => setSettled(trigger), durationMs);
    return () => window.clearTimeout(timeout);
  }, [trigger, durationMs]);

  return trigger !== null && trigger !== settled;
}
