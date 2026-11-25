import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Shared light/dark theme state.
 *
 * The initial value is NOT read from localStorage during render: index.html's
 * pre-paint inline script already resolved it and set `data-theme` on
 * <html>, so we mirror the DOM. Every later change goes through React state
 * (a subscription), never a bare global read.
 */

export type Theme = 'mytheme' | 'mytheme-dark';

export const THEME_STORAGE_KEY = 'theme';
export const LIGHT_THEME: Theme = 'mytheme';
export const DARK_THEME: Theme = 'mytheme-dark';

/** theme-color values matching each theme's base-100 (#f6f9fb / #0f1217) */
const THEME_COLORS: Record<Theme, string> = {
  mytheme: '#f6f9fb',
  'mytheme-dark': '#0f1217',
};

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: unknown): value is Theme {
  return value === LIGHT_THEME || value === DARK_THEME;
}

/** Mirrors the theme onto <html>, color-scheme and the theme-color meta. */
function applyTheme(theme: Theme) {
  const scheme = theme === DARK_THEME ? 'dark' : 'light';
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = scheme;

  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', scheme);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) themeColorMeta.setAttribute('content', THEME_COLORS[theme]);
}

/** The value the pre-paint script already applied to the document. */
function readAppliedTheme(): Theme {
  const applied = document.documentElement.getAttribute('data-theme');
  return isTheme(applied) ? applied : LIGHT_THEME;
}

export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(readAppliedTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — the DOM still switches */
    }
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === DARK_THEME ? LIGHT_THEME : DARK_THEME);
  }, [theme, setTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* keep tabs in sync — this is the subscription for other windows' writes */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isTheme(event.newValue)) return;
      setThemeState(event.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value: ThemeContextValue = {
    theme,
    isDark: theme === DARK_THEME,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
