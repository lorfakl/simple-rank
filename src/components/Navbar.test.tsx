import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Navbar from './Navbar';
import { ThemeProvider } from '../contexts/ThemeContext';
import type {} from '@testing-library/jest-dom/vitest';

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({ session: null, signOut: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'mytheme');
});

it('renders a theme toggle that flips data-theme and swaps the brand logo', () => {
  document.documentElement.setAttribute('data-theme', 'mytheme');
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </MemoryRouter>
  );

  const brand = screen.getByAltText('simple rank');
  expect(brand).toHaveAttribute('src', '/logo/logoLightMark.png');
  expect(screen.getByText('simple rank')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'switch to dark theme' }));

  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme-dark');
  expect(localStorage.getItem('theme')).toBe('mytheme-dark');
  expect(screen.getByAltText('simple rank')).toHaveAttribute('src', '/logo/logoDarkMark.png');
  expect(screen.getByRole('button', { name: 'switch to light theme' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'switch to light theme' }));

  expect(document.documentElement.getAttribute('data-theme')).toBe('mytheme');
  expect(localStorage.getItem('theme')).toBe('mytheme');
  expect(screen.getByAltText('simple rank')).toHaveAttribute('src', '/logo/logoLightMark.png');
});
