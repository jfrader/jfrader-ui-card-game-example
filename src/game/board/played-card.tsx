import { styled } from '@jfrader/ui';
import { GameCard, type GameCardSize } from '@jfrader/ui/game-card';
import type { SeatView, TableView } from '../../contracts';
import type { PlayerKey } from '../../engine/types';
import { copy } from '../../content/en';
import { forcedColors, reducedMotionOff } from '../../ui/styles';

const Slot = styled.div(({ theme: t }) => ({
  display: 'grid',
  justifyItems: 'center',
  borderRadius: t.radius.sm,
  transitionProperty: 'scale',
  transitionDuration: t.motion.duration.base,
  transitionTimingFunction: t.motion.easeStandard,
  '&[data-from="south"]': { '--enter-y': t.space[10] },
  '&[data-from="north"]': { '--enter-y': `calc(-1 * ${t.space[10]})` },
  '&[data-from="west"]': { '--enter-x': `calc(-1 * ${t.space[10]})` },
  '&[data-from="east"]': { '--enter-x': t.space[10] },
  [reducedMotionOff]: {
    '&[data-played="true"]': {
      animation: `play-enter ${t.motion.duration.cardPlay} ${t.motion.easeStandard} both`,
    },
  },
  '@keyframes play-enter': {
    from: { opacity: 0, transform: 'translate(var(--enter-x, 0), var(--enter-y, 0)) scale(0.92)' },
  },
  '&[data-winner="true"]': { position: 'relative', zIndex: 1, scale: 1.04 },
  '&[data-winner="true"] > [data-ui~="game-card"]': {
    outline: `3px solid ${t.color.success}`,
    outlineOffset: 3,
    boxShadow: t.shadow.floating,
  },
  '@media (prefers-reduced-motion: reduce)': { transitionDuration: '0s' },
  [forcedColors]: {
    '&[data-winner="true"] > [data-ui~="game-card"]': { outlineColor: 'Highlight' },
  },
}));

const Placeholder = styled.div({ visibility: 'hidden' });

export function PlayedCard({
  seat,
  view,
  from = seat.key,
  size = 'md',
}: {
  seat: SeatView;
  view: TableView;
  from?: PlayerKey;
  size?: GameCardSize;
}) {
  const play = view.plays.find((entry) => entry.playerKey === seat.key);
  if (!play) {
    return (
      <Slot data-from={from}>
        <Placeholder aria-hidden="true">
          <GameCard size={size} label={copy.table.emptyPlay(seat.name)} face="back" />
        </Placeholder>
      </Slot>
    );
  }
  return (
    <Slot data-from={from} data-played="true" data-winner={view.winnerKey === seat.key}>
      <GameCard
        size={size}
        label={copy.table.playedCard(seat.name, play.card.label)}
        value={play.card.value}
      />
    </Slot>
  );
}
