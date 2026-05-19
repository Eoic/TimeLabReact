import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LabelToggle } from './LabelToggle';
import { MaterialSymbol } from './MaterialSymbol';
import type { MaterialSymbolName } from './MaterialSymbol';
import { ProjectManager } from './ProjectManager';

type PrimaryAction = {
  label: string;
  icon: MaterialSymbolName;
  disabled?: boolean;
};

const primaryActions: PrimaryAction[] = [
  {
    label: 'Upload data',
    icon: 'upload',
  },
  {
    label: 'Manage data',
    icon: 'database',
  },
  {
    label: 'Export labels',
    icon: 'download',
    disabled: true,
  },
  {
    label: 'Load example',
    icon: 'auto_awesome',
    disabled: true,
  },
];

function DesktopActionButtons() {
  return (
    <Box
      sx={{
        display: {
          lg: 'contents',
          xs: 'none',
        },
      }}
    >
      {primaryActions.map((action) => (
        <Button
          disabled={action.disabled}
          key={action.label}
          size="small"
          startIcon={<MaterialSymbol name={action.icon} />}
          variant="outlined"
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
}

function IconActionButtons() {
  return (
    <Box
      sx={{
        display: {
          lg: 'none',
          xs: 'contents',
        },
      }}
    >
      {primaryActions.map((action) => (
        <Tooltip key={action.label} title={action.label}>
          <span>
            <IconButton aria-label={action.label} disabled={action.disabled} size="small">
              <MaterialSymbol name={action.icon} />
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Box>
  );
}

function PrimaryActions() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flex: '0 0 auto',
        flexWrap: 'nowrap',
        gap: {
          lg: 1,
          xs: 0.5,
        },
      }}
    >
      <ProjectManager />
      <DesktopActionButtons />
      <IconActionButtons />
    </Box>
  );
}

function PageNavigation() {
  return (
    <ButtonGroup aria-label="Page navigation" size="small" variant="outlined">
      <IconButton aria-label="Previous page" disabled size="small">
        <MaterialSymbol name="chevron_left" />
      </IconButton>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          px: 1.5,
        }}
      >
        <Typography noWrap variant="body2">
          1 / 1
        </Typography>
      </Box>
      <IconButton aria-label="Next page" disabled size="small">
        <MaterialSymbol name="chevron_right" />
      </IconButton>
    </ButtonGroup>
  );
}

function ContextActions() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flex: '0 0 auto',
        flexWrap: 'nowrap',
        gap: {
          sm: 1,
          xs: 0.5,
        },
      }}
    >
      <Box
        sx={{
          display: {
            lg: 'block',
            xs: 'none',
          },
        }}
      >
        <LabelToggle />
      </Box>
      <Box
        sx={{
          display: {
            lg: 'none',
            xs: 'block',
          },
        }}
      >
        <LabelToggle compact />
      </Box>

      <PageNavigation />

      <IconButton aria-label="Open panel layout" size="small">
        <MaterialSymbol name="grid_view" />
      </IconButton>
    </Box>
  );
}

export function SecondaryHeader() {
  return (
    <Box
      component="nav"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: {
            lg: 2,
            xs: 1,
          },
          justifyContent: 'space-between',
          minHeight: 'auto',
          minWidth: 0,
          py: 1,
          rowGap: 1,
        }}
      >
        <PrimaryActions />
        <ContextActions />
      </Toolbar>
    </Box>
  );
}
