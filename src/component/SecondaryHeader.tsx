import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { MaterialSymbol } from './MaterialSymbol';
import { LabelToggle } from './LabelToggle';
import { ProjectManager } from './ProjectManager';

export function SecondaryHeader() {
  return (
    <Toolbar
      component="section"
      variant="dense"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        gap: 1,
        overflowX: 'auto',
        py: 1.5,
      }}
    >
      <ProjectManager />

      <Button
        startIcon={<MaterialSymbol name="upload" />}
        variant="outlined"
      >
        Upload data
      </Button>

      <Button
        startIcon={<MaterialSymbol name="folder_open" />}
        variant="outlined"
      >
        Manage data
      </Button>

      <Button
        disabled
        startIcon={<MaterialSymbol name="download" />}
        variant="outlined"
      >
        Export labels
      </Button>

      <Button
        disabled
        startIcon={<MaterialSymbol name="auto_awesome" />}
        variant="outlined"
      >
        Load example
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <LabelToggle />

      <ButtonGroup aria-label="Page navigation" variant="outlined">
        <IconButton aria-label="Previous page" disabled size="small">
          <MaterialSymbol name="chevron_left" />
        </IconButton>
        <Box
          sx={{
            alignItems: 'center',
            borderColor: 'divider',
            display: 'flex',
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

      <IconButton aria-label="Open panel layout" size="small">
        <MaterialSymbol name="grid_view" />
      </IconButton>
    </Toolbar>
  );
}
