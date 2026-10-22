import { useState } from 'react';
import { styled } from '@jfrader/ui';
import { Tabs } from '@jfrader/ui/tabs';
import type { ScoreHistoryView } from '../../contracts';
import { copy } from '../../content/en';
import { LogPanel } from './log-panel';
import { ScoresPanel } from './scores-panel';

const Content = styled.div(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[5],
  minInlineSize: 0,
  paddingBlockStart: t.space[4],
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
          <ScoresPanel view={view} />
        </Content>
      </Tabs.Panel>
      <Tabs.Panel value="log">
        <Content>
          <LogPanel events={view.events} now={now} />
        </Content>
      </Tabs.Panel>
    </Tabs>
  );
}
