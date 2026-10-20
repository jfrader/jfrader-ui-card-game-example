import { Dialog } from '@jfrader/ui/dialog';
import { copy } from '../../content/en';
import { RulesContent } from '../../rules/content';
import { DialogLayout, DialogTitleRow } from './dialog.styles';

export function RulesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Panel>
          <DialogLayout>
            <DialogTitleRow>
              <Dialog.Title>{copy.rules.title}</Dialog.Title>
              <Dialog.Close>{copy.common.close}</Dialog.Close>
            </DialogTitleRow>
            <RulesContent compact />
          </DialogLayout>
        </Dialog.Panel>
      </Dialog.Content>
    </Dialog>
  );
}
