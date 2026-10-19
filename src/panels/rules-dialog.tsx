import { Stack } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { copy } from '../content/en';
import { RulesContent } from '../rules/content';

export function RulesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><Dialog.Content><Dialog.Panel><Stack>
    <Dialog.Title>{copy.rules.title}</Dialog.Title>
    <RulesContent compact />
    <Dialog.Close>{copy.common.close}</Dialog.Close>
  </Stack></Dialog.Panel></Dialog.Content></Dialog>;
}
