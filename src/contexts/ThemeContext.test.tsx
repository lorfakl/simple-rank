import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import type {} from '@testing-library/jest-dom/vitest';

function Harness() {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="dark">{String(isDark)}</span>
      <button type="button" onClick={toggleTheme}>flip</button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'mytheme');
  document.documentElement.classList.remove('theme-switching');
  document.documentElement.style.colorScheme = '';
});

it('starts from the data-theme the pre-paint script applied to <html>', () => {
  document.documentElement.setAttribute('data-theme', 'mytheme-dark');
  render(<ThemeProvider><Harness /></ThemeProvider>);
  expect(screen.getByTestId('theme')).toHaveTextContent('mytheme-dark');
  expect(screen.getByTestId('dark')).toHaveTextContent('true');
});

it('flips data-theme, persists to localStorage and keeps the DOM in sync', () => {
  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  fireEvent.click(screen.getByText('flip'));

  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');
  expect(localStorage.getItem('theme')).toBe('mytheme-dark');
  expect(screen.getByTestId('theme')).toHaveTextContent('mytheme-dark');

  fireEvent.click(screen.getByText('flip'));

  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme');
  expect(localStorage.getItem('theme')).toBe('mytheme');
  expect(screen.getByTestId('theme')).toHaveTextContent('mytheme');
});

it('re-applies a theme written by another tab (storage event)', () => {
  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  localStorage.setItem('theme', 'mytheme-dark');
  fireEvent(window, new StorageEvent('storage', { key: 'theme', newValue: 'mytheme-dark' }));

  expect(screen.getByTestId('theme')).toHaveTextContent('mytheme-dark');
  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');
});

it('arms the theme-switch cross-fade on a toggle and drops it afterwards', () => {
  vi.useFakeTimers();
  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  fireEvent.click(screen.getByText('flip'));

  // the class has to be on <html> before data-theme changes, or no transition starts
  expect(document.documentElement.classList.contains('theme-switching')).toBe(true);
  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');

  vi.advanceTimersByTime(400);
  expect(document.documentElement.classList.contains('theme-switching')).toBe(false);

  vi.useRealTimers();
});

it('does not arm the cross-fade when the user prefers reduced motion', () => {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;

  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  fireEvent.click(screen.getByText('flip'));

  expect(document.documentElement.classList.contains('theme-switching')).toBe(false);
  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');

  window.matchMedia = original;
});

it('mounts silently — no switch class when the theme is already applied', () => {
  document.documentElement.setAttribute('data-theme', 'mytheme-dark');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  expect(document.documentElement.classList.contains('theme-switching')).toBe(false);
});

/** Stubs matchMedia so we can capture the (prefers-color-scheme: dark)
 *  listener the provider registers and fire OS flips on demand. */
function stubSchemeMedia(initialDark: boolean) {
  const original = window.matchMedia;
  let listener: ((e: MediaQueryListEvent) => void) | undefined;
  const inert = {
    matches: false,
    media: '',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
  window.matchMedia = ((query: string) => ({
    ...inert,
    media: query,
    matches: query.includes('prefers-color-scheme: dark') ? initialDark : false,
    addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
      if (query.includes('prefers-color-scheme: dark')) listener = cb;
    },
    removeEventListener: () => {
      listener = undefined;
    },
    addListener: (cb: (e: MediaQueryListEvent) => void) => {
      listener = cb;
    },
    removeListener: () => {
      listener = undefined;
    },
  })) as typeof window.matchMedia;
  return {
    fire(matches: boolean) {
      // act() so the state update it triggers flushes before we assert
      act(() => listener?.({ matches } as MediaQueryListEvent));
    },
    restore() {
      window.matchMedia = original;
    },
  };
}

it('follows a live OS dark-mode change when the user has not chosen a theme', () => {
  const scheme = stubSchemeMedia(false);
  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  scheme.fire(true);

  expect(screen.getByTestId('theme')).toHaveTextContent('mytheme-dark');
  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');
  // not persisted — otherwise the next OS flip would be ignored
  expect(localStorage.getItem('theme')).toBeNull();
  // the change is animated like any other switch, once cleanup runs
  expect(document.documentElement.classList.contains('theme-switching')).toBe(true);

  scheme.fire(false);

  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme');
  scheme.restore();
});

it('ignores OS dark-mode changes once the user has an explicit stored theme', () => {
  const scheme = stubSchemeMedia(false);
  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  localStorage.setItem('theme', 'mytheme');
  scheme.fire(true);

  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme');
  expect(screen.getByTestId('theme')).toHaveTextContent('mytheme');
  scheme.restore();
});

it('animates through the View Transitions API when the browser provides it', () => {
  const doc = document as unknown as { startViewTransition?: (cb: () => void) => unknown };
  const original = doc.startViewTransition;
  let calls = 0;
  doc.startViewTransition = (cb: () => void) => {
    calls += 1;
    cb(); // the real API runs the update callback, then snapshots
    return { finished: Promise.resolve(), updateCallbackDone: Promise.resolve() };
  };

  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(<ThemeProvider><Harness /></ThemeProvider>);

  fireEvent.click(screen.getByText('flip'));

  expect(calls).toBe(1);
  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');
  expect(localStorage.getItem('theme')).toBe('mytheme-dark');
  // the view transition owns the animation — no CSS fallback class needed
  expect(document.documentElement.classList.contains('theme-switching')).toBe(false);
  // and the sync effect must not have started a second transition
  expect(calls).toBe(1);

  doc.startViewTransition = original;
});
