import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { CreateProjectFormData } from '../forms/project';

type ProjectDialogProps = {
  id: string;
  errorMessage?: string;
  title: string;
  values: CreateProjectFormData;
  isOpen: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onClose: VoidFunction;
  onErrorClose?: VoidFunction;
  onExited: VoidFunction;
  onSave: VoidFunction;
};

export function ProjectDialog({
  id,
  errorMessage = '',
  isOpen,
  onChange,
  onClose,
  onErrorClose,
  onExited,
  onSave,
  title,
  values,
}: ProjectDialogProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    if (event.shiftKey || event.altKey || event.ctrlKey) {
      return;
    }

    event.preventDefault();
    onSave();
  }

  return (
    <Dialog
      disableRestoreFocus
      fullWidth
      maxWidth="xs"
      onClose={onClose}
      open={isOpen}
      onKeyDown={handleKeyDown}
      slotProps={{
        transition: {
          onExited,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {errorMessage ? (
            <Alert onClose={onErrorClose} severity="error">
              {errorMessage}
            </Alert>
          ) : null}
          <TextField
            name="title"
            autoFocus
            fullWidth
            id={id}
            label="Title"
            onChange={onChange}
            value={values.title}
            required
          />
          <TextField
            name="description"
            fullWidth
            label="Description"
            minRows={3}
            multiline
            onChange={onChange}
            value={values.description}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!values.title.trim()} onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
