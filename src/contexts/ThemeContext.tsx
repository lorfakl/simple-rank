import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

/**
 * Theme switch animation.
 *
 * Two mechanisms, tried in order (only for a real theme change — mount and
 * same-theme writes are silent; `prefers-reduced-motion` opts out of both):
 *
 * 1. View Transitions (`document.startViewTransition`) — snapshots the page
 *    before and after the `data-theme` flip and cross-dissolves them, so
 *    everything fades together, including things a color transition can't
 *    interpolate (the landing/home radial washes, the light/dark logo swap).
 * 2. Fallback: arm `html.theme-switching` (rules in index.css) *before* the
 *    attributes change, force one style/layout flush so the class is part of
 *    the transition's before-change style, then drop the class once the fade
 *    has run. Without that flush the browser starts no transition and the
 *    page snaps from light to dark in a single frame — which is exactly the
 *    bug this replaces.
 */
const SWITCH_CLASS = 'theme-switching';
const SWITCH_DURATION_MS = 250;
/** class removal lags the transition so it never gets cut off mid-fade */
const SWITCH_CLEANUP_MS = SWITCH_DURATION_MS + 70;

let switchCleanupTimer: ReturnType<typeof setTimeout> | undefined;
/** last theme asked for — a pending view transition must apply this, not a
 *  stale one, if the user toggles again before the snapshot callback runs */
let requestedTheme: Theme = LIGHT_THEME;

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => {
    finished: Promise<void>;
    updateCallbackDone: Promise<void>;
    ready: Promise<void>;
    skipTransition: () => void;
  };
};

function motionAllowed(): boolean {
  try {
    // no matchMedia (jsdom, ancient browsers): animate anyway and let the
    // CSS media query decide whether anything actually moves
    if (typeof window.matchMedia !== 'function') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    /* an unsupported query must not block the theme switch itself */
    return true;
  }
}

function supportsViewTransition(): boolean {
  return typeof (document as ViewTransitionDocument).startViewTransition === 'function';
}

function applyTheme(theme: Theme, animate = false) {
  requestedTheme = theme;
  const root = document.documentElement;
  const changed = root.getAttribute('data-theme') !== theme;
  const animateSwitch = animate && changed && motionAllowed();

  if (animateSwitch && supportsViewTransition()) {
    (document as ViewTransitionDocument).startViewTransition!(() =>
      applyThemeAttrs(requestedTheme),
    );
    return;
  }

  if (animateSwitch) {
    root.classList.add(SWITCH_CLASS);
    // force a style flush: the class has to be in the before-change style or
    // the browser starts no transition when data-theme flips in the same tick
    void root.offsetHeight;
    if (switchCleanupTimer !== undefined) clearTimeout(switchCleanupTimer);
  }

  applyThemeAttrs(theme);

  if (animateSwitch) {
    switchCleanupTimer = setTimeout(() => {
      root.classList.remove(SWITCH_CLASS);
      switchCleanupTimer = undefined;
    }, SWITCH_CLEANUP_MS);
  }
}

/** Mirrors the theme onto <html>, color-scheme and the theme-color meta. */
function applyThemeAttrs(theme: Theme) {
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
  /* setTheme writes the DOM itself (possibly through an async view
     transition, where data-theme lags behind React by a frame) — the sync
     effect below must not start a second animation for the same change */
  const handledRef = useRef(false);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — the DOM still switches */
    }
    handledRef.current = true;
    applyTheme(next, true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === DARK_THEME ? LIGHT_THEME : DARK_THEME);
  }, [theme, setTheme]);

  useEffect(() => {
    // for changes that reach React without setTheme (another tab's write)
    // this is what applies them; same-theme writes are a silent no-op
    if (handledRef.current) {
      handledRef.current = false;
      return;
    }
    applyTheme(theme, true);
  }, [theme]);

  /* follow the OS dark-mode setting *live* (index.html only reads it once,
     at page load). Same precedence as the pre-paint script: an explicit
     localStorage choice wins and the OS is then ignored — so we deliberately
     do NOT persist here, otherwise the first OS flip would freeze into a
     "user choice" and later flips would stop working. */
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = (event: MediaQueryListEvent) => {
      try {
        if (isTheme(localStorage.getItem(THEME_STORAGE_KEY))) return;
      } catch {
        /* storage unavailable — still follow the OS */
      }
      // goes through React state, so the [theme] effect runs the same
      // animated applyTheme a manual toggle gets
      setThemeState(event.matches ? DARK_THEME : LIGHT_THEME);
    };

    // MediaQueryList only gained addEventListener everywhere recently;
    // addListener is the fallback for older engines (and some jsdom setups)
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }
    const legacy = query as MediaQueryList & {
      addListener?: (cb: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (cb: (e: MediaQueryListEvent) => void) => void;
    };
    legacy.addListener?.(onChange);
    return () => legacy.removeListener?.(onChange);
  }, []);

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
