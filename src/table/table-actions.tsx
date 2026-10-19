import { useEffect, useState } from 'react';
import { GameActions, type GameActionItem } from '@jfrader/ui/game-actions';
import { CallOverlay } from '@jfrader/ui/call-overlay';
import type { TableCommand, TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { AnnouncementFrame } from './table.styles';

export function TableActions({ view, onCommand }: {
  view: TableView;
  onCommand: (command: TableCommand) => void;
}) {
  const actions: GameActionItem[] = [];
  const add = (command: TableCommand, label: string) =>
    actions.push({ key: command, label, onSelect: () => onCommand(command) });
  if (view.phase === 'ready') add('start', copy.table.start);
  if (view.phase === 'playing') {
    add(view.paused ? 'resume' : 'pause', view.paused ? copy.table.resume : copy.table.pause);
  }
  if (view.phase === 'trickComplete') {
    add(
      'continue',
      view.completedTricks < 5
        ? copy.table.nextTrick
        : view.roundNumber < 5
          ? copy.table.roundResults
          : copy.table.finalResults,
    );
  }
  if (view.phase === 'roundComplete' || view.phase === 'gameComplete') {
    add('results', view.phase === 'gameComplete' ? copy.table.finalResults : copy.table.roundResults);
  }
  add('rules', copy.table.rules);
  add('scores', copy.table.scores);
  return <GameActions actions={actions} label={copy.table.actionsLabel} size="sm" />;
}

export function TrickAnnouncement({ view }: { view: TableView }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!view.winnerLabel || view.phase !== 'trickComplete') {
      setOpen(false);
      return;
    }
    setOpen(true);
    const timeout = window.setTimeout(() => setOpen(false), config.timing.trickAnnouncementMs);
    return () => window.clearTimeout(timeout);
  }, [view.winnerLabel, view.phase, view.roundNumber, view.trickNumber]);
  return (
    <AnnouncementFrame>
      <CallOverlay open={open} onOpenChange={setOpen} label={view.winnerLabel} tone="success" />
    </AnnouncementFrame>
  );
}
