import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

type ProjectDialogProps = {
  id: string;
  title: string;
  value: string;
  isOpen: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onClose: VoidFunction;
  onExited: VoidFunction;
  onSave: VoidFunction;
};

export function ProjectDialog({
  id,
  isOpen,
  onChange,
  onClose,
  onExited,
  onSave,
  title,
  value,
}: ProjectDialogProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter') {
      return;
    }

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
        <TextField
          autoFocus
          fullWidth
          id={id}
          label="Project name"
          margin="dense"
          onChange={onChange}
          value={value}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!value.trim()} onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
