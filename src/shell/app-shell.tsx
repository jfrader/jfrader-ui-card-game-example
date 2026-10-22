import type { ReactNode } from 'react';
import { Container, styled } from '@jfrader/ui';
import type { ShellCommand } from '../contracts';
import { config } from '../config';
import { copy } from '../content/en';
import { Topbar } from './topbar';
import { Footer } from './footer';

const Shell = styled.div(({ theme }) => ({
  blockSize: '100dvh',
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
  overflow: 'hidden',
  backgroundColor: theme.color.bg,
  color: theme.color.text,
  '& *': { boxSizing: 'border-box' },
}));
const Main = styled.main(({ theme }) => ({
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  minBlockSize: 0,
  minInlineSize: 0,
  paddingBlock: theme.space[4],
  overflowY: 'auto',
  '&[data-fit="true"]': { overflow: 'hidden' },
}));
const Bounds = styled(Container)({
  maxInlineSize: config.layout.shellMaxInline,
  blockSize: '100%',
  minBlockSize: 0,
});
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
  fit,
  railFooter,
  children,
}: {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onCommand: (command: ShellCommand) => void;
  /** The child route owns the available height instead of scrolling inside `main`. */
  fit: boolean;
  /** The table rail renders the footer, so the shell must not render a second one. */
  railFooter: boolean;
  children: ReactNode;
}) {
  return (
    <Shell>
      <SkipLink href="#main">{copy.a11y.skipToContent}</SkipLink>
      <Topbar theme={theme} onThemeChange={onThemeChange} onCommand={onCommand} />
      <Main id="main" tabIndex={-1} aria-label={copy.a11y.main} data-fit={fit}>
        <Bounds size="xl" paddingInline="md">
          {children}
        </Bounds>
      </Main>
      {!railFooter && <Footer />}
    </Shell>
  );
}
