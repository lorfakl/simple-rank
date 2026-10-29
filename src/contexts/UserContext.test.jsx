import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { authService } from '../api/services';

vi.mock('../api/services', () => ({
  authService: {
    me: vi.fn(() => Promise.resolve({ data: {} })),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(() => Promise.resolve({ data: {} })),
    setMetadata: vi.fn(() => Promise.resolve({ data: {} }))
  }
}));

vi.mock('./NotificationContext', () => ({
  useNotifications: () => ({
    showNotification: vi.fn(),
    hideNotifications: vi.fn()
  })
}));

function Probe() {
  const { user, session, isAuthenticated, signInWithEmail } = useUser();

  return React.createElement(
    'div',
    null,
    React.createElement('div', { 'data-testid': 'auth-state' }, isAuthenticated ? 'yes' : 'no'),
    React.createElement('div', { 'data-testid': 'email' }, user?.email || ''),
    React.createElement('div', { 'data-testid': 'token' }, session?.access_token || ''),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: () => signInWithEmail('login@example.com', 'Password123!')
      },
      'signin'
    )
  );
}

describe('UserContext smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('hydrates auth state from localStorage and validates via me()', async () => {
    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        email: 'stored@example.com',
        user_metadata: { full_name: 'Stored User', avatar_url: '' }
      })
    );

    render(React.createElement(UserProvider, null, React.createElement(Probe)));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('yes');
      expect(screen.getByTestId('email')).toHaveTextContent('stored@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
    });

    expect(authService.me).toHaveBeenCalledTimes(1);
  });

  it('signInWithEmail sets session shape with access_token and user fields', async () => {
    authService.signIn.mockResolvedValue({
      data: {
        session: {
          access_token: 'new-token',
          user: {
            id: 'user-2',
            email: 'login@example.com',
            user_metadata: { full_name: 'Login User', avatar_url: 'https://avatar' }
          }
        }
      }
    });

    render(React.createElement(UserProvider, null, React.createElement(Probe)));

    fireEvent.click(screen.getByRole('button', { name: 'signin' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('yes');
      expect(screen.getByTestId('email')).toHaveTextContent('login@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('new-token');
    });

    expect(localStorage.getItem('auth_token')).toBe('new-token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    expect(storedUser.id).toBe('user-2');
    expect(storedUser.email).toBe('login@example.com');
  });
});
