import { RotateCcw, Settings, Spade } from 'lucide-react';
import { Button, Container, styled } from '@jfrader/ui';
import { ThemeSwitch } from '@jfrader/ui/theme-switch';
import { Link, NavLink } from 'react-router-dom';
import type { ShellCommand } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { forcedColors, phone, visuallyHidden } from '../styles';

const Header = styled.header(({ theme: t }) => ({
  borderBlockEnd: `1px solid ${t.color.border}`,
  backgroundColor: t.color.bg,
}));

const Bar = styled(Container)(({ theme: t }) => ({
  maxInlineSize: config.layout.shellMaxInline,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: t.space[6],
  minBlockSize: config.layout.topbarBlock,
  minInlineSize: 0,
  [phone]: { columnGap: t.space[2], paddingInline: t.space[3] },
}));

const Brand = styled(Link)(({ theme: t }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: t.space[2],
  flexShrink: 0,
  color: t.color.text,
  fontSize: t.textSize.lg,
  fontWeight: t.fontWeight.semibold,
  letterSpacing: '-0.01em',
  textDecoration: 'none',
  borderRadius: t.radius.sm,
  '&:focus-visible': { outline: `2px solid ${t.color.focusRing}`, outlineOffset: t.space[1] },
  [phone]: { '& > span:last-of-type': visuallyHidden },
}));

const Mark = styled.span(({ theme: t }) => ({
  display: 'grid',
  placeItems: 'center',
  inlineSize: t.space[6],
  blockSize: t.space[8],
  borderRadius: t.radius.sm,
  backgroundColor: t.color.cardFace,
  color: t.color.cardInk,
  boxShadow: `inset 0 0 0 1px ${t.color.borderStrong}`,
  rotate: '-6deg',
  '& svg': { inlineSize: t.space[4], blockSize: t.space[4] },
  [forcedColors]: { border: '1px solid CanvasText' },
}));

const Navigation = styled.nav(({ theme: t }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: t.space[1],
  minInlineSize: 0,
}));

const NavigationLink = styled(NavLink)(({ theme: t }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  blockSize: t.space[8],
  paddingInline: t.space[3],
  borderRadius: t.radius.full,
  color: t.color.textMuted,
  fontSize: t.textSize.sm,
  fontWeight: t.fontWeight.medium,
  textDecoration: 'none',
  '&:hover': { color: t.color.text },
  '&[aria-current="page"]': { color: t.color.text, backgroundColor: t.color.surfaceHover },
  '&:focus-visible': { outline: `2px solid ${t.color.focusRing}`, outlineOffset: 2 },
}));

const Commands = styled.div(({ theme: t }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: t.space[2],
  marginInlineStart: 'auto',
  [phone]: { gap: t.space[1] },
}));

const CommandLabel = styled.span({ [phone]: visuallyHidden });

export function Topbar({ theme, onThemeChange, onCommand }: {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onCommand: (command: ShellCommand) => void;
}) {
  return (
    <Header>
      <Bar size="xl" paddingInline="md">
        <Brand to="/">
          <Mark aria-hidden="true"><Spade fill="currentColor" /></Mark>
          <span>{copy.app.name}</span>
        </Brand>
        <Navigation aria-label={copy.nav.label}>
          <NavigationLink to="/" end>{copy.nav.table}</NavigationLink>
          <NavigationLink to="/rules">{copy.nav.rules}</NavigationLink>
        </Navigation>
        <Commands role="group" aria-label={copy.commands.label}>
          <Button type="button" variant="ghost" size="sm" startIcon={<RotateCcw aria-hidden="true" />} onClick={() => onCommand('new-game')}>
            <CommandLabel>{copy.commands.newGame}</CommandLabel>
          </Button>
          <Button type="button" variant="ghost" size="sm" startIcon={<Settings aria-hidden="true" />} onClick={() => onCommand('settings')}>
            <CommandLabel>{copy.commands.settings}</CommandLabel>
          </Button>
          <ThemeSwitch label={copy.a11y.theme} iconOnly value={theme} onValueChange={onThemeChange} />
        </Commands>
      </Bar>
    </Header>
  );
}
