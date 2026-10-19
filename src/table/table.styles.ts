import { styled } from '@jfrader/ui';
import { config } from '../config';

export const BoardFrame = styled.div(({ theme }) => ({
  inlineSize: '100%', minInlineSize: 0, blockSize: config.layout.desktopTableBlock,
  border: `1px solid ${theme.color.borderSubtle}`, borderRadius: theme.radius.lg,
  backgroundColor: theme.color.bg,
  '& *': { minInlineSize: 0 },
  [`@media (max-width: ${config.breakpoints.inlineSidebar - 1}px)`]: { blockSize: config.layout.tabletTableBlock },
  [`@media (max-width: ${config.breakpoints.compactChrome}px)`]: {
    blockSize: config.layout.phoneTableBlock, minBlockSize: config.layout.phoneTableBlock,
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

export const SeatFrame = styled.div(({ theme }) => ({
  minInlineSize: 0, maxInlineSize: 160, padding: theme.space[1], borderRadius: theme.radius.md,
  '&[data-active="true"]': { outline: `2px solid ${theme.color.accent}` },
  '&[data-compact="true"]': { maxInlineSize: 100, fontSize: theme.textSize.xs },
  '&[data-compact="true"] [data-ui~="game-seat"]': { fontSize: theme.textSize.xs },
}));

export const PileFrame = styled.div(({ theme }) => ({
  inlineSize: `calc(var(--game-card-width, ${theme.size.gameCardSm}) + ${theme.space[4]})`,
  blockSize: `calc(var(--game-card-width, ${theme.size.gameCardSm}) * 1.4 + ${theme.space[4]})`,
}));

export const HandRegion = styled.section(({ theme }) => ({
  minInlineSize: 0, inlineSize: '100%', textAlign: 'center',
  '& h2': { fontSize: theme.textSize.sm, margin: 0 },
  '& p': { fontSize: theme.textSize.sm, marginBlock: theme.space[1] },
}));

export const HandScrollContent = styled.div(({ theme }) => ({
  inlineSize: 'max-content', minInlineSize: '100%', boxSizing: 'border-box',
  padding: theme.space[3], display: 'flex', justifyContent: 'center',
}));

export const HandCardButton = styled.button(({ theme }) => ({
  '&[data-illegal="true"][data-hints="true"]': { opacity: 0.5 },
  '&:focus-visible': { outline: `2px solid ${theme.color.focusRing}`, outlineOffset: theme.space[1] },
}));

export const TrumpFace = styled.div(({ theme }) => ({
  display: 'grid', placeContent: 'center', gap: theme.space[1], blockSize: '100%',
  padding: theme.space[1], boxSizing: 'border-box', textAlign: 'center',
  backgroundColor: theme.color.surfaceRaised, color: theme.color.text,
  fontSize: theme.textSize.xs, overflowWrap: 'anywhere', border: `1px solid ${theme.color.borderControl}`,
}));

export const AnnouncementFrame = styled.div(({ theme }) => ({
  position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
  pointerEvents: 'none', padding: theme.space[4],
}));
