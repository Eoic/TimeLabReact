import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { Project } from '../../database/entities';

type DeleteProjectDialogProps = {
  errorMessage?: string;
  isOpen: boolean;
  project: Project | null;
  onClose: VoidFunction;
  onDelete: VoidFunction;
  onErrorClose?: VoidFunction;
  onExited: VoidFunction;
};

export function DeleteProjectDialog({
  errorMessage = '',
  isOpen,
  onClose,
  onDelete,
  onErrorClose,
  onExited,
  project,
}: DeleteProjectDialogProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onClose}
      open={isOpen}
      disableAutoFocus
      slotProps={{
        transition: {
          onExited,
        },
      }}
    >
      <DialogTitle>Delete project</DialogTitle>
      <DialogContent>
        {errorMessage ? (
          <Alert onClose={onErrorClose} severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}
        <DialogContentText>Delete {project?.title}? This removes the project from this session.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onDelete} variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
