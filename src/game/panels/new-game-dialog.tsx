import { Button } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { copy } from '../../content/en';
import { DialogActions, DialogHeader, DialogLayout } from './dialog.styles';

export function NewGameDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Panel>
          <DialogLayout>
            <DialogHeader>
              <Dialog.Title>{copy.commands.newGame}</Dialog.Title>
              <Dialog.Description>{copy.dialogs.newGameConfirm}</Dialog.Description>
            </DialogHeader>
            <DialogActions>
              <Dialog.Close>{copy.common.cancel}</Dialog.Close>
              <Button
                type="button"
                variant="solid"
                tone="accent"
                onClick={() => {
                  onOpenChange(false);
                  onConfirm();
                }}
              >
                {copy.commands.newGame}
              </Button>
            </DialogActions>
          </DialogLayout>
        </Dialog.Panel>
      </Dialog.Content>
    </Dialog>
  );
}
