export type ThemeMode = 'auto' | 'light' | 'dark' | 'oled'
export type ResolvedTheme = Exclude<ThemeMode, 'auto'>
export const THEME_STORAGE_KEY = 'timelab-theme';
export const THEME_MODES = ['auto', 'light', 'dark', 'oled'] as const;

export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === 'string' &&
    THEME_MODES.includes(value as (typeof THEME_MODES)[number])
  );
}

export function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

export function resolveThemeMode(themeMode: ThemeMode): ResolvedTheme {
  if (themeMode === 'auto') {
    return getSystemTheme();
  }

  return themeMode;
}

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (isThemeMode(storedTheme)) {
      return storedTheme;
    }
  } catch (error) {
    warnThemeStorageFailure('read', error);

    return 'auto';
  }

  return 'auto';
}

function warnThemeStorageFailure(action: 'read' | 'write', error: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  console.warn(`Unable to ${action} theme preference in localStorage.`, error);
}

export function writeStoredThemeMode(themeMode: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  } catch (error) {
    warnThemeStorageFailure('write', error);
  }
}

export function applyTheme(
  themeMode: ThemeMode,
  resolvedTheme = resolveThemeMode(themeMode),
) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.dataset.themeMode = themeMode;
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme === 'light' ? 'light' : 'dark';
}
