import { styled } from '@jfrader/ui';
import { GameMarks } from '@jfrader/ui/game-marks';
import type { TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { Eyebrow, visuallyHidden } from '../../ui/styles';

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
