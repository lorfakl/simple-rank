import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';
import { authService } from '../api/services';
import type { AuthResponse, AuthSession, AuthUser } from '../api/services';

/** User shape after normalization — same contract as the API's AuthUser. */
export type AppUser = AuthUser;
/** Session shape per the API contract: session.access_token / session.user.* */
export type Session = AuthSession;
/** Context user state — `{}` while signed out, as stored today. */
export type UserState = Partial<AuthUser>;

/** Raw localStorage/API user before normalization. */
interface RawAuthUser {
  id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    fullName?: string;
    avatarUrl?: string;
  };
  userMetadata?: {
    full_name?: string;
    avatar_url?: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

/** Result envelope shared by the sign-in/sign-up/OAuth helpers. */
export interface AuthResult {
  error?: unknown;
  user?: AppUser;
}

export interface UserContextValue {
  user: UserState;
  session: Session | null;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithDiscord: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  getCurrentUser: () => UserState;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function normalizeUser(raw: RawAuthUser) {
  const metadata: NonNullable<RawAuthUser['user_metadata']> = raw?.user_metadata || raw?.userMetadata || {};
  return {
    id: raw?.id || '',
    email: raw?.email || '',
    user_metadata: {
      full_name: metadata.full_name || metadata.fullName || raw?.email || 'anonymous',
      avatar_url: metadata.avatar_url || metadata.avatarUrl || ''
    }
  };
}

export function UserProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<UserState>({})
  const [session, setSession] = useState<Session | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  const { showNotification } = useNotifications()

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      return;
    }

    try {
      const parsed = normalizeUser(JSON.parse(userRaw));
      const currentSession = { access_token: token, user: parsed };
      setUser(parsed);
      setSession(currentSession);
      setAuthenticated(true);

      authService.me().catch(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser({});
        setSession(null);
        setAuthenticated(false);
      });
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    if (session && session.user) {
      setUser(session.user);
      setAuthenticated(true);
      localStorage.setItem('auth_token', session.access_token);
      localStorage.setItem('user', JSON.stringify(session.user));
      localStorage.setItem('fullName', session.user.user_metadata.full_name || '');
      localStorage.setItem('avatarUrl', session.user.user_metadata.avatar_url || '');
      setUserMetadata(session.user)
    } else {
      setUser({});
      setAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('fullName');
      localStorage.removeItem('avatarUrl');
    }
  }, [session]);

  async function signInWithEmail(email: string, password: string) {
    try {
      const { data } = await authService.signIn({ email, password });
      const authUser = normalizeUser(data.session.user);
      setSession({ access_token: data.session.access_token, user: authUser });
      showNotification('Successfully logged in', 'success', 1000);
      return { error: undefined, user: authUser };
    } catch (error) {
      showNotification('Invalid credentials', 'error', 5000);
      return { error, user: undefined };
    }
  }

  async function signUpWithEmail(email: string, password: string) {
    try {
      const { data } = await authService.signUp({ email, password });
      const authUser = normalizeUser(data.session.user);
      setSession({ access_token: data.session.access_token, user: authUser });
      showNotification('Successfully signed up, welcome', 'success', 3000);
      return { error: undefined, user: authUser };
    } catch (error) {
      showNotification('Unable to sign up', 'error', 5000);
      return { error, user: undefined };
    }
  }

  async function signInWithGoogle() {
    showNotification('Google OAuth is not configured in this local migration build', 'info', 4000)
    return { error: 'oauth_not_configured', user: undefined }
  }

  async function signInWithDiscord() {
    showNotification('Discord OAuth is not configured in this local migration build', 'info', 4000)
    return { error: 'oauth_not_configured', user: undefined }
  }

  async function setUserMetadata(currentUser: AppUser){
    const fullName = currentUser?.user_metadata?.full_name || currentUser?.email || 'anonymous';
    const avatarUrl = currentUser?.user_metadata?.avatar_url || '';

    const request = {
      id: currentUser.id,
      name: fullName,
      avatarUrl,
    }

    try {
      await authService.setMetadata(request)
    } catch {
      // best-effort
    }
  }

  async function signOut() {
    try {
      await authService.signOut()
    } catch {
      // ignore
    }
    setUser({})
    setSession(null)
  }

  function getCurrentUser() {
    return user;
  }

  const value: UserContextValue = {
    user,
    session,
    isAuthenticated: authenticated,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
    getCurrentUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useUser();

    if (!isAuthenticated) {
      return <div>Please sign in to access this page.</div>;
    }

    return <Component {...props} />;
  };
}
