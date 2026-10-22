import { CircleSlash, Club, Diamond, Heart, Spade, type LucideProps } from 'lucide-react';
import type { Suit } from '../engine/types';

const SUIT_ICON = { hearts: Heart, diamonds: Diamond, clubs: Club, spades: Spade } as const;

/** Decorative suit glyph; `null` draws the no-trump mark. Pair it with the suit's name in text. */
export function SuitIcon({
  suit,
  filled = false,
  ...props
}: { suit: Suit | null; filled?: boolean } & LucideProps) {
  const Icon = suit ? SUIT_ICON[suit] : CircleSlash;
  return <Icon aria-hidden="true" fill={filled && suit ? 'currentColor' : 'none'} {...props} />;
}
