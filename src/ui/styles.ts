import { styled, type theme } from '@jfrader/ui';
import { config } from '../config';

export type Theme = typeof theme;

export const phone = `@media (max-width: ${config.breakpoints.compactChrome}px)`;
export const reducedMotionOff = '@media (prefers-reduced-motion: no-preference)';
export const forcedColors = '@media (forced-colors: active)';

export const visuallyHidden = {
  position: 'absolute',
  inlineSize: 1,
  blockSize: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export const VisuallyHidden = styled.span(visuallyHidden);

/** Small label above a value: HUD stats, panel sections. */
export const eyebrow = (t: Theme) => ({
  display: 'block',
  color: t.color.textMuted,
  fontSize: t.textSize.xs,
  fontWeight: t.fontWeight.medium,
  lineHeight: t.lineHeight.tight,
});

export const Eyebrow = styled.span(({ theme: t }) => eyebrow(t));
