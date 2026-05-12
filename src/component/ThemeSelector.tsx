import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { useTheme } from '../theme/useTheme';
import type { ThemeMode } from '../theme/theme';

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'OLED', value: 'oled' },
];

export function ThemeSelector() {
  const { setThemeMode, themeMode } = useTheme();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  const isOpen = Boolean(anchorElement);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorElement(null);
  };

  const selectThemeMode = (nextThemeMode: ThemeMode) => {
    setThemeMode(nextThemeMode);
    closeMenu();
  };

  return (
    <>
      <IconButton
        aria-label="Theme settings"
        aria-controls={isOpen ? 'theme-selector-menu' : undefined}
        aria-expanded={isOpen ? 'true' : undefined}
        aria-haspopup="menu"
        id="theme-selector-button"
        onClick={openMenu}
        title="Theme settings"
      >
        <MaterialSymbol name="palette" />
      </IconButton>

      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        id="theme-selector-menu"
        onClose={closeMenu}
        open={isOpen}
        slotProps={{
          list: {
            'aria-labelledby': 'theme-selector-button',
          },
          paper: {
            sx: {
              minWidth: 192,
            },
          },
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              selectThemeMode(option.value);
            }}
            selected={themeMode === option.value}
          >
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
