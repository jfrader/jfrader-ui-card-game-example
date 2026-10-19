import { useEffect, useState } from 'react';
import { Club, Diamond, Heart, Spade, CircleSlash } from 'lucide-react';
import { FlipGameCard } from '@jfrader/ui/flip-game-card';
import { Pill } from '@jfrader/ui/pill';
import { Popover } from '@jfrader/ui/popover';
import type { TableView } from '../contracts';
import { copy } from '../content/en';
import { Strip, TrumpFace } from './table.styles';

const SUIT_ICON = {
  hearts: Heart,
  diamonds: Diamond,
  clubs: Club,
  spades: Spade,
} as const;

export function TrumpIndicator({ view }: { view: TableView }) {
  const [flipped, setFlipped] = useState(false);
  const trump = view.phase === 'ready' ? 'hearts' : view.trump;
  const label = trump ? copy.suits[trump] : copy.table.noTrump;
  const Icon = trump ? SUIT_ICON[trump] : CircleSlash;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setFlipped(true);
    const timeout = window.setTimeout(() => setFlipped(false), 260);
    return () => window.clearTimeout(timeout);
  }, [view.roundNumber]);

  return (
    <Strip role="group" aria-label={copy.a11y.trumpRegion}>
      <div aria-hidden="true">
        <FlipGameCard
          size="md"
          flipped={flipped}
          front={
            <TrumpFace data-red={trump === 'hearts' || trump === 'diamonds'}>
              <Icon size={36} strokeWidth={1.75} fill={trump ? 'currentColor' : 'none'} />
            </TrumpFace>
          }
          back={<TrumpFace>{copy.table.trump}</TrumpFace>}
        />
      </div>
      <Popover
        triggerLabel={<Pill>{label}</Pill>}
        label={copy.table.trump}
        content={copy.rules.trumpBody}
      />
    </Strip>
  );
}
