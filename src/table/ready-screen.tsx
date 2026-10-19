import type { CSSProperties } from 'react';
import { Button, styled } from '@jfrader/ui';
import { GameCard, type GameCardValue } from '@jfrader/ui/game-card';
import type { TableCommand, TableView } from '../contracts';
import type { Difficulty, Stats } from '../engine/types';
import { DifficultyControl } from '../components/difficulty-control';
import { StatRecord } from '../components/stat-record';
import { useCompactLayout } from '../app/use-media-query';
import { copy } from '../content/en';
import { phone, reducedMotionOff } from '../styles';
import { feltMaterial, Stage } from './table.styles';

const FAN: readonly GameCardValue[] = [
  { deck: 'french', suit: 'spades', rank: 'A' },
  { deck: 'french', suit: 'hearts', rank: 'K' },
  { deck: 'french', suit: 'diamonds', rank: 'Q' },
  { deck: 'french', suit: 'clubs', rank: 'J' },
  { deck: 'french', suit: 'hearts', rank: '10' },
];
const FAN_SPREAD_DEG = 8;

const Hero = styled.div(({ theme: t }) => ({
  ...feltMaterial(t),
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'center',
  gap: t.space[6],
  minBlockSize: 0,
  paddingBlock: t.space[10],
  paddingInline: t.space[6],
  textAlign: 'center',
  overflow: 'clip',
  boxShadow: `inset 0 0 ${t.space[12]} ${t.color.scrim}`,
  [phone]: { gap: t.space[5], paddingBlock: t.space[8], paddingInline: t.space[4], borderRadius: t.radius.lg },
}));

const Fan = styled.div(({ theme: t }) => ({
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

const Heading = styled.div(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[2],
  justifyItems: 'center',
}));

const Title = styled.p(({ theme: t }) => ({
  margin: 0,
  fontSize: t.textSize['3xl'],
  fontWeight: t.fontWeight.semibold,
  lineHeight: t.lineHeight.tight,
  letterSpacing: '-0.02em',
}));

const Body = styled.p(({ theme: t }) => ({
  margin: 0,
  maxInlineSize: '42ch',
  fontSize: t.textSize.md,
  lineHeight: t.lineHeight.base,
  textWrap: 'balance',
}));

const Actions = styled.div(({ theme: t }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: t.space[3],
}));

const Record = styled.div(({ theme: t }) => ({
  paddingBlockStart: t.space[4],
  borderBlockStart: `1px solid ${t.color.borderStrong}`,
}));

export interface ReadyScreenProps {
  view: TableView;
  stats: Stats;
  onCommand: (command: TableCommand) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function ReadyScreen({ view, stats, onCommand, onDifficultyChange }: ReadyScreenProps) {
  const compact = useCompactLayout();
  const cardSize = compact ? 'md' : 'lg';
  return (
    <Stage aria-label={copy.table.regionLabel}>
      <Hero>
        <Fan aria-hidden="true" data-size={cardSize}>
          {FAN.map((value, index) => (
            <GameCard key={`${value.suit}-${value.rank}`} size={cardSize} label={`${value.rank} ${value.suit}`} value={value}
              style={{ '--fan-index': index, '--fan-spread': `${FAN_SPREAD_DEG}deg` } as CSSProperties} />
          ))}
        </Fan>
        <Heading>
          <Title>{copy.table.readyTitle}</Title>
          <Body>{copy.table.readyBody}</Body>
        </Heading>
        <DifficultyControl value={view.settings.difficulty} onValueChange={onDifficultyChange} />
        <Actions>
          <Button type="button" variant="solid" tone="accent" size="lg" onClick={() => onCommand('start')}>{copy.table.start}</Button>
          <Button type="button" variant="solid" size="lg" onClick={() => onCommand('rules')}>{copy.table.howToPlay}</Button>
        </Actions>
        {stats.gamesPlayed > 0 && <Record><StatRecord stats={stats} surface="felt" /></Record>}
      </Hero>
    </Stage>
  );
}
