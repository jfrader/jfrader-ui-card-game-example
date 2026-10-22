import { styled } from '@jfrader/ui';
import { Avatar } from '@jfrader/ui/avatar';
import { GameSeat } from '@jfrader/ui/game-seat';
import { useGameTableSeat } from '@jfrader/ui/game-table';
import type { SeatView, TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { VisuallyHidden } from '../../ui/styles';

const Seat = styled(GameSeat)(({ theme: t }) => ({
  inlineSize: '12rem',
  blockSize: '5rem',
  '&[data-layout="stack"]': {
    inlineSize: '100%',
    blockSize: '10rem',
    columnGap: t.space[1],
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateRows: '4.5rem auto auto 1.5rem',
    gridTemplateAreas: '"avatar avatar" "name points" "hand hand" "badges badges"',
    '&::before': { display: 'none' },
    '& [data-ui~="game-seat-name"]': { fontSize: t.textSize.xs },
  },
}));

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
      state={seat.active ? 'active' : winner ? 'winner' : 'idle'}
      turned={seat.active}
      offline={false}
      dimmed={false}
      avatar={<Avatar name={seat.name} size="lg" aria-hidden="true" />}
      handCount={seat.handCount}
      handDisplay={seat.isMe ? 'none' : layout === 'stack' ? 'count' : 'fan'}
      formatHandCount={copy.table.cards}
      locale={config.locale}
      turn={turn}
      badges={
        <>
          {seat.dealer && <span>{copy.table.dealer}</span>}
          {!seat.isMe && layout === 'row' && (
            <VisuallyHidden>{copy.table.cards(seat.handCount)}</VisuallyHidden>
          )}
          <VisuallyHidden>
            {seat.active
              ? seat.isMe
                ? copy.table.yourTurn
                : copy.table.playing
              : winner
                ? copy.table.takesTrick
                : ''}
          </VisuallyHidden>
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

export function TableSeat({ view }: { view: TableView }) {
  const { player } = useGameTableSeat<SeatView>();
  return player ? <SeatChip seat={player} view={view} /> : null;
}
