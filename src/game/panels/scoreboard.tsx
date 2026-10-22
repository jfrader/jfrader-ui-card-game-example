import { useState } from 'react';
import { styled } from '@jfrader/ui';
import { EmptyState } from '@jfrader/ui/empty-state';
import { GameRounds } from '@jfrader/ui/game-rounds';
import { Tabs } from '@jfrader/ui/tabs';
import { Timeline } from '@jfrader/ui/timeline';
import type { ScoreHistoryView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { visuallyHidden, VisuallyHidden } from '../../ui/styles';
import { ScoreTable } from './score-table';

const Content = styled.div(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[5],
  minInlineSize: 0,
  paddingBlockStart: t.space[4],
}));

const RoundLeads = styled(GameRounds)(({ theme: t }) => ({
  '& [data-ui~="game-rounds-list"]': {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: t.space[1],
  },
  '& [data-outcome="pending"] [data-ui~="game-rounds-outcome"]': visuallyHidden,
}));

export function Scoreboard({ view, now }: { view: ScoreHistoryView; now: number }) {
  const [tab, setTab] = useState('scores');
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <Tabs.List aria-label={copy.scores.title}>
        <Tabs.Tab value="scores">{copy.scores.title}</Tabs.Tab>
        <Tabs.Tab value="log">{copy.scores.log}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="scores">
        <Content>
          <ScoreTable view={view.table} />
          <RoundLeads
            surface="transparent"
            sx={{ padding: 0 }}
            locale={config.locale}
            label={copy.scores.roundLeads}
            rounds={view.roundLeads.map((round, index) => ({
              ...round,
              number: index + 1,
              current: view.table.rounds[index]?.state === 'current',
              label: <VisuallyHidden>{copy.scores.roundHeaderLabel(index + 1)}</VisuallyHidden>,
            }))}
            outcomeLabels={{ won: copy.scores.led, lost: copy.scores.behind, pending: copy.scores.pending }}
          />
        </Content>
      </Tabs.Panel>
      <Tabs.Panel value="log">
        <Content>
          {view.events.length === 0 ? (
            <EmptyState
              title={copy.scores.noHistory}
              description={copy.scores.noHistoryDescription}
              headingLevel={3}
            />
          ) : (
            <Timeline
              events={view.events}
              now={now}
              locale={config.locale}
              maxHeight="60dvh"
              scrollToNew
              labels={{ region: copy.timeline.region, empty: copy.timeline.empty }}
            />
          )}
        </Content>
      </Tabs.Panel>
    </Tabs>
  );
}
