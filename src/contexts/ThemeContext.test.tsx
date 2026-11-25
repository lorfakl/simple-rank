import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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
