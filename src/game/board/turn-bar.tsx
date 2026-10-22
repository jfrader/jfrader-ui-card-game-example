import { ListOrdered, Pause, Play } from 'lucide-react';
import { styled } from '@jfrader/ui';
import { Countdown } from '@jfrader/ui/countdown';
import { GameActions, type GameActionItem } from '@jfrader/ui/game-actions';
import type { TableCommand, TableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { forcedColors, phone, visuallyHidden } from '../../ui/styles';

const Status = styled.div(({ theme: t }) => ({
  display: 'grid',
  gridTemplateColumns: `${t.space[2]} minmax(0, auto) auto`,
  columnGap: t.space[2],
  alignItems: 'baseline',
  // Wide enough to keep words together; the actions wrap below it before it squeezes.
  minInlineSize: `min(calc(${t.space[12]} * 3), 100%)`,
  maxInlineSize: '32ch',
  '&::before': {
    content: '""',
    inlineSize: t.space[2],
    blockSize: t.space[2],
    borderRadius: t.radius.full,
    backgroundColor: t.color.borderControl,
    alignSelf: 'center',
  },
  '&[data-tone="turn"]::before': { backgroundColor: t.color.accent },
  '&[data-tone="paused"]::before': { backgroundColor: t.color.warning },
  '&[data-tone="resolved"]::before': { backgroundColor: t.color.success },
  [forcedColors]: { '&::before': { backgroundColor: 'CanvasText' } },
}));

const Title = styled.p(({ theme: t }) => ({
  margin: 0,
  fontSize: t.textSize.md,
  fontWeight: t.fontWeight.semibold,
  lineHeight: t.lineHeight.tight,
  '[data-tone="turn"] > &': { color: t.color.accentText },
}));

const Clock = styled(Countdown)({
  justifySelf: 'start',
  alignSelf: 'center',
});

const Detail = styled.p(({ theme: t }) => ({
  gridColumn: '2 / -1',
  margin: 0,
  marginBlockStart: t.space[1],
  color: t.color.textMuted,
  fontSize: t.textSize.sm,
  lineHeight: t.lineHeight.tight,
}));

export function TurnStatus({ id, view }: { id: string; view: TableView }) {
  return (
    <Status id={id} data-tone={view.status.tone} role="status" aria-atomic="true">
      <Title>{view.status.title}</Title>
      {view.canPlay && view.deadline !== null && (
        <Clock
          target={view.deadline}
          variant="compact"
          units={['seconds']}
          unitDisplay="narrow"
          label={null}
          locale={config.locale}
          announceCompletion={false}
          aria-label={copy.a11y.turnTime}
        />
      )}
      {view.status.detail && <Detail>{view.status.detail}</Detail>}
    </Status>
  );
}

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
