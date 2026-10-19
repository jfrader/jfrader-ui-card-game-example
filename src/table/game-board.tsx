import { useEffect, useState } from 'react';
import { GameTable } from '@jfrader/ui/game-table';
import type { TableCommand, TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { PlayerSeat } from './player-seat';
import { SeatPile } from './seat-pile';
import { PlayerHand } from './player-hand';
import { TrumpIndicator } from './trump-indicator';
import { RoundStrip } from './round-strip';
import { MobileBoard } from './mobile-board';
import { TableActions, TrickAnnouncement } from './table-actions';
import { BoardFrame, TableLayout } from './table.styles';

export interface GameBoardProps {
  view: TableView;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onPlayCard: (id: string) => void;
  onCommand: (command: TableCommand) => void;
}

export function GameBoard(props: GameBoardProps) {
  const { view, selectedCardId, onSelectCard, onPlayCard, onCommand } = props;
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${config.breakpoints.compactChrome}px)`);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (compact) return <MobileBoard {...props} />;

  return (
    <TableLayout aria-label={copy.table.regionLabel}>
      <RoundStrip view={view} />
      <BoardFrame>
        <GameTable
          players={4}
          seats={view.seats}
          teamCount={1}
          turnDirection="clockwise"
          surface="match"
          seatPlacement="edge"
          clearance="var(--ui-space-2)"
        >
          <GameTable.Seat><PlayerSeat view={view} compact={false} /></GameTable.Seat>
          <GameTable.Play><SeatPile view={view} /></GameTable.Play>
          <GameTable.Center><TrumpIndicator view={view} /></GameTable.Center>
          <GameTable.Floating><TrickAnnouncement view={view} /></GameTable.Floating>
        </GameTable>
      </BoardFrame>
      <PlayerHand
        view={view}
        compact={false}
        selectedCardId={selectedCardId}
        onSelectCard={onSelectCard}
        onPlayCard={onPlayCard}
      />
      <TableActions view={view} onCommand={onCommand} />
      {view.pauseLabel && <span>{view.pauseLabel}</span>}
    </TableLayout>
  );
}
