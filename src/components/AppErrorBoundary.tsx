import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Unhandled app error.', error, errorInfo);
    }
  }

  override render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          TimeLab could not render this workspace.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
          Refresh the page to retry. If the issue persists, clear local project data from the browser site settings.
        </Typography>
        <Button onClick={() => window.location.reload()} variant="contained">
          Reload
        </Button>
      </Stack>
    );
  }
}
