import { createContext } from 'react';
import type { ResolvedTheme, ThemeMode } from './theme';

export type ThemeContextValue = {
  themeMode: ThemeMode
  resolvedTheme: ResolvedTheme
  setThemeMode: (themeMode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
