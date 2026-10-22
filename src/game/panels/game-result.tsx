import { Button } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { GameResult as Outcome } from '@jfrader/ui/game-result';
import { StatRecord } from '../../ui/stat-record';
import type { ResultsView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { Celebration } from './celebration';
import { DialogLayout } from './dialog.styles';
import { ScoreTable } from './score-table';

const LIST_FORMAT = new Intl.ListFormat(config.locale, { style: 'long', type: 'conjunction' });

export function GameResult({
  open,
  onOpenChange,
  view,
  onNewGame,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: Extract<ResultsView, { kind: 'game' }>;
  onNewGame: () => void;
}) {
  const close = () => onOpenChange(false);
  const winners = LIST_FORMAT.format(view.winnerNames);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Panel>
          <DialogLayout>
            <Dialog.Title>{copy.results.finalEyebrow}</Dialog.Title>
            <Outcome
              outcome={view.outcome}
              title={copy.results[view.outcome]}
              summary={
                <>
                  {copy.results.finalSummary(view.yourPoints)} {copy.results.winnerNames(winners)}
                </>
              }
              celebration={view.outcome === 'won' ? <Celebration /> : undefined}
              actions={
                <>
                  <Button
                    type="button"
                    variant="solid"
                    tone="accent"
                    onClick={() => {
                      close();
                      onNewGame();
                    }}
                  >
                    {copy.results.playAgain}
                  </Button>
                  <Button type="button" onClick={close}>
                    {copy.results.reviewScores}
                  </Button>
                </>
              }
            />
            <ScoreTable view={view.table} />
            <StatRecord stats={view.stats} />
          </DialogLayout>
        </Dialog.Panel>
      </Dialog.Content>
    </Dialog>
  );
}
