import type { CSSProperties } from 'react';
import { styled, theme } from '@jfrader/ui';
import { reducedMotionOff } from '../../ui/styles';

const PIECE_IDS = Array.from({ length: 28 }, (_, index) => index);
// Theme tokens are CSS variables, so the palette follows the active palette without re-rendering.
const TONES = [theme.color.accent, theme.color.success, theme.color.warning, theme.color.info] as const;
const REST_BASE_PX = 6;

/** Each axis steps by a prime coprime to its span, so pieces scatter without repeating. */
const SCATTER = {
  lane: { step: 37, span: 100 },
  delay: { step: 53, span: 900 },
  rest: { step: 17, span: 40 },
  turn: { step: 47, span: 180 },
} as const;

const scatter = (index: number, axis: keyof typeof SCATTER) =>
  (index * SCATTER[axis].step) % SCATTER[axis].span;

const pieceStyle = (index: number) =>
  ({
    '--lane': `${scatter(index, 'lane')}%`,
    '--delay': `${scatter(index, 'delay')}ms`,
    '--rest': `${REST_BASE_PX + scatter(index, 'rest')}px`,
    '--turn': `${scatter(index, 'turn')}deg`,
    '--tone': TONES[index % TONES.length],
  }) as CSSProperties;

const Burst = styled.div(({ theme: t }) => ({
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  borderRadius: 'inherit',
  '& i': {
    position: 'absolute',
    insetBlockStart: 0,
    inlineSize: t.space[2],
    blockSize: t.space[3],
    insetInlineStart: 'var(--lane)',
    borderRadius: t.radius.sm,
    opacity: 0.85,
    backgroundColor: 'var(--tone)',
    transform: 'translateY(var(--rest)) rotate(var(--turn))',
    [reducedMotionOff]: {
      animation: `confetti-fall ${t.motion.duration.slow} ${t.motion.easeStandard} both`,
      animationDelay: 'var(--delay)',
    },
  },
  '@keyframes confetti-fall': { from: { opacity: 0, transform: 'translateY(0) rotate(0deg)' } },
}));

export function Celebration() {
  return (
    <Burst aria-hidden="true">
      {PIECE_IDS.map((piece) => (
        <i key={piece} style={pieceStyle(piece)} />
      ))}
    </Burst>
  );
}
