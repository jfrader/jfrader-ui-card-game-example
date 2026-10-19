import { useEffect, useState } from 'react';
import { styled } from '@jfrader/ui';
import { CallOverlay } from '@jfrader/ui/call-overlay';
import type { TableView } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { trumpLabel } from '../app/presentation';

const Frame = styled.div({
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  pointerEvents: 'none',
});

/** Calls each new round on the felt while it is still empty. */
export function RoundCall({ view }: { view: TableView }) {
  const [open, setOpen] = useState(false);
  const dealt = view.phase !== 'ready';

  useEffect(() => {
    if (!dealt) return;
    setOpen(true);
    const timeout = window.setTimeout(() => setOpen(false), config.timing.roundCallMs);
    return () => window.clearTimeout(timeout);
  }, [dealt, view.roundNumber]);

  return (
    <Frame>
      <CallOverlay
        open={open}
        onOpenChange={setOpen}
        tone="neutral"
        label={copy.table.roundCall(view.roundNumber, trumpLabel(view.trump))}
      />
    </Frame>
  );
}
