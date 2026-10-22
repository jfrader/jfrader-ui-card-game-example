import { useState } from 'react';
import { styled } from '@jfrader/ui';
import { Tabs } from '@jfrader/ui/tabs';
import type { ScoreHistoryView } from '../../contracts';
import { copy } from '../../content/en';
import { LogPanel } from './log-panel';
import { ScoresPanel } from './scores-panel';

// The library pins the cross axis in 0.10.1 (GURI-3005); until that ships the tab strip keeps 1px of vertical scroll range.
const TabList = styled(Tabs.List)({ overflowY: 'clip' });

const Content = styled.div(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[5],
  minInlineSize: 0,
  paddingBlockStart: t.space[4],
}));

export function Scoreboard({
  view,
  now,
  timelineMaxHeight,
}: {
  view: ScoreHistoryView;
  now: number;
  timelineMaxHeight?: string;
}) {
  const [tab, setTab] = useState('scores');
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabList aria-label={copy.scores.title}>
        <Tabs.Tab value="scores">{copy.scores.title}</Tabs.Tab>
        <Tabs.Tab value="log">{copy.scores.log}</Tabs.Tab>
      </TabList>
      <Tabs.Panel value="scores">
        <Content>
          <ScoresPanel view={view} />
        </Content>
      </Tabs.Panel>
      <Tabs.Panel value="log">
        <Content>
          <LogPanel events={view.events} now={now} maxHeight={timelineMaxHeight} />
        </Content>
      </Tabs.Panel>
    </Tabs>
  );
}
