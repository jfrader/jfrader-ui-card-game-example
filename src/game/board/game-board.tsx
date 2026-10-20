import { useId } from 'react';
import { GameTable } from '@jfrader/ui/game-table';
import { useCompactLayout } from '../../ui/use-media-query';
import type { TableCommand, TableView } from '../../contracts';
import type { Difficulty, Stats } from '../../engine/types';
import { copy } from '../../content/en';
import { CompactBoard } from './compact-board';
import { RoundStats, TrumpBadge } from './hud';
import { PlayerHand } from './player-hand';
import { ReadyScreen } from './ready-screen';
import { RoundCall } from './round-call';
import { TableSeat } from './seat-chip';
import { TablePlay } from './seat-play';
import { Board, BoardBar, Dock, Stage } from './table.styles';
import { TableActions, TurnStatus } from './turn-bar';

export interface GameBoardProps {
  view: TableView;
  stats: Stats;
  showScores: boolean;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onPlayCard: (id: string) => void;
  onCommand: (command: TableCommand) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function GameBoard(props: GameBoardProps) {
  const { view, showScores, selectedCardId, onSelectCard, onPlayCard, onCommand } = props;
  const compact = useCompactLayout();
  const statusId = useId();

  if (view.phase === 'ready') {
    return <ReadyScreen view={view} stats={props.stats} onCommand={onCommand} onDifficultyChange={props.onDifficultyChange} />;
  }

  const hand = (
    <Dock>
      <PlayerHand view={view} statusId={statusId} selectedCardId={selectedCardId}
        onSelectCard={onSelectCard} onPlayCard={onPlayCard} onCommand={onCommand} />
    </Dock>
  );
  const status = <TurnStatus id={statusId} view={view} />;
  const actions = <TableActions view={view} showScores={showScores} onCommand={onCommand} />;

  if (compact) return <CompactBoard view={view} status={status} actions={actions} hand={hand} />;

  return (
    <Stage aria-label={copy.table.regionLabel}>
      <Board>
        <BoardBar $edge="start">
          <RoundStats view={view} />
          <TrumpBadge view={view} />
        </BoardBar>
        <GameTable
          players={view.seats.length}
          seats={view.seats}
          teamCount={1}
          turnDirection="clockwise"
          surface="match"
          seatPlacement="edge"
        >
          <GameTable.Seat><TableSeat view={view} /></GameTable.Seat>
          <GameTable.Play><TablePlay view={view} /></GameTable.Play>
          <GameTable.Floating><RoundCall view={view} /></GameTable.Floating>
        </GameTable>
        <BoardBar $edge="end">
          {status}
          {actions}
        </BoardBar>
      </Board>
      {hand}
    </Stage>
  );
}
