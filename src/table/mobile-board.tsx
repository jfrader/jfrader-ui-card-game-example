import { Avatar } from '@jfrader/ui/avatar';
import { GameSeat } from '@jfrader/ui/game-seat';
import { Pill } from '@jfrader/ui/pill';
import { styled } from '@jfrader/ui';
import type { GameBoardProps } from './game-board';
import type { SeatView } from '../contracts';
import { copy } from '../content/en';
import { PlayerHand } from './player-hand';
import { RoundStrip } from './round-strip';
import { TableActions, TrickAnnouncement } from './table-actions';
import { TableLayout } from './table.styles';
import { TrickTray } from './trick-tray';

const MobileTable = styled.div(({ theme }) => ({
  display: 'grid',
  gap: theme.space[3],
  minInlineSize: 0,
}));

const Opponents = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.space[2],
  minInlineSize: 0,
}));

const MobileSeatFrame = styled.div(({ theme }) => ({
  minInlineSize: 0,
  padding: theme.space[1],
  border: `1px solid ${theme.color.borderSubtle}`,
  borderRadius: theme.radius.md,
  backgroundColor: theme.color.surface,
  '&[data-active="true"]': { outline: `2px solid ${theme.color.accent}`, outlineOffset: -2 },
  '&[data-self="true"]': { backgroundColor: theme.color.surfaceRaised },
  '& [data-ui~="game-seat"]': { fontSize: theme.textSize.xs },
  '& [data-ui~="game-seat-name"]': { fontSize: theme.textSize.xs },
}));

const TrickBand = styled.div(({ theme }) => ({
  position: 'relative',
  paddingBlock: theme.space[3],
  paddingInline: theme.space[2],
  borderRadius: theme.radius.md,
  backgroundColor: theme.color.surface,
  minInlineSize: 0,
}));

function MobileSeat({ seat }: { seat: SeatView }) {
  return (
    <MobileSeatFrame data-active={seat.active} data-self={seat.isMe}>
      <GameSeat
        name={seat.name}
        avatar={<Avatar name={seat.name} size="sm" aria-hidden="true" />}
        badges={
          <>
            {seat.dealer && <Pill>{copy.table.dealer}</Pill>}
            {seat.active && <Pill tone="accent">{seat.isMe ? copy.table.yourTurn : copy.table.playing}</Pill>}
          </>
        }
        points={<span>{copy.table.points(seat.totalPoints)}</span>}
        hand={seat.isMe ? undefined : <span>{copy.table.cards(seat.handCount)}</span>}
      />
    </MobileSeatFrame>
  );
}

export function MobileBoard({
  view,
  selectedCardId,
  onSelectCard,
  onPlayCard,
  onCommand,
}: GameBoardProps) {
  const opponents = view.seats.filter((seat) => !seat.isMe);
  const me = view.seats.find((seat) => seat.isMe);
  return (
    <TableLayout aria-label={copy.table.regionLabel}>
      <RoundStrip view={view} compact />
      <MobileTable>
        <Opponents>
          {opponents.map((seat) => <MobileSeat key={seat.key} seat={seat} />)}
        </Opponents>
        <TrickBand>
          <TrickTray view={view} size="md">
            <TrickAnnouncement view={view} />
          </TrickTray>
        </TrickBand>
        {me && <MobileSeat seat={me} />}
        <PlayerHand
          view={view}
          compact
          selectedCardId={selectedCardId}
          onSelectCard={onSelectCard}
          onPlayCard={onPlayCard}
        />
        <TableActions view={view} onCommand={onCommand} />
      </MobileTable>
      {view.pauseLabel && <span>{view.pauseLabel}</span>}
    </TableLayout>
  );
}
