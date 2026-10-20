import { styled } from '@jfrader/ui';
import { config } from '../../config';
import { phone, type Theme } from '../../ui/styles';

const mix = (color: string, base: string, percent: number) =>
  `color-mix(in oklab, ${color} ${percent}%, ${base})`;

/** The one saturated material in the app: the felt under the cards. */
export const feltMaterial = (t: Theme) => ({
  backgroundColor: mix(t.color.success, t.color.surfaceInset, 24),
  backgroundImage: `radial-gradient(ellipse at 50% 42%, ${mix(t.color.success, t.color.surfaceInset, 36)}, ${mix(t.color.success, t.color.surfaceInset, 16)} 78%)`,
});

/** Fills the viewport below the topbar on tablet and desktop; flows naturally on phones. */
export const Stage = styled.section(({ theme: t }) => ({
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr) auto',
  blockSize: `clamp(${config.layout.stageMinBlock}px, calc(100dvh - ${config.layout.topbarBlock}px - 2 * ${t.space[4]}), ${config.layout.stageMaxBlock}px)`,
  minInlineSize: 0,
  overflow: 'clip',
  border: `1px solid ${t.color.border}`,
  borderRadius: t.radius.lg,
  backgroundColor: t.color.surface,
  color: t.color.text,
  [phone]: {
    display: 'flex',
    flexDirection: 'column',
    blockSize: 'auto',
    gap: t.space[3],
    overflow: 'visible',
    border: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
}));

export const Board = styled.div(({ theme: t }) => ({
  position: 'relative',
  minBlockSize: 0,
  minInlineSize: 0,
  backgroundColor: t.color.surfaceInset,
  '& [data-ui~="game-table-surface"]': {
    ...feltMaterial(t),
    boxShadow: `inset 0 0 ${t.space[10]} ${t.color.scrim}`,
  },
}));

/** Corner HUD rows laid over the board, outside the felt ellipse. Only their items take pointer input. */
export const BoardBar = styled.div<{ $edge: 'start' | 'end' }>(({ theme: t, $edge }) => ({
  position: 'absolute',
  insetInline: t.space[4],
  ...($edge === 'start' ? { insetBlockStart: t.space[3] } : { insetBlockEnd: t.space[3] }),
  zIndex: 1,
  display: 'flex',
  alignItems: $edge === 'start' ? 'flex-start' : 'flex-end',
  justifyContent: 'space-between',
  gap: t.space[4],
  pointerEvents: 'none',
  '& > *': { pointerEvents: 'auto' },
}));

/** Phone rows that carry the same HUD pieces in normal flow. */
export const FlowBar = styled.div(({ theme: t }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: t.space[3],
  minInlineSize: 0,
}));

export const Dock = styled.div(({ theme: t }) => ({
  display: 'flex',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingBlock: t.space[1],
  paddingInline: t.space[4],
  borderBlockStart: `1px solid ${t.color.border}`,
  backgroundColor: t.color.surface,
  [phone]: {
    paddingInline: 0,
    borderBlockStart: 0,
    backgroundColor: 'transparent',
  },
}));

