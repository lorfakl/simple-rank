import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import type {} from '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  signOut: vi.fn(),
  sync: vi.fn(),
  setTokenProvider: vi.fn(),
  auth: { isLoaded: true, isSignedIn: true }
}));

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ ...mocks.auth, getToken: mocks.getToken }),
  useClerk: () => ({ signOut: mocks.signOut })
}));
vi.mock('../api/services', () => ({ authService: { sync: mocks.sync } }));
vi.mock('../api/client', () => ({ setTokenProvider: mocks.setTokenProvider }));

function Probe() {
  const { user, session, isAuthenticated, signOut } = useUser();
  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user-id">{user.id || ''}</div>
      <div data-testid="token">{session?.access_token || ''}</div>
      <button onClick={() => void signOut()}>sign out</button>
    </div>
  );
}

describe('Clerk user session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.auth.isLoaded = true;
    mocks.auth.isSignedIn = true;
    mocks.getToken.mockResolvedValue('clerk-token');
    mocks.signOut.mockResolvedValue(undefined);
    mocks.sync.mockResolvedValue({ data: { user: {
      id: 'existing-id', email: 'user@example.com',
      user_metadata: { full_name: 'User', avatar_url: '' }
    } } });
  });

  it('syncs the mapped user and removes the old stored token', async () => {
    localStorage.setItem('auth_token', 'old-token');
    render(<UserProvider><Probe /></UserProvider>);
    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('yes'));
    expect(screen.getByTestId('user-id')).toHaveTextContent('existing-id');
    expect(screen.getByTestId('token')).toHaveTextContent('clerk-token');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(mocks.sync).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'sign out' }));
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it('does not trust an old local session when signed out of Clerk', () => {
    mocks.auth.isSignedIn = false;
    localStorage.setItem('auth_token', 'old-token');
    localStorage.setItem('user', '{"id":"old"}');
    render(<UserProvider><Probe /></UserProvider>);
    expect(screen.getByTestId('auth-state')).toHaveTextContent('no');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mocks.sync).not.toHaveBeenCalled();
  });

  it('lets a signed-in user retry when account synchronization fails', async () => {
    mocks.sync.mockRejectedValueOnce(new Error('sync failed'));
    render(<UserProvider><Probe /></UserProvider>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to connect your account');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('yes'));
  });
});