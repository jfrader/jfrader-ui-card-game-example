import { styled } from '@jfrader/ui';
import { Avatar } from '@jfrader/ui/avatar';
import { GameSeat } from '@jfrader/ui/game-seat';
import { useGameTableSeat } from '@jfrader/ui/game-table';
import { Pill } from '@jfrader/ui/pill';
import type { SeatView, TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { forcedColors, VisuallyHidden } from '../../ui/styles';

const Chip = styled(GameSeat)(({ theme: t }) => ({
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gridTemplateAreas: '"avatar name points" "avatar badges points"',
  justifyItems: 'start',
  alignItems: 'center',
  columnGap: t.space[2],
  rowGap: 0,
  minInlineSize: 0,
  // Keep the measured seat footprint stable while active/winner pills, points and card
  // counts change. GameTable reserves felt space from this box; a content-sized chip makes
  // the whole table breathe on every play.
  inlineSize: 'clamp(8.25rem, 24vw, 10.5rem)',
  blockSize: '3.75rem',
  overflow: 'hidden',
  paddingBlock: t.space[2],
  paddingInlineStart: t.space[2],
  paddingInlineEnd: t.space[3],
  border: `1px solid ${t.color.border}`,
  borderRadius: t.radius.full,
  backgroundColor: t.color.surfaceRaised,
  boxShadow: t.shadow.raised,
  '& [data-ui~="game-seat-avatar"]': { gridArea: 'avatar' },
  '& [data-ui~="game-seat-name"]': {
    gridArea: 'name',
    fontSize: t.textSize.sm,
    lineHeight: t.lineHeight.tight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& [data-ui~="game-seat-badges"]': {
    gridArea: 'badges',
    justifyContent: 'start',
    flexWrap: 'nowrap',
    color: t.color.textMuted,
    fontSize: t.textSize.xs,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  '& [data-ui~="game-seat-points"]': {
    gridArea: 'points',
    justifySelf: 'end',
    paddingInlineStart: t.space[2],
    fontSize: t.textSize.lg,
    fontWeight: t.fontWeight.semibold,
    fontVariantNumeric: 'tabular-nums',
  },
  '&[data-layout="stack"]': {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateAreas: '"avatar avatar" "name points" "badges badges"',
    rowGap: t.space[1],
    inlineSize: '100%',
    blockSize: '6rem',
    padding: t.space[2],
    borderRadius: t.radius.md,
    '& [data-ui~="game-seat-avatar"]': { gridArea: 'avatar', justifySelf: 'center' },
    '& [data-ui~="game-seat-name"]': { overflow: 'hidden', textOverflow: 'ellipsis', maxInlineSize: '100%' },
    '& [data-ui~="game-seat-points"]': { fontSize: t.textSize.md, paddingInlineStart: t.space[1] },
    '& [data-ui~="game-seat-badges"]': { minBlockSize: t.space[5] },
  },
  '&[data-state="active"]': { borderColor: t.color.accent, boxShadow: `0 0 0 1px ${t.color.accent}` },
  '&[data-state="winner"]': { borderColor: t.color.success, boxShadow: `0 0 0 1px ${t.color.success}` },
  [forcedColors]: {
    '&[data-state="active"], &[data-state="winner"]': { outline: '2px solid Highlight', outlineOffset: 2 },
  },
}));

/** Row chips have room for dealer and card count; stacked phone chips show the dealer first. */
function seatMeta(seat: SeatView, layout: 'row' | 'stack'): string {
  const parts = [seat.dealer ? copy.table.dealer : null, seat.isMe ? null : copy.table.cards(seat.handCount)].filter(Boolean);
  return (layout === 'stack' ? parts.slice(0, 1) : parts).join(' · ');
}

export function SeatChip({ seat, view, layout = 'row' }: { seat: SeatView; view: TableView; layout?: 'row' | 'stack' }) {
  const winner = view.winnerKey === seat.key;
  const state = seat.active ? 'active' : winner ? 'winner' : undefined;
  const turn = seat.active && seat.isMe && view.deadline !== null && !view.paused
    ? { deadline: view.deadline, durationMs: config.timing.turnDurationMs, now: view.now }
    : undefined;
  const meta = seatMeta(seat, layout);
  return (
    <Chip
      name={seat.name}
      data-state={state}
      data-layout={layout}
      avatar={<Avatar name={seat.name} size="sm" aria-hidden="true" />}
      turn={turn}
      badges={
        <>
          {state === 'active' && <Pill tone="accent">{seat.isMe ? copy.table.yourTurn : copy.table.playing}</Pill>}
          {state === 'winner' && <Pill tone="success">{copy.table.takesTrick}</Pill>}
          {!state && meta && <span>{meta}</span>}
        </>
      }
      points={<>{seat.totalPoints}<VisuallyHidden>{` ${copy.table.pointWord(seat.totalPoints)}`}</VisuallyHidden></>}
    />
  );
}

export function TableSeat({ view }: { view: TableView }) {
  const { player } = useGameTableSeat<SeatView>();
  return player ? <SeatChip seat={player} view={view} /> : null;
}
