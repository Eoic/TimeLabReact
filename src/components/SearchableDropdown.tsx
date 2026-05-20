import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { MaterialSymbol } from './MaterialSymbol';

export type SearchableDropdownOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

type SearchableDropdownProps<TValue extends string> = {
  label: string;
  onChange: (value: TValue) => void;
  options: readonly [SearchableDropdownOption<TValue>, ...SearchableDropdownOption<TValue>[]];
  value: TValue;
};

export function SearchableDropdown<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: SearchableDropdownProps<TValue>) {
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <Autocomplete<SearchableDropdownOption<TValue>, false, true, false>
      disableClearable
      fullWidth
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selectedValue) => option.value === selectedValue.value}
      onChange={(_event, option) => onChange(option.value)}
      options={options}
      renderInput={(params) => <TextField {...params} label={label} />}
      renderOption={(optionProps, option, { selected }) => (
        <Box
          component="li"
          {...optionProps}
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 1,
          }}
        >
          <Box
            aria-hidden
            sx={{
              color: 'primary.main',
              display: 'flex',
              visibility: selected ? 'visible' : 'hidden',
              width: 24,
            }}
          >
            <MaterialSymbol name="check" />
          </Box>
          {option.label}
        </Box>
      )}
      size="small"
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            border: 1,
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 40px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(255, 255, 255, 0.04)'
                : theme.shadows[8],
          },
        },
      }}
      value={selectedOption}
    />
  );
}
