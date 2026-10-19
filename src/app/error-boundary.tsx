import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, Stack } from '@jfrader/ui';
import { copy } from '../content/en';

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
      <Stack gap="md" align="start">
        <Alert tone="danger" title={copy.errors.renderTitle}>
          {copy.errors.renderBody}
        </Alert>
        <Button onClick={() => window.location.reload()}>{copy.errors.reload}</Button>
      </Stack>
    );
  }
}
