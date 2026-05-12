import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './theme-context';
import {
  applyTheme,
  getSystemTheme,
  isThemeMode,
  readStoredThemeMode,
  THEME_STORAGE_KEY,
  writeStoredThemeMode,
} from './theme';
import type { ResolvedTheme, ThemeMode } from './theme';

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readStoredThemeMode);

  const [systemTheme, setSystemTheme] =
    useState<ResolvedTheme>(getSystemTheme);

  const resolvedTheme = themeMode === 'auto' ? systemTheme : themeMode;

  const setThemeMode = useCallback((nextThemeMode: ThemeMode) => {
    setThemeModeState(nextThemeMode);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const syncSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    syncSystemTheme();
    mediaQuery.addEventListener('change', syncSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', syncSystemTheme);
    };
  }, []);

  useEffect(() => {
    applyTheme(themeMode, resolvedTheme);
    writeStoredThemeMode(themeMode);
  }, [resolvedTheme, themeMode]);

  useEffect(() => {
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      setThemeModeState(isThemeMode(event.newValue) ? event.newValue : 'auto');
    };

    window.addEventListener('storage', syncStoredTheme);

    return () => {
      window.removeEventListener('storage', syncStoredTheme);
    };
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
    }),
    [resolvedTheme, setThemeMode, themeMode],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
