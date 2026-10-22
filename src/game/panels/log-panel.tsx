import { EmptyState } from '@jfrader/ui/empty-state';
import { Timeline } from '@jfrader/ui/timeline';
import type { ScoreHistoryView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';

export function LogPanel({ events, now }: { events: ScoreHistoryView['events']; now: number }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title={copy.scores.noHistory}
        description={copy.scores.noHistoryDescription}
        headingLevel={3}
      />
    );
  }
  return (
    <Timeline
      events={events}
      now={now}
      locale={config.locale}
      maxHeight="60dvh"
      scrollToNew
      labels={{ region: copy.timeline.region, empty: copy.timeline.empty }}
    />
  );
}
