import { createContext, useContext, useId, type ComponentProps } from 'react';
import { GameHand, type GameHandSlots } from '@jfrader/ui/game-hand';
import { ScrollArea } from '@jfrader/ui/scroll-area';
import type { TableView } from '../contracts';
import { copy } from '../content/en';
import { HandCardButton, HandRegion, HandScrollContent } from './table.styles';

const HandRenderContext = createContext({
  legal: new Set<string>(),
  showHints: false,
  reasonId: '',
});

function LegalCard(props: ComponentProps<NonNullable<GameHandSlots['card']>>) {
  const { legal, showHints, reasonId } = useContext(HandRenderContext);
  const id = (props as typeof props & { 'data-hand-card'?: string })['data-hand-card'];
  const illegal = id !== undefined && !legal.has(id);
  return <HandCardButton {...props} data-illegal={illegal} data-hints={showHints}
    aria-disabled={illegal || props['aria-disabled'] || undefined}
    aria-describedby={[props['aria-describedby'], illegal && reasonId].filter(Boolean).join(' ') || undefined}
    onFocus={(event) => {
      props.onFocus?.(event);
      event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }} />;
}

const handSlots: GameHandSlots = { card: LegalCard };

export interface PlayerHandProps {
  view: TableView;
  compact: boolean;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onPlayCard: (id: string) => void;
}

export function PlayerHand({ view, compact, selectedCardId, onSelectCard, onPlayCard }: PlayerHandProps) {
  const headingId = useId();
  const reasonId = useId();
  const instruction =
    view.phase === 'ready'
      ? copy.hand.selectInstruction
      : view.phase === 'trickComplete'
        ? (view.winnerLabel ?? copy.table.waitingForAi)
        : view.phase === 'roundComplete' || view.phase === 'gameComplete'
          ? (view.winnerLabel ?? copy.table.roundResults)
          : view.paused
            ? (view.pauseLabel ?? copy.table.paused)
            : view.canPlay
              ? view.ledSuit
                ? copy.table.followSuit(copy.suits[view.ledSuit])
                : copy.hand.selectInstruction
              : copy.table.waitingForAi;
  const hand = <HandScrollContent><GameHand cards={view.hand} size="md"
    value={selectedCardId} onValueChange={onSelectCard} onPlayIntent={(card) => onPlayCard(card.id)}
    playLabel={copy.hand.playLabel} disabled={!view.canPlay} slots={handSlots} /></HandScrollContent>;
  return <HandRegion aria-labelledby={headingId}>
    <h2 id={headingId} tabIndex={-1}>{copy.hand.regionLabel}</h2>
    <p id={reasonId}>{instruction}</p>
    <HandRenderContext value={{ legal: new Set(view.hand.filter((card) => card.legal).map((card) => card.id)), showHints: view.settings.showLegalHints, reasonId }}>
      {compact ? <ScrollArea orientation="horizontal" scrollbars="native" fade={0}>{hand}</ScrollArea> : hand}
    </HandRenderContext>
  </HandRegion>;
}
