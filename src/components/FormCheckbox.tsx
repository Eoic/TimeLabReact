import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

type FormCheckboxProps = {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export function FormCheckbox({ label, isChecked, onChange }: FormCheckboxProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox checked={isChecked} onChange={(event) => onChange(event.target.checked)} sx={{ ml: -0.25, p: 0 }} />
      }
      label={label}
      sx={{ alignItems: 'center', gap: 1, ml: 0, mr: 0 }}
    />
  );
}
