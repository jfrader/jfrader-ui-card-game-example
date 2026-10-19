import { Container, Flex, styled } from '@jfrader/ui';
import { ThemeSwitch } from '@jfrader/ui/theme-switch';
import { Menu } from '@jfrader/ui/menu';
import { Tooltip } from '@jfrader/ui/tooltip';
import { NavLink, Link } from 'react-router-dom';
import type { ShellCommand } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';

const Header = styled.header(({ theme }) => ({ borderBlockEnd: `1px solid ${theme.color.border}` }));
const Bar = styled(Container)(({ theme }) => ({
  maxInlineSize: config.layout.shellMaxInline, display: 'flex', alignItems: 'center', flexWrap: 'wrap',
  gap: theme.space[5], minBlockSize: `calc(${theme.space[8]} * 2)`, minInlineSize: 0,
  [`@media (max-width: ${config.breakpoints.compactChrome}px)`]: { gap: theme.space[2], paddingInline: theme.space[3] },
}));
const Wordmark = styled(Link)(({ theme }) => ({
  color: theme.color.text, fontWeight: theme.fontWeight.semibold, textDecoration: 'none',
  fontSize: theme.textSize.lg, flexShrink: 0,
}));
const Navigation = styled.nav(({ theme }) => ({
  display: 'flex', gap: theme.space[4], alignItems: 'center', flexWrap: 'wrap', minInlineSize: 0,
  [`@media (max-width: ${config.breakpoints.compactChrome}px)`]: { gap: theme.space[2] },
}));
const NavigationLink = styled(NavLink)(({ theme }) => ({
  display: 'inline-flex', alignItems: 'center', minBlockSize: theme.space[12],
  color: theme.color.textMuted, textDecoration: 'none', fontSize: theme.textSize.sm,
  '&[aria-current="page"]': { color: theme.color.text, textDecoration: 'underline', textUnderlineOffset: theme.space[1] },
}));
const Controls = styled(Flex)(({ theme }) => ({ marginInlineStart: 'auto', alignItems: 'center', gap: theme.space[3] }));
const QuickRules = styled.span({
  display: 'inline-flex',
  [`@media (max-width: ${config.breakpoints.compactChrome}px)`]: { display: 'none' },
});

export function Topbar({ theme, onThemeChange, onCommand }: {
  theme: 'light' | 'dark'; onThemeChange: (theme: 'light' | 'dark') => void;
  onCommand: (command: ShellCommand) => void;
}) {
  return <Header><Bar size="xl" paddingInline="md">
    <Wordmark to="/">{copy.app.name}</Wordmark>
    <Navigation aria-label={copy.nav.menuLabel}>
      <NavigationLink to="/" end>{copy.nav.table}</NavigationLink>
      <NavigationLink to="/rules">{copy.nav.rules}</NavigationLink>
    </Navigation>
    <Controls>
      <ThemeSwitch label={copy.a11y.theme} iconOnly value={theme} onValueChange={onThemeChange} />
      <Menu>
        <Menu.Trigger aria-label={copy.nav.menuLabel}>•••</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => onCommand('settings')}>{copy.menu.settings}</Menu.Item>
          <Menu.Item onSelect={() => onCommand('rules')}>{copy.menu.rules}</Menu.Item>
          <Menu.Item onSelect={() => onCommand('settings')}>{copy.menu.stats}</Menu.Item>
          <Menu.Separator />
          <Menu.Item onSelect={() => onCommand('new-game')}>{copy.menu.newGame}</Menu.Item>
        </Menu.Content>
      </Menu>
      <QuickRules><Tooltip content={copy.rules.shortSummary} triggerLabel="?" slotProps={{ trigger: { 'aria-label': copy.nav.rules, onClick: () => onCommand('rules') } }} /></QuickRules>
    </Controls>
  </Bar></Header>;
}
