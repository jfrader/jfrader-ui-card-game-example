import { Button, styled } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { GameResult } from '@jfrader/ui/game-result';
import { Pill } from '@jfrader/ui/pill';
import { StatRecord } from '../../ui/stat-record';
import { SuitIcon } from '../../ui/suit-icon';
import type { ResultsView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { trumpLabel } from '../../app/presentation';
import { Eyebrow } from '../../ui/styles';
import { Celebration } from './celebration';
import { DialogActions, DialogHeader, DialogLayout, DialogTitleRow } from './dialog.styles';
import { ScoreTable } from './score-table';

const NextTrump = styled.p(({ theme: t }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: t.space[2],
  margin: 0,
  paddingBlockStart: t.space[4],
  borderBlockStart: `1px solid ${t.color.border}`,
  '& strong': { fontWeight: t.fontWeight.semibold },
  '& svg': { inlineSize: t.space[4], blockSize: t.space[4] },
}));

const LEAD_TONE = { sole: 'success', joint: 'accent', behind: 'neutral' } as const;
const LIST_FORMAT = new Intl.ListFormat(config.locale, { style: 'long', type: 'conjunction' });

export function ResultsDialog({ open, onOpenChange, view, onContinue, onNewGame }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: ResultsView | null;
  onContinue: () => void;
  onNewGame: () => void;
}) {
  if (!view) return null;
  const close = () => onOpenChange(false);

  if (view.kind === 'round') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Panel>
            <DialogLayout>
              <DialogHeader>
                <Eyebrow>{copy.results.roundEyebrow(view.roundNumber, view.roundCount)}</Eyebrow>
                <DialogTitleRow>
                  <Dialog.Title>{copy.results.roundTitle(view.roundNumber)}</Dialog.Title>
                  <Pill tone={LEAD_TONE[view.lead]}>{copy.results.lead[view.lead]}</Pill>
                </DialogTitleRow>
                <Dialog.Description>{copy.results.yourTricks(view.yourTricks)}</Dialog.Description>
              </DialogHeader>
              <ScoreTable view={view.table} />
              <NextTrump>
                <Eyebrow as="span">{copy.results.nextTrump}</Eyebrow>
                <SuitIcon suit={view.nextTrump} />
                <strong>{trumpLabel(view.nextTrump)}</strong>
              </NextTrump>
              <DialogActions>
                <Dialog.Close>{copy.common.close}</Dialog.Close>
                <Button type="button" variant="solid" tone="accent" onClick={() => { close(); onContinue(); }}>
                  {copy.results.dealRound(view.roundNumber + 1)}
                </Button>
              </DialogActions>
            </DialogLayout>
          </Dialog.Panel>
        </Dialog.Content>
      </Dialog>
    );
  }

  const winners = LIST_FORMAT.format(view.winnerNames);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Panel>
          <DialogLayout>
            <Dialog.Title>{copy.results.finalEyebrow}</Dialog.Title>
            <GameResult
              outcome={view.outcome}
              title={copy.results[view.outcome]}
              summary={<>{copy.results.finalSummary(view.yourPoints)} {copy.results.winnerNames(winners)}</>}
              celebration={view.outcome === 'won' ? <Celebration /> : undefined}
              actions={
                <>
                  <Button type="button" variant="solid" tone="accent" onClick={() => { close(); onNewGame(); }}>{copy.results.playAgain}</Button>
                  <Button type="button" onClick={close}>{copy.results.reviewScores}</Button>
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
