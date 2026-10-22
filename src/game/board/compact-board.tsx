import type { ReactNode } from 'react';
import { styled } from '@jfrader/ui';
import type { TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { RoundStats, TrumpBadge } from './hud';
import { RoundCall } from './round-call';
import { SeatChip } from './seat-chip';
import { PlayedCard } from './seat-play';
import { feltMaterial, FlowBar, Stage } from './table.styles';

const Felt = styled.div(({ theme: t }) => ({
  ...feltMaterial(t),
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  [`@media (max-width: ${config.breakpoints.feltTwoColumns}px)`]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [`@media (max-width: ${config.breakpoints.feltOneColumn}px)`]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  gap: t.space[2],
  padding: t.space[2],
  borderRadius: t.radius.lg,
  boxShadow: `inset 0 0 ${t.space[8]} ${t.color.scrim}`,
}));

const Column = styled.div(({ theme: t }) => ({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  justifyItems: 'center',
  alignItems: 'end',
  gap: t.space[3],
  minInlineSize: 0,
  paddingBlockEnd: t.space[2],
}));

/** Keeps the round call over the card row, clear of the seat chips. */
const CallLayer = styled.div({
  position: 'absolute',
  insetInline: 0,
  insetBlockEnd: 0,
  blockSize: '50%',
  pointerEvents: 'none',
});

/**
 * Phone table. At this width GameTable's round felt leaves room for 32px plays only
 * (GURI-2719, Give GameTable a compact four-play trick layout), so each player gets a
 * column: seat on top, their card in front of it.
 */
export function CompactBoard({
  view,
  status,
  actions,
  hand,
}: {
  view: TableView;
  status: ReactNode;
  actions: ReactNode;
  hand: ReactNode;
}) {
  return (
    <Stage aria-label={copy.table.regionLabel}>
      <FlowBar>
        <RoundStats view={view} />
        <TrumpBadge view={view} />
      </FlowBar>
      <Felt>
        {view.seats.map((seat) => (
          <Column key={seat.key}>
            <SeatChip seat={seat} view={view} layout="stack" />
            <PlayedCard seat={seat} view={view} from="north" />
          </Column>
        ))}
        <CallLayer>
          <RoundCall view={view} />
        </CallLayer>
      </Felt>
      <FlowBar>
        {status}
        {actions}
      </FlowBar>
      {hand}
    </Stage>
  );
}
