import { useState } from 'react';
import { theme } from '@jfrader/ui';
import { GameCardStack } from '@jfrader/ui/game-card-stack';
import { useGameTableSeat } from '@jfrader/ui/game-table';
import type { SeatView, TableView } from '../contracts';
import { copy } from '../content/en';
import { PileFrame } from './table.styles';

export function SeatPile({ view }: { view: TableView }) {
  const { player } = useGameTableSeat<SeatView>();
  const [inspected, setInspected] = useState<string | null>(null);
  if (!player) return null;
  const play = view.plays.find((entry) => entry.playerKey === player.key);
  const label = `${player.name} · ${copy.table.trick(view.trickNumber)}`;
  return <PileFrame>
    <GameCardStack placement="grid" maxCards={1} cardWidth={theme.size.gameCardSm}
      value={inspected} onValueChange={setInspected}
      piles={[{ playerKey: player.key, label, revealed: true,
        cards: play ? [{ id: play.card.id, value: play.card.value, label: `${label} · ${play.card.label}`, order: play.order }] : [],
      }]} />
  </PileFrame>;
}
