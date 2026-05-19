import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

type LabelToggleProps = {
  compact?: boolean;
};

export function LabelToggle({ compact = false }: LabelToggleProps) {
  const [isLabeled, setIsLabeled] = useState(false);
  const label = isLabeled ? 'Labeled' : 'Unlabeled';

  function handleClick(_event: React.MouseEvent<HTMLButtonElement>) {
    setIsLabeled(!isLabeled);
  }

  if (compact) {
    return (
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          color={isLabeled ? 'primary' : 'default'}
          onClick={handleClick}
          size="small"
        >
          <MaterialSymbol name={isLabeled ? 'done_all' : 'pending_actions'} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size="small"
      startIcon={<MaterialSymbol name={isLabeled ? 'done_all' : 'pending_actions'} />}
      variant={isLabeled ? 'contained' : 'outlined'}
    >
      {label}
    </Button>
  );
}
