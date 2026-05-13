import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { MaterialSymbol } from './MaterialSymbol';
import { ThemeSelector } from './ThemeSelector';

function Brand() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 1,
        minWidth: 'max-content',
      }}
    >
      <MaterialSymbol name="vital_signs" />
      <Typography component="span" noWrap variant="h6">
        TimeLab
      </Typography>
    </Box>
  );
}

export function Header() {
  return (
    <AppBar
      color="default"
      component="header"
      elevation={0}
      position="static"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
          minHeight: {
            sm: 64,
            xs: 56,
          },
        }}
      >
        <Brand />
        <ThemeSelector />
      </Toolbar>
    </AppBar>
  );
}
