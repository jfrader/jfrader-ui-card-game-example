import { useState } from 'react';
import { Card, Stack, styled } from '@jfrader/ui';
import { Tabs } from '@jfrader/ui/tabs';
import { GameScore } from '@jfrader/ui/game-score';
import { GameMarks } from '@jfrader/ui/game-marks';
import { Timeline } from '@jfrader/ui/timeline';
import { EmptyState } from '@jfrader/ui/empty-state';
import type { ScoreHistoryView } from '../contracts';
import { copy } from '../content/en';
import { config } from '../config';

const Panel = styled(Card)(({ theme }) => ({ minInlineSize: 0, padding: theme.space[4] }));
const Content = styled(Stack)(({ theme }) => ({ minInlineSize: 0, paddingBlockStart: theme.space[4] }));
const RoundHeading = styled.h3(({ theme }) => ({ margin: 0, fontSize: theme.textSize.sm }));

export function ScoreHistory({ view, now }: { view: ScoreHistoryView; now: number }) {
  const [tab, setTab] = useState('scores');
  return <Panel><Tabs value={tab} onValueChange={setTab}>
    <Tabs.List aria-label={copy.panels.scores}><Tabs.Tab value="scores">{copy.panels.scores}</Tabs.Tab><Tabs.Tab value="history">{copy.panels.history}</Tabs.Tab></Tabs.List>
    <Tabs.Panel value="scores"><Content>
      <GameScore label={copy.panels.totalColumn} rows={view.totals} locale={config.locale} />
      {view.rounds.map((round) => <Stack key={round.roundNumber} gap="sm">
        <RoundHeading>{copy.table.round(round.roundNumber)}</RoundHeading>
        {view.totals.map((player) => <GameMarks key={player.key} label={player.label} count={round.scores[player.key]} mark="◆" maxPerRow={5} layout="rows" locale={config.locale} />)}
      </Stack>)}
    </Content></Tabs.Panel>
    <Tabs.Panel value="history"><Content>
      {view.events.length === 0 ? <EmptyState title={copy.panels.noHistory} description={copy.panels.noHistoryDescription} headingLevel={3} /> :
        <Timeline events={view.events} now={now} locale={config.locale} maxHeight="50dvh" scrollToNew labels={{ region: copy.timeline.region, empty: copy.timeline.empty }} />}
    </Content></Tabs.Panel>
  </Tabs></Panel>;
}
