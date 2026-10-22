import { styled } from '@jfrader/ui';
import { Avatar } from '@jfrader/ui/avatar';
import { GameSeat } from '@jfrader/ui/game-seat';
import type { SeatView, TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { VisuallyHidden } from '../../ui/styles';

const SEAT_ROW_INLINE = '12rem';
const SEAT_ROW_BLOCK = '5rem';
const SEAT_STACK_BLOCK = '10rem';
const SEAT_STACK_AVATAR_BLOCK = '4.5rem';
const SEAT_STACK_BADGES_BLOCK = '1.5rem';

const Seat = styled(GameSeat)(({ theme: t }) => ({
  inlineSize: SEAT_ROW_INLINE,
  blockSize: SEAT_ROW_BLOCK,
  '&[data-layout="stack"]': {
    inlineSize: '100%',
    blockSize: SEAT_STACK_BLOCK,
    columnGap: t.space[1],
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateRows: `${SEAT_STACK_AVATAR_BLOCK} auto auto ${SEAT_STACK_BADGES_BLOCK}`,
    gridTemplateAreas: '"avatar avatar" "name points" "hand hand" "badges badges"',
    '&::before': { display: 'none' },
    '& [data-ui~="game-seat-name"]': { fontSize: t.textSize.xs },
  },
}));

function getSeatState(active: boolean, winner: boolean): 'active' | 'winner' | 'idle' {
  if (active) return 'active';
  if (winner) return 'winner';
  return 'idle';
}

function getHandDisplay(isMe: boolean, layout: 'row' | 'stack'): 'none' | 'count' | 'fan' {
  if (isMe) return 'none';
  if (layout === 'stack') return 'count';
  return 'fan';
}

function getStatusBadge(active: boolean, isMe: boolean, winner: boolean): string {
  if (active) {
    return isMe ? copy.table.yourTurn : copy.table.playing;
  }
  if (winner) {
    return copy.table.takesTrick;
  }
  return '';
}

export function SeatChip({
  seat,
  view,
  layout = 'row',
}: {
  seat: SeatView;
  view: TableView;
  layout?: 'row' | 'stack';
}) {
  const winner = view.winnerKey === seat.key;
  const turn =
    seat.active && seat.isMe && view.deadline !== null && !view.paused
      ? { remainingMs: Math.max(0, view.deadline - view.now), durationMs: config.timing.turnDurationMs }
      : undefined;

  return (
    <Seat
      name={seat.name}
      data-layout={layout}
      state={getSeatState(seat.active, winner)}
      turned={seat.active}
      offline={false}
      dimmed={false}
      avatar={<Avatar name={seat.name} size="lg" aria-hidden="true" />}
      handCount={seat.handCount}
      handDisplay={getHandDisplay(seat.isMe, layout)}
      formatHandCount={copy.table.cards}
      locale={config.locale}
      turn={turn}
      badges={
        <>
          {seat.dealer && <span>{copy.table.dealer}</span>}
          {!seat.isMe && layout === 'row' && (
            <VisuallyHidden>{copy.table.cards(seat.handCount)}</VisuallyHidden>
          )}
          <VisuallyHidden>{getStatusBadge(seat.active, seat.isMe, winner)}</VisuallyHidden>
        </>
      }
      points={
        <>
          {seat.totalPoints}
          <VisuallyHidden>{` ${copy.table.pointWord(seat.totalPoints)}`}</VisuallyHidden>
        </>
      }
    />
  );
}
