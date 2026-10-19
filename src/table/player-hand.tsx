import { createContext, useContext, useId, useMemo, type ComponentProps } from 'react';
import { Button, styled } from '@jfrader/ui';
import { GameHand, type GameHandSlots } from '@jfrader/ui/game-hand';
import { ScrollArea } from '@jfrader/ui/scroll-area';
import type { TableCommand, TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { phone, reducedMotionOff, VisuallyHidden } from '../styles';

interface HandState {
  readonly available: ReadonlySet<string>;
  readonly darkenUnavailable: boolean;
  readonly describedBy: string | undefined;
}

const HandContext = createContext<HandState>({ available: new Set(), darkenUnavailable: false, describedBy: undefined });

const CardButton = styled.button(({ theme: t }) => ({
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

function HandCard(props: ComponentProps<NonNullable<GameHandSlots['card']>>) {
  const { available, darkenUnavailable, describedBy } = useContext(HandContext);
  const id = (props as typeof props & { 'data-hand-card'?: string })['data-hand-card'];
  const unavailable = id !== undefined && !available.has(id);
  return (
    <CardButton
      {...props}
      data-available={!unavailable}
      data-darken={unavailable && darkenUnavailable}
      aria-disabled={unavailable || props['aria-disabled'] || undefined}
      aria-describedby={[props['aria-describedby'], unavailable && describedBy].filter(Boolean).join(' ') || undefined}
    />
  );
}

const handSlots: GameHandSlots = { card: HandCard };

const Frame = styled.section(({ theme: t }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: t.space[4],
  minInlineSize: 0,
  minBlockSize: `calc(${t.size.gameCardMd} * ${config.layout.gameCardAspect} + 2 * ${t.space[4]})`,
  '& [data-ui~="game-hand"]': { flexDirection: 'row', gap: t.space[4] },
  '&[data-advance="true"] [data-ui~="game-hand-confirm"]': { display: 'none' },
  [phone]: {
    flexDirection: 'column',
    gap: t.space[2],
    minBlockSize: 0,
    // The fan's side padding leaves room for its rotated corners; bleed to the screen edge to fit it.
    marginInline: `calc(-1 * ${t.space[4]})`,
    '& [data-ui~="game-hand"]': { flexDirection: 'column', gap: t.space[2] },
  },
}));

/** Scrolls the fan sideways only when it is wider than the screen (narrow phones, high zoom). */
const HandViewport = styled(ScrollArea)({
  minInlineSize: 0,
  maxInlineSize: '100%',
});

export interface PlayerHandProps {
  view: TableView;
  statusId: string;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onPlayCard: (id: string) => void;
  onCommand: (command: TableCommand) => void;
}

export function PlayerHand({ view, statusId, selectedCardId, onSelectCard, onPlayCard, onCommand }: PlayerHandProps) {
  const headingId = useId();
  const state = useMemo<HandState>(() => ({
    available: new Set(view.hand.filter((card) => card.legal).map((card) => card.id)),
    darkenUnavailable: view.canPlay && view.settings.showLegalHints,
    describedBy: statusId,
  }), [view.hand, view.canPlay, view.settings.showLegalHints, statusId]);

  return (
    <Frame aria-labelledby={headingId} data-advance={view.advance !== null}>
      <VisuallyHidden as="h2" id={headingId}>{copy.hand.regionLabel}</VisuallyHidden>
      <HandContext value={state}>
        <HandViewport orientation="horizontal" scrollbars="native" fade={0}>
          <GameHand
            cards={view.hand}
            size="md"
            value={selectedCardId}
            onValueChange={onSelectCard}
            onPlayIntent={(card) => onPlayCard(card.id)}
            playLabel={copy.hand.playLabel}
            slots={handSlots}
          />
        </HandViewport>
      </HandContext>
      {view.advance && view.advanceLabel && (
        <Button type="button" onClick={() => onCommand(view.advance === 'continue' ? 'continue' : 'results')}>
          {view.advanceLabel}
        </Button>
      )}
    </Frame>
  );
}
