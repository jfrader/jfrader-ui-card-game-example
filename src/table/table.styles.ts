import { styled } from '@jfrader/ui';
import { config } from '../config';

const felt = (color: string, inset: string, mix: number) =>
  `color-mix(in oklab, ${color} ${mix}%, ${inset})`;

export const BoardFrame = styled.div(({ theme }) => ({
  inlineSize: '100%', minInlineSize: 0,
  blockSize: `clamp(${config.layout.tableMinBlock}px, calc(100dvh - ${config.layout.tableChromeBlock}px), ${config.layout.tableMaxBlock}px)`,
  border: `1px solid ${theme.color.borderSubtle}`, borderRadius: theme.radius.xl,
  backgroundColor: theme.color.bg,
  boxShadow: theme.shadow.raised,
  '& *': { minInlineSize: 0 },
  '& [data-ui~="game-table-surface"]': {
    backgroundColor: theme.color.surfaceInset,
    backgroundImage: `radial-gradient(ellipse at 50% 38%, ${felt(theme.color.success, theme.color.surfaceInset, 34)}, ${felt(theme.color.success, theme.color.surfaceInset, 12)})`,
    boxShadow: `inset 0 0 ${theme.space[8]} ${theme.color.scrim}`,
  },
}));

export const TableLayout = styled.section(({ theme }) => ({
  minInlineSize: 0, display: 'grid', gap: theme.space[3], color: theme.color.text,
}));

export const Strip = styled.div(({ theme }) => ({
  display: 'grid', gap: theme.space[2], minInlineSize: 0, inlineSize: '100%',
  textAlign: 'center', fontSize: theme.textSize.sm,
  '& [data-ui~="game-rounds-list"]': { justifyContent: 'center' },
}));

export const Inline = styled.div(({ theme }) => ({
  display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: theme.space[2],
}));

export const StatusRow = styled.div(({ theme }) => ({
  display: 'grid', gridTemplateColumns: 'auto auto minmax(0, 1fr)', alignItems: 'center', gap: theme.space[5],
  minInlineSize: 0, fontSize: theme.textSize.sm,
  '& > :first-of-type': { display: 'flex', alignItems: 'baseline', gap: theme.space[2] },
  '& > :first-of-type strong': { fontSize: theme.textSize.lg },
  '& > :first-of-type span': { color: theme.color.textMuted },
  '& [data-ui~="game-rounds-label"]': {
    position: 'absolute', inlineSize: 1, blockSize: 1, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
  },
  '& [data-ui~="game-rounds-round"]': { display: 'flex', gap: theme.space[1], paddingBlock: theme.space[1], paddingInline: theme.space[2] },
  '& [data-outcome="pending"] [data-ui~="game-rounds-outcome"]': { display: 'none' },
}));

export const SeatFrame = styled.div(({ theme }) => ({
  minInlineSize: 0, maxInlineSize: 160, padding: theme.space[1], borderRadius: theme.radius.md,
  '&[data-active="true"]': { outline: `2px solid ${theme.color.accent}` },
  '&[data-compact="true"]': { maxInlineSize: 100, fontSize: theme.textSize.xs },
  '&[data-compact="true"] [data-ui~="game-seat"]': { fontSize: theme.textSize.xs },
}));

export const TrickGrid = styled.div(({ theme }) => ({
  position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: theme.space[2], alignItems: 'end', justifyItems: 'center', minInlineSize: 0,
  '&[data-surface="felt"]': { gap: theme.space[3], gridTemplateColumns: 'repeat(4, max-content)' },
}));

export const TrickCell = styled.div(({ theme }) => ({
  display: 'grid', gap: theme.space[1], justifyItems: 'center', minInlineSize: 0,
  fontSize: theme.textSize.xs, color: theme.color.textMuted, textAlign: 'center',
  '[data-surface="felt"] > &': { color: theme.color.text, fontSize: theme.textSize.sm, fontWeight: theme.fontWeight.medium },
}));

