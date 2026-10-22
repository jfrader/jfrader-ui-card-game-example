import type { CSSProperties } from 'react';
import { styled } from '@jfrader/ui';
import { GameCard, type GameCardSize, type GameCardValue } from '@jfrader/ui/game-card';
import { reducedMotionOff } from '../../ui/styles';

export const FAN: readonly GameCardValue[] = [
  { deck: 'french', suit: 'spades', rank: 'A' },
  { deck: 'french', suit: 'hearts', rank: 'K' },
  { deck: 'french', suit: 'diamonds', rank: 'Q' },
  { deck: 'french', suit: 'clubs', rank: 'J' },
  { deck: 'french', suit: 'hearts', rank: '10' },
];

export const FAN_SPREAD_DEG = 8;

export const Fan = styled.div(({ theme: t }) => ({
  display: 'flex',
  justifyContent: 'center',
  paddingBlockEnd: t.space[2],
  '--fan-card': t.size.gameCardLg,
  '&[data-size="md"]': { '--fan-card': t.size.gameCardMd },
  '& > *': {
    marginInline: `calc(var(--fan-card) * -0.16)`,
    transformOrigin: '50% 150%',
    transform: 'rotate(calc((var(--fan-index) - 2) * var(--fan-spread)))',
    boxShadow: t.shadow.overlay,
    [reducedMotionOff]: {
      animation: `fan-in ${t.motion.duration.cardDeal} ${t.motion.easeStandard} both`,
      animationDelay: `calc(var(--fan-index) * ${t.motion.duration.cardDealStagger})`,
    },
  },
  '@keyframes fan-in': { from: { opacity: 0, transform: `translateY(${t.space[6]}) rotate(0deg)` } },
}));

export function CardFan({ size }: { size: GameCardSize }) {
  return (
    <Fan aria-hidden="true" data-size={size}>
      {FAN.map((value, index) => (
        <GameCard
          key={`${value.suit}-${value.rank}`}
          size={size}
          label={`${value.rank} ${value.suit}`}
          value={value}
          style={{ '--fan-index': index, '--fan-spread': `${FAN_SPREAD_DEG}deg` } as CSSProperties}
        />
      ))}
    </Fan>
  );
}
