import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AuthenticationOptions from './AuthenticationOptions';
import type {} from '@testing-library/jest-dom/vitest';

vi.mock('@clerk/react', () => ({
  SignIn: () => <div>Clerk sign in</div>,
  SignUp: () => <div>Clerk sign up</div>
}));

it.each([
  [false, 'Clerk sign in'],
  [true, 'Clerk sign up']
])('renders Clerk authentication and legal links', (isSignUp, label) => {
  render(<MemoryRouter><AuthenticationOptions isSignUp={isSignUp} /></MemoryRouter>);
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'terms of service' })).toHaveAttribute('href', '/terms');
  expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy');
});