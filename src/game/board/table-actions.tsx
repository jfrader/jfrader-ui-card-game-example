import { ListOrdered, Pause, Play } from 'lucide-react';
import { styled } from '@jfrader/ui';
import { GameActions, type GameActionItem } from '@jfrader/ui/game-actions';
import type { TableCommand, TableView } from '../../contracts';
import { copy } from '../../content/en';
import { phone, visuallyHidden } from '../../ui/styles';

const Toolbar = styled(GameActions)({
  flexShrink: 0,
  '&[data-orientation="horizontal"]': { flexWrap: 'nowrap' },
});

const ActionLabel = styled.span({ [phone]: visuallyHidden });

export function TableActions({
  view,
  showScores,
  onCommand,
}: {
  view: TableView;
  showScores: boolean;
  onCommand: (command: TableCommand) => void;
}) {
  const actions: GameActionItem[] = [];
  if (view.phase === 'playing') {
    actions.push(
      view.paused
        ? {
            key: 'resume',
            label: <ActionLabel>{copy.table.resume}</ActionLabel>,
            startIcon: <Play aria-hidden="true" />,
            onSelect: () => onCommand('resume'),
          }
        : {
            key: 'pause',
            label: <ActionLabel>{copy.table.pause}</ActionLabel>,
            startIcon: <Pause aria-hidden="true" />,
            onSelect: () => onCommand('pause'),
          },
    );
  }
  if (showScores) {
    actions.push({
      key: 'scores',
      label: <ActionLabel>{copy.commands.scores}</ActionLabel>,
      startIcon: <ListOrdered aria-hidden="true" />,
      onSelect: () => onCommand('scores'),
    });
  }
  if (actions.length === 0) return null;
  return <Toolbar actions={actions} label={copy.table.actionsLabel} size="sm" variant="ghost" />;
}
