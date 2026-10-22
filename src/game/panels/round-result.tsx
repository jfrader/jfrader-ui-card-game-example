import { Button, styled } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { Pill } from '@jfrader/ui/pill';
import { SuitIcon } from '../../ui/suit-icon';
import type { ResultsView } from '../../contracts';
import { copy, trumpLabel } from '../../content/en';
import { Eyebrow } from '../../ui/styles';
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

export function RoundResult({
  open,
  onOpenChange,
  view,
  onContinue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: Extract<ResultsView, { kind: 'round' }>;
  onContinue: () => void;
}) {
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
              <Button
                type="button"
                variant="solid"
                tone="accent"
                onClick={() => {
                  onOpenChange(false);
                  onContinue();
                }}
              >
                {copy.results.dealRound(view.roundNumber + 1)}
              </Button>
            </DialogActions>
          </DialogLayout>
        </Dialog.Panel>
      </Dialog.Content>
    </Dialog>
  );
}
