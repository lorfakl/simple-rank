import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AuthenticationOptions from './AuthenticationOptions';
import type {} from '@testing-library/jest-dom/vitest';

vi.mock('@clerk/react', () => ({
  SignIn: (props: { signUpUrl: string; forceRedirectUrl: string }) => (
    <div>
      Clerk sign in
      <div data-testid="signin-signup-url">{props.signUpUrl}</div>
      <div data-testid="signin-force-redirect">{props.forceRedirectUrl}</div>
    </div>
  ),
  SignUp: (props: { signInUrl: string; forceRedirectUrl: string }) => (
    <div>
      Clerk sign up
      <div data-testid="signup-signin-url">{props.signInUrl}</div>
      <div data-testid="signup-force-redirect">{props.forceRedirectUrl}</div>
    </div>
  )
}));

it.each([
  [false, 'Clerk sign in'],
  [true, 'Clerk sign up']
])('renders Clerk authentication and legal links', (isSignUp, label) => {
  render(
    <MemoryRouter initialEntries={['/Login?returnTo=%2Franking%2F5%3Ftab%3Dstats']}>
      <AuthenticationOptions isSignUp={isSignUp} />
    </MemoryRouter>
  );

  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'terms of service' })).toHaveAttribute('href', '/terms');
  expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy');

  if (isSignUp) {
    expect(screen.getByTestId('signup-signin-url')).toHaveTextContent('/Login?returnTo=%2Franking%2F5%3Ftab%3Dstats');
    expect(screen.getByTestId('signup-force-redirect')).toHaveTextContent('/ranking/5?tab=stats');
    return;
  }

  expect(screen.getByTestId('signin-signup-url')).toHaveTextContent('/SignUp?returnTo=%2Franking%2F5%3Ftab%3Dstats');
  expect(screen.getByTestId('signin-force-redirect')).toHaveTextContent('/ranking/5?tab=stats');
});