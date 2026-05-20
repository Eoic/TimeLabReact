import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from './useTheme';
import type { ResolvedTheme } from './theme';

type MuiThemeBridgeProps = {
  children: ReactNode;
};

const themePalette: Record<
  ResolvedTheme,
  {
    background: {
      default: string;
      paper: string;
    };
    divider: string;
    mode: 'dark' | 'light';
    primary: {
      contrastText: string;
      main: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  }
> = {
  light: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    divider: '#dee2e6',
    primary: {
      main: '#4f56d9',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  dark: {
    mode: 'dark',
    background: {
      default: '#1a1a1a',
      paper: '#242424',
    },
    divider: '#404040',
    primary: {
      main: '#8ea2ff',
      contrastText: '#0b1020',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
  },
  oled: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#0a0a0a',
    },
    divider: '#2a2a2a',
    primary: {
      main: '#a78bfa',
      contrastText: '#14091f',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
};

export function MuiThemeBridge({ children }: MuiThemeBridgeProps) {
  const { resolvedTheme } = useTheme();

  const muiTheme = useMemo(() => {
    const palette = themePalette[resolvedTheme];

    return createTheme({
      palette: {
        mode: palette.mode,
        primary: palette.primary,
        background: palette.background,
        divider: palette.divider,
        text: palette.text,
      },
      typography: {
        fontFamily: [
          'IBM Plex Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(', '),
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: palette.background.default,
              color: palette.text.primary,
            },
          },
        },
        MuiIcon: {
          defaultProps: {
            baseClassName: 'material-symbols-rounded',
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    });
  }, [resolvedTheme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
