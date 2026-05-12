import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { MaterialSymbol } from './MaterialSymbol';
import { ThemeSelector } from './ThemeSelector';

export function Header() {
  return (
    <AppBar
      color="default"
      component="header"
      position="static"
    >
      <Toolbar>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            gap: 1,
          }}
        >
          <MaterialSymbol name="vital_signs" />
          <Typography component="span" variant="h6">
            TimeLab
          </Typography>
        </Box>

        <ThemeSelector />
      </Toolbar>
    </AppBar>
  );
}
