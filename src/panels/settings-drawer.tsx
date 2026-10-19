import { useState } from 'react';
import { Button, Divider, Stack, styled } from '@jfrader/ui';
import { Drawer } from '@jfrader/ui/drawer';
import { Dialog } from '@jfrader/ui/dialog';
import { SegmentedControl } from '@jfrader/ui/segmented-control';
import { Switch } from '@jfrader/ui/switch';
import { ActionButton } from '@jfrader/ui/action-button';
import { MetricCard } from '@jfrader/ui/metric-card';
import type { ResultsView, TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';

type Settings = TableView['settings'];
type Stats = Extract<ResultsView, { kind: 'game' }>['stats'];
const Metrics = styled.div(({ theme }) => ({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: theme.space[3], minInlineSize: 0 }));

export function SettingsDrawer({ open, onOpenChange, settings, stats, canResetStats, onSettingsChange, onResetStats }: {
  open: boolean; onOpenChange: (open: boolean) => void; settings: Settings; stats: Stats;
  canResetStats: boolean; onSettingsChange: (next: Settings) => void; onResetStats: () => Promise<void>;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const close = (next: boolean) => { if (!next) setConfirmReset(false); onOpenChange(next); };
  return <Drawer open={open} onOpenChange={close}>
    <Drawer.Content><Drawer.Panel appearance="default">
      <Drawer.Header><Drawer.Title>{copy.settings.title}</Drawer.Title><Drawer.Close aria-label={copy.common.close}>{copy.common.close}</Drawer.Close></Drawer.Header>
      <Drawer.Body><Stack>
        <SegmentedControl label={copy.settings.difficulty} value={settings.difficulty} options={[
          { value: 'easy', label: copy.settings.easy }, { value: 'normal', label: copy.settings.normal }, { value: 'hard', label: copy.settings.hard },
        ]} onValueChange={(difficulty) => { if (difficulty === 'easy' || difficulty === 'normal' || difficulty === 'hard') onSettingsChange({ ...settings, difficulty }); }} />
        <Switch label={copy.settings.hints} description={copy.settings.hintsDescription} checked={settings.showLegalHints} onCheckedChange={(showLegalHints) => onSettingsChange({ ...settings, showLegalHints })} />
        <Switch label={copy.settings.timer} description={copy.settings.timerDescription} checked={settings.turnTimer} onCheckedChange={(turnTimer) => onSettingsChange({ ...settings, turnTimer })} />
        <Switch label={copy.settings.autoSort} description={copy.settings.autoSortDescription} checked={settings.autoSortHand} onCheckedChange={(autoSortHand) => onSettingsChange({ ...settings, autoSortHand })} />
        <Divider />
        <h3>{copy.settings.localStats}</h3>
        <Metrics><MetricCard label={copy.stats.gamesPlayed} value={stats.gamesPlayed} locale={config.locale} /><MetricCard label={copy.stats.gamesWon} value={stats.gamesWon} locale={config.locale} /></Metrics>
        <MetricCard label={copy.stats.winRate} value={stats.gamesPlayed ? stats.gamesWon / stats.gamesPlayed : 0} formatOptions={{ style: 'percent', maximumFractionDigits: 0 }} locale={config.locale} description={copy.stats.localOnly} />
        <Button type="button" disabled={!canResetStats} onClick={() => setConfirmReset(true)}>{copy.settings.resetStats}</Button>
      </Stack></Drawer.Body>
      <Drawer.Footer><Button type="button" onClick={() => close(false)}>{copy.common.done}</Button></Drawer.Footer>
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}><Dialog.Content><Dialog.Panel>
        <Stack><Dialog.Title>{copy.settings.resetStats}</Dialog.Title><Dialog.Description>{copy.settings.resetStatsConfirm}</Dialog.Description>
          <ActionButton disabled={!canResetStats} label={copy.settings.resetStats} pendingLabel={copy.settings.resetStatsPending} successLabel={copy.settings.resetStatsSuccess} errorLabel={copy.settings.resetStatsError} onAction={async () => { await onResetStats(); }} />
          <Dialog.Close>{copy.common.cancel}</Dialog.Close>
        </Stack>
      </Dialog.Panel></Dialog.Content></Dialog>
    </Drawer.Panel></Drawer.Content>
  </Drawer>;
}
