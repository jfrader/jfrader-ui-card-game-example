import { Avatar } from '@jfrader/ui/avatar';
import { Pill } from '@jfrader/ui/pill';
import { GameSeat } from '@jfrader/ui/game-seat';
import { useGameTableSeat } from '@jfrader/ui/game-table';
import type { SeatView, TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { SeatFrame } from './table.styles';

export function seatSummary(seat: Pick<SeatView, 'isMe' | 'totalPoints' | 'handCount'>): string {
  return [copy.table.points(seat.totalPoints), seat.isMe ? null : copy.table.cards(seat.handCount)]
    .filter(Boolean)
    .join(' · ');
}

export function PlayerSeat({ view, compact }: { view: TableView; compact: boolean }) {
  const { player } = useGameTableSeat<SeatView>();
  if (!player) return null;
  const turn = player.active && view.deadline !== null && !view.paused
    ? { deadline: view.deadline, durationMs: config.timing.turnDurationMs, now: view.now }
    : undefined;
  return <SeatFrame data-active={player.active} data-compact={compact}>
    <GameSeat name={player.name}
      avatar={!compact ? <Avatar name={player.name} size="sm" aria-hidden="true" /> : undefined}
      badges={<>
        {player.dealer && <Pill>{copy.table.dealer}</Pill>}
        {player.active && <Pill tone="accent">{player.isMe ? copy.table.yourTurn : copy.table.playing}</Pill>}
      </>}
      points={<span>{seatSummary(player)}</span>}
      turn={turn} />
  </SeatFrame>;
}
