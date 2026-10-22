import { Button, styled } from '@jfrader/ui';
import type { TableCommand, TableView } from '../../contracts';
import type { Difficulty, Stats } from '../../engine/types';
import { DifficultyControl } from '../../ui/difficulty-control';
import { StatRecord } from '../../ui/stat-record';
import { useCompactLayout } from '../../ui/use-media-query';
import { copy } from '../../content/en';
import { phone } from '../../ui/styles';
import { CardFan } from './card-fan';
import { feltMaterial, Stage } from './table.styles';

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
  [phone]: {
    gap: t.space[5],
    paddingBlock: t.space[8],
    paddingInline: t.space[4],
    borderRadius: t.radius.lg,
  },
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
        <CardFan size={cardSize} />
        <Heading>
          <Title>{copy.table.readyTitle}</Title>
          <Body>{copy.table.readyBody}</Body>
        </Heading>
        <DifficultyControl value={view.settings.difficulty} onValueChange={onDifficultyChange} />
        <Actions>
          <Button type="button" variant="solid" tone="accent" size="lg" onClick={() => onCommand('start')}>
            {copy.table.start}
          </Button>
          <Button type="button" variant="solid" size="lg" onClick={() => onCommand('rules')}>
            {copy.table.howToPlay}
          </Button>
        </Actions>
        {stats.gamesPlayed > 0 && (
          <Record>
            <StatRecord stats={stats} surface="felt" />
          </Record>
        )}
      </Hero>
    </Stage>
  );
}
