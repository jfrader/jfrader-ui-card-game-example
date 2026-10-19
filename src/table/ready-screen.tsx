import type { CSSProperties } from 'react';
import { Button, styled } from '@jfrader/ui';
import { GameCard, type GameCardValue } from '@jfrader/ui/game-card';
import { MetricCard } from '@jfrader/ui/metric-card';
import { Pill } from '@jfrader/ui/pill';
import type { ResultsView, TableCommand, TableView } from '../contracts';
import { useMediaQuery } from '../app/use-media-query';
import { config } from '../config';
import { copy } from '../content/en';

type Stats = Extract<ResultsView, { kind: 'game' }>['stats'];

const FAN: readonly GameCardValue[] = [
  { deck: 'french', suit: 'spades', rank: 'A' },
  { deck: 'french', suit: 'hearts', rank: 'K' },
  { deck: 'french', suit: 'diamonds', rank: 'Q' },
  { deck: 'french', suit: 'clubs', rank: 'J' },
  { deck: 'french', suit: 'spades', rank: '10' },
];
const FAN_SPREAD_DEG = 9;

const Stage = styled.section(({ theme }) => ({
  display: 'grid', justifyItems: 'center', alignContent: 'center', gap: theme.space[5], minInlineSize: 0,
  paddingBlock: theme.space[8], paddingInline: theme.space[4], textAlign: 'center', overflow: 'hidden',
  border: `1px solid ${theme.color.borderSubtle}`, borderRadius: theme.radius.xl, boxShadow: theme.shadow.raised,
  backgroundColor: theme.color.surfaceInset,
  backgroundImage: `radial-gradient(ellipse at 50% 30%, color-mix(in oklab, ${theme.color.success} 34%, ${theme.color.surfaceInset}), ${theme.color.surfaceInset} 70%)`,
  color: theme.color.text,
}));

const Fan = styled.div(({ theme }) => ({
  display: 'flex', justifyContent: 'center', paddingBlockEnd: theme.space[4],
  '& > *': {
    marginInline: `calc(${theme.size.gameCardMd} * -0.18)`,
    transformOrigin: '50% 140%',
    transform: 'rotate(calc((var(--fan-index) - 2) * var(--fan-spread)))',
    '@media (prefers-reduced-motion: no-preference)': {
      animation: `fan-in ${theme.motion.duration.cardDeal} ${theme.motion.easeStandard} both`,
      animationDelay: `calc(var(--fan-index) * ${theme.motion.duration.cardDealStagger})`,
    },
  },
  '@keyframes fan-in': { from: { opacity: 0, transform: 'translateY(24px) rotate(0deg)' } },
}));

const Title = styled.p(({ theme }) => ({
  margin: 0, fontSize: theme.textSize['3xl'], fontWeight: theme.fontWeight.semibold,
}));

const Body = styled.p(({ theme }) => ({
  margin: 0, maxInlineSize: '44ch', color: theme.color.textMuted, fontSize: theme.textSize.md,
}));

const Actions = styled.div(({ theme }) => ({
  display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: theme.space[3],
}));

const Metrics = styled.div(({ theme }) => ({
  display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: theme.space[3],
  inlineSize: '100%', maxInlineSize: '36rem', minInlineSize: 0,
}));

export interface ReadyScreenProps {
  view: TableView;
  stats: Stats;
  onCommand: (command: TableCommand) => void;
}

export function ReadyScreen({ view, stats, onCommand }: ReadyScreenProps) {
  const compact = useMediaQuery(`(max-width: ${config.breakpoints.compactChrome}px)`);
  const winRate = stats.gamesPlayed ? stats.gamesWon / stats.gamesPlayed : 0;
  return (
    <Stage aria-label={copy.table.regionLabel}>
      <Fan aria-hidden="true">
        {FAN.map((value, index) => (
          <GameCard key={`${value.suit}-${value.rank}`} size={compact ? 'md' : 'lg'} label={`${value.rank} ${value.suit}`} value={value}
            style={{ '--fan-index': index, '--fan-spread': `${FAN_SPREAD_DEG}deg` } as CSSProperties} />
        ))}
      </Fan>
      <Title>{copy.table.readyTitle}</Title>
      <Body>{copy.table.readyBody}</Body>
      <Pill>{copy.settings[view.settings.difficulty]}</Pill>
      <Actions>
        <Button type="button" variant="solid" tone="accent" size="lg" onClick={() => onCommand('start')}>{copy.table.start}</Button>
        <Button type="button" variant="outline" size="lg" onClick={() => onCommand('rules')}>{copy.table.rules}</Button>
      </Actions>
      {stats.gamesPlayed > 0 && (
        <Metrics>
          <MetricCard label={copy.stats.gamesPlayed} value={stats.gamesPlayed} locale={config.locale} />
          <MetricCard label={copy.stats.gamesWon} value={stats.gamesWon} locale={config.locale} />
          <MetricCard label={copy.stats.winRate} value={winRate} locale={config.locale}
            formatOptions={{ style: 'percent', maximumFractionDigits: 0 }} />
        </Metrics>
      )}
    </Stage>
  );
}
