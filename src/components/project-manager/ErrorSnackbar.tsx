import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export type ErrorSnackbarState = {
  isOpen: boolean;
  message: string;
};

type ErrorSnackbarProps = {
  state: ErrorSnackbarState;
  onClose: VoidFunction;
  onExited: VoidFunction;
};

export function ErrorSnackbar({ onClose, onExited, state }: ErrorSnackbarProps) {
  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={6000}
      onClose={onClose}
      open={state.isOpen}
      slotProps={{
        transition: {
          onExited,
        },
      }}
    >
      <Alert onClose={onClose} severity="error" variant="filled">
        {state.message}
      </Alert>
    </Snackbar>
  );
}
