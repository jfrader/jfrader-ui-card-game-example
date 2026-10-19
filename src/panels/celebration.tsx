import type { CSSProperties } from 'react';
import { styled, theme } from '@jfrader/ui';

const PIECES = 28;
const LANE_PRIME = 37;
const DELAY_PRIME = 53;
const DELAY_SPAN_MS = 900;
const REST_BASE_PX = 6;
const REST_PRIME = 17;
const REST_SPAN_PX = 40;
const TURN_PRIME = 47;
const TURN_SPAN_DEG = 180;
const TONES = [theme.color.accent, theme.color.success, theme.color.warning, theme.color.info];

const Burst = styled.div(({ theme: t }) => ({
  position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit',
  '& i': {
    position: 'absolute', insetBlockStart: 0, inlineSize: t.space[2], blockSize: t.space[3],
    insetInlineStart: 'var(--lane)', borderRadius: t.radius.sm, opacity: 0.85,
    backgroundColor: 'var(--tone)', transform: 'translateY(var(--rest)) rotate(var(--turn))',
    '@media (prefers-reduced-motion: no-preference)': {
      animation: `confetti-fall ${t.motion.duration.slow} ${t.motion.easeStandard} both`,
      animationDelay: 'var(--delay)',
    },
  },
  '@keyframes confetti-fall': { from: { opacity: 0, transform: 'translateY(0) rotate(0deg)' } },
}));

export function Celebration() {
  return (
    <Burst aria-hidden="true">
      {Array.from({ length: PIECES }, (_, index) => (
        <i key={index} style={{
          '--lane': `${(index * LANE_PRIME) % 100}%`,
          '--delay': `${(index * DELAY_PRIME) % DELAY_SPAN_MS}ms`,
          '--rest': `${REST_BASE_PX + ((index * REST_PRIME) % REST_SPAN_PX)}px`,
          '--turn': `${(index * TURN_PRIME) % TURN_SPAN_DEG}deg`,
          '--tone': TONES[index % TONES.length],
        } as CSSProperties} />
      ))}
    </Burst>
  );
}
