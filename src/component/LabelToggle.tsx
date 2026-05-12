import Button from '@mui/material/Button';
import { useState } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

export function LabelToggle() {
  const [isLabeled, setIsLabeled] = useState(false);

  function handleClick(_event: React.MouseEvent<HTMLButtonElement>) {
    setIsLabeled(!isLabeled);
  }

  return (
    <Button
      onClick={handleClick}
      startIcon={<MaterialSymbol name={isLabeled ? 'done_all' : 'pending_actions'} />}
      variant={isLabeled ? 'contained' : 'outlined'}
    >
      {isLabeled ? 'Labeled' : 'Unlabeled'}
    </Button>
  );
}
