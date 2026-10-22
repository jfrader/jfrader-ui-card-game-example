import { styled } from '@jfrader/ui';
import { FlipGameCard } from '@jfrader/ui/flip-game-card';
import { GameCard } from '@jfrader/ui/game-card';
import { Popover } from '@jfrader/ui/popover';
import { useTimedFlag } from '../../app/use-timed-flag';
import type { TableView } from '../../contracts';
import { RED_SUITS } from '../../engine';
import { config } from '../../config';
import { copy, trumpLabel } from '../../content/en';
import { Eyebrow } from '../../ui/styles';
import { SuitIcon } from '../../ui/suit-icon';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const TrumpSlot = styled.div(({ theme: t }) => ({
  '& [data-ui~="popover-trigger"]': {
    paddingBlock: t.space[1],
    paddingInlineStart: t.space[1],
    paddingInlineEnd: t.space[3],
    borderColor: t.color.border,
    backgroundColor: t.color.surface,
  },
}));

const TrumpButton = styled.span(({ theme: t }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: t.space[3],
  textAlign: 'start',
  '& strong': {
    display: 'block',
    fontSize: t.textSize.md,
    fontWeight: t.fontWeight.semibold,
    lineHeight: t.lineHeight.tight,
  },
}));

const TrumpFace = styled.span(({ theme: t }) => ({
  display: 'grid',
  placeItems: 'center',
  blockSize: '100%',
  backgroundColor: t.color.cardFace,
  color: t.color.cardInk,
  '&[data-red="true"]': { color: t.color.cardRed },
}));

export function TrumpBadge({ view }: { view: TableView }) {
  const reduced = prefersReducedMotion();
  const roundTrigger = view.phase !== 'ready' && !reduced ? view.roundNumber : null;
  const flipped = useTimedFlag(roundTrigger, config.timing.trumpFlipMs);

  return (
    <TrumpSlot>
      <Popover
        label={copy.table.trump}
        content={copy.rules.trumpBody}
        triggerLabel={
          <TrumpButton>
            <span aria-hidden="true">
              <FlipGameCard
                size="sm"
                flipped={flipped}
                front={
                  <TrumpFace data-red={view.trump !== null && RED_SUITS.includes(view.trump)}>
                    <SuitIcon suit={view.trump} filled size={16} strokeWidth={2} />
                  </TrumpFace>
                }
                back={<GameCard size="sm" label={copy.a11y.cardBack} face="back" />}
              />
            </span>
            <span>
              <Eyebrow>{copy.table.trump}</Eyebrow>
              <strong>{trumpLabel(view.trump)}</strong>
            </span>
          </TrumpButton>
        }
      />
    </TrumpSlot>
  );
}
