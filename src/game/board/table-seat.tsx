import { useGameTableSeat } from '@jfrader/ui/game-table';
import type { SeatView, TableView } from '../../contracts';
import { SeatChip } from './seat-chip';

export function TableSeat({ view }: { view: TableView }) {
  const { player } = useGameTableSeat<SeatView>();
  return player ? <SeatChip seat={player} view={view} /> : null;
}
