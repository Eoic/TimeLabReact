import Icon from '@mui/material/Icon';

export type MaterialSymbolName =
  | 'add'
  | 'auto_awesome'
  | 'check'
  | 'chevron_left'
  | 'chevron_right'
  | 'delete'
  | 'done_all'
  | 'download'
  | 'edit'
  | 'folder'
  | 'folder_open'
  | 'grid_view'
  | 'hourglass_empty'
  | 'keyboard_arrow_down'
  | 'label'
  | 'palette'
  | 'pending_actions'
  | 'tune'
  | 'upload'
  | 'vital_signs'
  | 'database';

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
