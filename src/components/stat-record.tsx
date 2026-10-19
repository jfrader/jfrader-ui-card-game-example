import { styled } from '@jfrader/ui';
import type { Stats } from '../engine/types';
import { config } from '../config';
import { copy } from '../content/en';
import { eyebrow } from '../styles';

const Record = styled.dl(({ theme: t }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: t.space[8],
  margin: 0,
  '& > div': { display: 'grid', gap: t.space[1] },
  '& dt': eyebrow(t),
  '&[data-surface="felt"] dt': { color: t.color.text },
  '& dd': {
    margin: 0,
    fontSize: t.textSize.xl,
    fontWeight: t.fontWeight.semibold,
    lineHeight: t.lineHeight.tight,
    fontVariantNumeric: 'tabular-nums',
  },
}));

const numbers = new Intl.NumberFormat(config.locale);
const percent = new Intl.NumberFormat(config.locale, { style: 'percent', maximumFractionDigits: 0 });

/** Played, won and win rate from local stats; `felt` keeps labels at full contrast on the felt. */
export function StatRecord({ stats, surface }: { stats: Stats; surface?: 'felt' }) {
  return (
    <Record data-surface={surface}>
      <div><dt>{copy.stats.gamesPlayed}</dt><dd>{numbers.format(stats.gamesPlayed)}</dd></div>
      <div><dt>{copy.stats.gamesWon}</dt><dd>{numbers.format(stats.gamesWon)}</dd></div>
      <div><dt>{copy.stats.winRate}</dt><dd>{percent.format(stats.gamesPlayed ? stats.gamesWon / stats.gamesPlayed : 0)}</dd></div>
    </Record>
  );
}
