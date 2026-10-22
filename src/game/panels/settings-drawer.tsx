import { useId, useState } from 'react';
import { Button, styled } from '@jfrader/ui';
import { Drawer } from '@jfrader/ui/drawer';
import { Switch } from '@jfrader/ui/switch';
import { DifficultyControl } from '../../ui/difficulty-control';
import { StatRecord } from '../../ui/stat-record';
import type { TableView } from '../../contracts';
import type { Stats } from '../../engine/types';
import { copy } from '../../content/en';
import { eyebrow } from '../../ui/styles';
import { ResetStatsDialog } from './reset-stats-dialog';
import { useSheetSide } from './sheet-side';

type Settings = TableView['settings'];

const Sections = styled.div(({ theme: t }) => ({ display: 'grid', gap: t.space[8] }));

const Section = styled.section(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[5],
  '& > h3': { ...eyebrow(t), margin: 0 },
}));

const Note = styled.p(({ theme: t }) => ({ margin: 0, color: t.color.textMuted, fontSize: t.textSize.sm }));

export function SettingsDrawer({
  open,
  onOpenChange,
  settings,
  stats,
  canResetStats,
  onSettingsChange,
  onResetStats,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  stats: Stats;
  canResetStats: boolean;
  onSettingsChange: (next: Settings) => void;
  onResetStats: () => Promise<void>;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const side = useSheetSide();
  const gameId = useId();
  const statsId = useId();
  const update = (patch: Partial<Settings>) => onSettingsChange({ ...settings, ...patch });
  const close = (next: boolean) => {
    if (!next) setConfirmReset(false);
    onOpenChange(next);
  };

  return (
    <Drawer open={open} onOpenChange={close} side={side} draggable={side === 'bottom'}>
      <Drawer.Content>
        <Drawer.Panel>
          <Drawer.Header>
            <Drawer.Title>{copy.settings.title}</Drawer.Title>
            <Drawer.Close>{copy.common.close}</Drawer.Close>
          </Drawer.Header>
          <Drawer.Body>
            <Sections>
              <Section aria-labelledby={gameId}>
                <h3 id={gameId}>{copy.settings.gameSection}</h3>
                <DifficultyControl
                  value={settings.difficulty}
                  onValueChange={(difficulty) => update({ difficulty })}
                />
                <Switch
                  label={copy.settings.hints}
                  description={copy.settings.hintsDescription}
                  checked={settings.showLegalHints}
                  onCheckedChange={(showLegalHints) => update({ showLegalHints })}
                />
                <Switch
                  label={copy.settings.timer}
                  description={copy.settings.timerDescription}
                  checked={settings.turnTimer}
                  onCheckedChange={(turnTimer) => update({ turnTimer })}
                />
                <Switch
                  label={copy.settings.autoSort}
                  description={copy.settings.autoSortDescription}
                  checked={settings.autoSortHand}
                  onCheckedChange={(autoSortHand) => update({ autoSortHand })}
                />
              </Section>
              <Section aria-labelledby={statsId}>
                <h3 id={statsId}>{copy.settings.statsSection}</h3>
                <StatRecord stats={stats} />
                <Note>{copy.stats.localOnly}</Note>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    tone="danger"
                    disabled={!canResetStats}
                    onClick={() => setConfirmReset(true)}
                  >
                    {copy.settings.resetStats}
                  </Button>
                </div>
              </Section>
            </Sections>
          </Drawer.Body>
          <Drawer.Footer>
            <Button type="button" variant="solid" tone="accent" onClick={() => close(false)}>
              {copy.common.done}
            </Button>
          </Drawer.Footer>
          <ResetStatsDialog
            open={confirmReset}
            onOpenChange={setConfirmReset}
            canReset={canResetStats}
            onReset={onResetStats}
          />
        </Drawer.Panel>
      </Drawer.Content>
    </Drawer>
  );
}
