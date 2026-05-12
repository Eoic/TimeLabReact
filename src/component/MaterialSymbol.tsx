import Icon from '@mui/material/Icon';

type MaterialSymbolName = 'palette' | 'vital_signs';

type MaterialSymbolProps = {
  name: MaterialSymbolName;
  label?: string;
};

export function MaterialSymbol({ label, name }: MaterialSymbolProps) {
  return (
    <Icon
      aria-hidden={label ? undefined : true}
      aria-label={label}
      baseClassName="material-symbols-rounded"
      role={label ? 'img' : undefined}
    >
      {name}
    </Icon>
  );
}
