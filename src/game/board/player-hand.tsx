import { useId, useMemo } from 'react';
import { Button, styled } from '@jfrader/ui';
import { GameHand } from '@jfrader/ui/game-hand';
import { ScrollArea } from '@jfrader/ui/scroll-area';
import type { TableCommand, TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { phone, VisuallyHidden } from '../../ui/styles';
import { HandContext, handSlots, type HandState } from './hand-card';

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
    marginInline: `calc(-1 * ${t.space[4]})`,
    '& [data-ui~="game-hand"]': { flexDirection: 'column', gap: t.space[2] },
  },
}));

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

export function PlayerHand({
  view,
  statusId,
  selectedCardId,
  onSelectCard,
  onPlayCard,
  onCommand,
}: PlayerHandProps) {
  const headingId = useId();
  const state = useMemo<HandState>(
    () => ({
      available: new Set(view.hand.filter((card) => card.legal).map((card) => card.id)),
      darkenUnavailable: view.canPlay && view.settings.showLegalHints,
      describedBy: statusId,
    }),
    [view.hand, view.canPlay, view.settings.showLegalHints, statusId],
  );

  return (
    <Frame aria-labelledby={headingId} data-advance={view.advance !== null}>
      <VisuallyHidden as="h2" id={headingId}>
        {copy.hand.regionLabel}
      </VisuallyHidden>
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