export const PlayEnter = styled.div(({ theme }) => ({
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `play-enter ${theme.motion.duration.cardPlay} ${theme.motion.easeStandard} both`,
  },
  '&[data-from="south"]': { '--enter-y': theme.space[8] },
  '&[data-from="north"]': { '--enter-y': `calc(-1 * ${theme.space[8]})` },
  '&[data-from="west"]': { '--enter-x': `calc(-1 * ${theme.space[8]})` },
  '&[data-from="east"]': { '--enter-x': theme.space[8] },
  '@keyframes play-enter': {
    from: { opacity: 0, transform: 'translate(var(--enter-x, 0), var(--enter-y, 0)) scale(0.9)' },
  },
}));

export const EmptySlot =styled.div<{ $size: string }>(({ theme, $size }) => ({
  inlineSize: $size, blockSize: `calc(${$size} * 1.4)`, maxInlineSize: '100%',
  border: `1px dashed ${theme.color.borderControl}`, borderRadius: `calc(${$size} / 8)`,
}));

export const HandDock = styled.div(({ theme }) => ({
  position: 'sticky', insetBlockEnd: 0, zIndex: 2,
  display: 'grid', gridTemplateColumns: 'minmax(max-content, 1fr) auto minmax(max-content, 1fr)', alignItems: 'center',
  gap: theme.space[3], minInlineSize: 0, padding: theme.space[2],
  border: `1px solid ${theme.color.borderSubtle}`, borderRadius: theme.radius.xl,
  backgroundColor: theme.color.surface, boxShadow: theme.shadow.floating,
  '& section h2, & section p': { display: 'inline', margin: 0 },
  '& section h2': { marginInlineEnd: theme.space[2] },
  '& section p': { color: theme.color.textMuted },
  [`@media (max-width: ${config.breakpoints.inlineSidebar - 1}px)`]: {
    position: 'static', gridTemplateColumns: 'auto minmax(0, 1fr)',
  },
}));

export const DockSlot = styled.div<{ $align: 'start' | 'center' | 'end' }>(({ $align }) => ({
  minInlineSize: 0, justifySelf: $align,
  [`@media (max-width: ${config.breakpoints.inlineSidebar - 1}px)`]: {
    justifySelf: 'center', ...($align === 'end' && { gridColumn: '1 / -1' }),
  },
}));

export const HandRegion = styled.section(({ theme }) => ({
  minInlineSize: 0, inlineSize: '100%', textAlign: 'center',
  '& h2': { fontSize: theme.textSize.sm, margin: 0 },
  '& p': { fontSize: theme.textSize.sm, marginBlock: theme.space[1] },
  '&[data-compact="true"]': { inlineSize: 'auto', marginInline: `calc(-1 * ${theme.space[4]})` },
}));

export const HandScrollContent = styled.div(({ theme }) => ({
  inlineSize: 'max-content', minInlineSize: '100%', boxSizing: 'border-box',
  paddingBlock: theme.space[3], paddingInline: theme.space[1], display: 'flex', justifyContent: 'center',
}));

export const HandCardButton = styled.button(({ theme }) => ({
  '&[data-illegal="true"][data-hints="true"]': { opacity: 0.5 },
  '&:focus-visible': { outline: `2px solid ${theme.color.focusRing}`, outlineOffset: theme.space[1] },
}));

export const TrumpFace = styled.div(({ theme }) => ({
  display: 'grid', placeContent: 'center', gap: theme.space[1], blockSize: '100%',
  padding: theme.space[1], boxSizing: 'border-box', textAlign: 'center',
  backgroundColor: theme.color.cardFace, color: theme.color.cardInk,
  fontSize: theme.textSize.xs, overflowWrap: 'anywhere', border: `1px solid ${theme.color.borderControl}`,
  '&[data-red="true"]': { color: theme.color.cardRed },
}));

export const AnnouncementFrame = styled.div(({ theme }) => ({
  position: 'absolute', inset: 0, display: 'grid', placeItems: 'start center',
  pointerEvents: 'none', padding: theme.space[2],
}));
