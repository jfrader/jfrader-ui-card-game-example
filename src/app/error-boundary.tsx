import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, styled } from '@jfrader/ui';
import { copy } from '../content/en';

const Page = styled.div(({ theme: t }) => ({
  display: 'grid',
  placeContent: 'center',
  justifyItems: 'start',
  gap: t.space[4],
  minBlockSize: '100dvh',
  paddingInline: t.space[4],
  backgroundColor: t.color.bg,
  color: t.color.text,
  '& > *': { maxInlineSize: '40rem' },
}));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Page>
        <Alert tone="danger" title={copy.errors.renderTitle}>
          {copy.errors.renderBody}
        </Alert>
        <Button type="button" variant="solid" tone="accent" onClick={() => window.location.reload()}>
          {copy.errors.reload}
        </Button>
      </Page>
    );
  }
}
