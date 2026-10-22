import { useGameTableSeat } from '@jfrader/ui/game-table';
import type { SeatView, TableView } from '../../contracts';
import { PlayedCard } from './played-card';

export function TablePlay({ view }: { view: TableView }) {
  const { player } = useGameTableSeat<SeatView>();
  return player ? <PlayedCard seat={player} view={view} /> : null;
}
