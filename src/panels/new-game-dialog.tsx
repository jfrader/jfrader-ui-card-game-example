import { Button, Flex, Stack } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { copy } from '../content/en';

export function NewGameDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><Dialog.Content><Dialog.Panel><Stack>
    <Dialog.Title>{copy.menu.newGame}</Dialog.Title><Dialog.Description>{copy.dialogs.newGameConfirm}</Dialog.Description>
    <Flex gap="sm" wrap><Dialog.Close>{copy.common.cancel}</Dialog.Close><Button type="button" onClick={() => { onOpenChange(false); onConfirm(); }}>{copy.menu.newGame}</Button></Flex>
  </Stack></Dialog.Panel></Dialog.Content></Dialog>;
}
