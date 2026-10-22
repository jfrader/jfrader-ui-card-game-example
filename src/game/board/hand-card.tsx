import { createContext, useContext, type ComponentProps } from 'react';
import { styled } from '@jfrader/ui';
import type { GameHandSlots } from '@jfrader/ui/game-hand';
import { reducedMotionOff } from '../../ui/styles';

export interface HandState {
  readonly available: ReadonlySet<string>;
  readonly darkenUnavailable: boolean;
  readonly describedBy: string | undefined;
}

export const HandContext = createContext<HandState>({
  available: new Set(),
  darkenUnavailable: false,
  describedBy: undefined,
});

export const CardButton = styled.button(({ theme: t }) => ({
  [reducedMotionOff]: {
    transitionProperty: 'translate, filter',
    transitionDuration: t.motion.duration.base,
    transitionTimingFunction: t.motion.easeStandard,
  },
  '&[data-available="true"]:hover:not([aria-pressed="true"])': { translate: `0 calc(-1 * ${t.space[1]})` },
  '&[data-darken="true"]': { translate: `0 ${t.space[2]}`, cursor: 'not-allowed' },
  '&[data-darken="true"] > [data-ui~="game-card"]': { filter: 'brightness(0.74)' },
  '&:focus-visible': { outline: `2px solid ${t.color.focusRing}`, outlineOffset: t.space[1] },
}));

type HandCardSlotProps = ComponentProps<NonNullable<GameHandSlots['card']>>;

type HandCardWithDataProps = HandCardSlotProps & {
  readonly 'data-hand-card'?: string;
};

export function HandCard(props: HandCardSlotProps) {
  const { available, darkenUnavailable, describedBy } = useContext(HandContext);
  const { 'data-hand-card': id } = props as HandCardWithDataProps;
  const unavailable = id !== undefined && !available.has(id);
  return (
    <CardButton
      {...props}
      data-available={!unavailable}
      data-darken={unavailable && darkenUnavailable}
      aria-disabled={unavailable || props['aria-disabled'] || undefined}
      aria-describedby={
        [props['aria-describedby'], unavailable && describedBy].filter(Boolean).join(' ') || undefined
      }
    />
  );
}

export const handSlots: GameHandSlots = { card: HandCard };
