import { styled } from '@jfrader/ui';
import { CallOverlay } from '@jfrader/ui/call-overlay';
import { useTimedFlag } from '../../app/use-timed-flag';
import type { TableView } from '../../contracts';
import { config } from '../../config';
import { copy, trumpLabel } from '../../content/en';

const Frame = styled.div({
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  pointerEvents: 'none',
});

export function RoundCall({ view }: { view: TableView }) {
  const roundTrigger = view.phase !== 'ready' ? view.roundNumber : null;
  const open = useTimedFlag(roundTrigger, config.timing.roundCallMs);

  return (
    <Frame>
      <CallOverlay
        open={open}
        tone="neutral"
        label={copy.table.roundCall(view.roundNumber, trumpLabel(view.trump))}
      />
    </Frame>
  );
}
