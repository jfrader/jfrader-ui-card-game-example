import { ActionButton } from '@jfrader/ui/action-button';
import { Dialog } from '@jfrader/ui/dialog';
import { copy } from '../../content/en';
import { DialogActions, DialogHeader, DialogLayout } from './dialog.styles';

export function ResetStatsDialog({
  open,
  onOpenChange,
  canReset,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canReset: boolean;
  onReset: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Panel>
          <DialogLayout>
            <DialogHeader>
              <Dialog.Title>{copy.settings.resetStats}</Dialog.Title>
              <Dialog.Description>{copy.settings.resetStatsConfirm}</Dialog.Description>
            </DialogHeader>
            <DialogActions>
              <Dialog.Close>{copy.common.cancel}</Dialog.Close>
              <ActionButton
                disabled={!canReset}
                label={copy.settings.resetStats}
                pendingLabel={copy.settings.resetStatsPending}
                successLabel={copy.settings.resetStatsSuccess}
                errorLabel={copy.settings.resetStatsError}
                onAction={onReset}
              />
            </DialogActions>
          </DialogLayout>
        </Dialog.Panel>
      </Dialog.Content>
    </Dialog>
  );
}
