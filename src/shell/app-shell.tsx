import type { ReactNode } from 'react';
import { Container, styled } from '@jfrader/ui';
import type { ShellCommand } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { Topbar } from './topbar';
import { Footer } from './footer';

const Shell = styled.div(({ theme }) => ({
  minBlockSize: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.color.bg,
  color: theme.color.text,
  '& *': { boxSizing: 'border-box' },
}));
const Main = styled.main(({ theme }) => ({
  flex: 1,
  minInlineSize: 0,
  paddingBlock: theme.space[4],
}));
const Bounds = styled(Container)({ maxInlineSize: config.layout.shellMaxInline });
const SkipLink = styled.a(({ theme }) => ({
  position: 'fixed',
  insetBlockStart: theme.space[2],
  insetInlineStart: theme.space[2],
  zIndex: 100,
  padding: theme.space[3],
  backgroundColor: theme.color.surface,
  color: theme.color.text,
  borderRadius: theme.radius.sm,
  transform: 'translateY(-200%)',
  '&:focus': { transform: 'translateY(0)' },
}));

export function AppShell({
  theme,
  onThemeChange,
  onCommand,
  children,
}: {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onCommand: (command: ShellCommand) => void;
  children: ReactNode;
}) {
  return (
    <Shell>
      <SkipLink href="#main">{copy.a11y.skipToContent}</SkipLink>
      <Topbar theme={theme} onThemeChange={onThemeChange} onCommand={onCommand} />
      <Main id="main" tabIndex={-1} aria-label={copy.a11y.main}>
        <Bounds size="xl" paddingInline="md">
          {children}
        </Bounds>
      </Main>
      <Footer />
    </Shell>
  );
}
