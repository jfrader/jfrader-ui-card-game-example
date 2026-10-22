import { useEffect, useState } from 'react';
import { styled } from '@jfrader/ui';
import { FlipGameCard } from '@jfrader/ui/flip-game-card';
import { GameCard } from '@jfrader/ui/game-card';
import { GameMarks } from '@jfrader/ui/game-marks';
import { Popover } from '@jfrader/ui/popover';
import type { TableView } from '../../contracts';
import { RED_SUITS } from '../../engine';
import { config } from '../../config';
import { copy, trumpLabel } from '../../content/en';
import { Eyebrow, visuallyHidden } from '../../ui/styles';
import { SuitIcon } from '../../ui/suit-icon';

const Stats = styled.dl(({ theme: t }) => ({
  display: 'flex',
  gap: t.space[5],
  margin: 0,
  '& > div': { display: 'grid', gap: t.space[1] },
  '& dd': {
    margin: 0,
    fontSize: t.textSize.lg,
    fontWeight: t.fontWeight.semibold,
    lineHeight: t.lineHeight.tight,
    fontVariantNumeric: 'tabular-nums',
  },
}));

const Of = styled.span(({ theme: t }) => ({ color: t.color.textMuted, fontWeight: t.fontWeight.regular }));

export function RoundStats({ view }: { view: TableView }) {
  return (
    <Stats aria-label={copy.a11y.hudRegion}>
      <div>
        <Eyebrow as="dt">{copy.table.hudRound}</Eyebrow>
        <dd>
          {view.roundNumber}
          <Of>/{view.roundCount}</Of>
        </dd>
      </div>
      <div>
        <Eyebrow as="dt">{copy.table.hudTrick}</Eyebrow>
        <dd>
          {Math.min(view.trickNumber, view.trickCount)}
          <Of>/{view.trickCount}</Of>
        </dd>
        <dd>
          <GameMarks
            surface="transparent"
            sx={{ padding: 0 }}
            label={copy.status.tricksPlayed(view.completedTricks, view.trickCount)}
            count={view.completedTricks}
            max={view.trickCount}
            locale={config.locale}
            slotProps={{ label: { sx: visuallyHidden }, count: { sx: visuallyHidden } }}
          />
        </dd>
      </div>
    </Stats>
  );
}

/** Keeps the popover trigger's border and focus ring, trimmed to HUD height. */
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
  const [flipped, setFlipped] = useState(false);
  const dealt = view.phase !== 'ready';

  useEffect(() => {
    if (!dealt || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setFlipped(true);
    const timeout = window.setTimeout(() => setFlipped(false), config.timing.trumpFlipMs);
    return () => window.clearTimeout(timeout);
  }, [dealt, view.roundNumber]);

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
