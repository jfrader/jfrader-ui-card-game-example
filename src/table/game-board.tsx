import { GameTable } from '@jfrader/ui/game-table';
import { useMediaQuery } from '../app/use-media-query';
import type { TableCommand, TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { PlayerSeat } from './player-seat';
import { PlayerHand } from './player-hand';
import { TrumpIndicator } from './trump-indicator';
import { RoundStrip } from './round-strip';
import { MobileBoard } from './mobile-board';
import { ReadyScreen, type ReadyScreenProps } from './ready-screen';
import { TableActions, TrickAnnouncement } from './table-actions';
import { BoardFrame, DockSlot, HandDock, TableLayout } from './table.styles';
import { TrickTray } from './trick-tray';

export interface GameBoardProps {
  view: TableView;
  stats: ReadyScreenProps['stats'];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onPlayCard: (id: string) => void;
  onCommand: (command: TableCommand) => void;
}

export function GameBoard(props: GameBoardProps) {
  const { view, stats, selectedCardId, onSelectCard, onPlayCard, onCommand } = props;
  const compact = useMediaQuery(`(max-width: ${config.breakpoints.compactChrome}px)`);

  if (view.phase === 'ready') return <ReadyScreen view={view} stats={stats} onCommand={onCommand} />;
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
          <GameTable.Center><TrickTray view={view} size="lg" surface="felt" /></GameTable.Center>
          <GameTable.Floating><TrickAnnouncement view={view} /></GameTable.Floating>
        </GameTable>
      </BoardFrame>
      <HandDock>
        <DockSlot $align="start"><TrumpIndicator view={view} /></DockSlot>
        <DockSlot $align="center">
          <PlayerHand
            view={view}
            compact={false}
            selectedCardId={selectedCardId}
            onSelectCard={onSelectCard}
            onPlayCard={onPlayCard}
          />
        </DockSlot>
        <DockSlot $align="end"><TableActions view={view} onCommand={onCommand} /></DockSlot>
      </HandDock>
    </TableLayout>
  );
}
