import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/react';
import { authService } from '../api/services';
import { setTokenProvider } from '../api/client';
import type { AuthSession, AuthUser } from '../api/services';

export type AppUser = AuthUser;
export type Session = AuthSession;
export type UserState = Partial<AuthUser>;

export interface UserContextValue {
  user: UserState;
  session: Session | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  getCurrentUser: () => UserState;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children?: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  const [session, setSession] = useState<Session | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    localStorage.removeItem('auth_token');
    setSession(null);
    setSyncError(false);
    if (!isLoaded || !isSignedIn) {
      setTokenProvider(null);
      localStorage.removeItem('user');
      localStorage.removeItem('fullName');
      localStorage.removeItem('avatarUrl');
      return;
    }

    setTokenProvider(() => getToken());
    async function syncUser() {
      try {
        const token = await getToken();
        if (cancelled) return;
        if (!token) throw new Error('Missing Clerk token');
        const { data } = await authService.sync();
        if (cancelled) return;
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('fullName', data.user.user_metadata.full_name);
        localStorage.setItem('avatarUrl', data.user.user_metadata.avatar_url);
        setSession({ access_token: token, user: data.user });
      } catch {
        if (!cancelled) setSyncError(true);
      }
    }
    void syncUser();
    return () => {
      cancelled = true;
      setTokenProvider(null);
    };
  }, [attempt, getToken, isLoaded, isSignedIn]);

  const user = session?.user ?? {};
  const value: UserContextValue = {
    user,
    session,
    isAuthenticated: session !== null,
    signOut: () => clerkSignOut(),
    getCurrentUser: () => user
  };

  return (
    <UserContext.Provider value={value}>
      {syncError ? (
        <main className="mx-auto my-12 max-w-md px-4" role="alert">
          <p>Unable to connect your account. Please retry or sign out.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={() => setAttempt(current => current + 1)}>Retry</button>
            <button className="btn" onClick={() => void clerkSignOut()}>Sign out</button>
          </div>
        </main>
      ) : children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useUser();
    if (!isAuthenticated) return <div>Please sign in to access this page.</div>;
    return <Component {...props} />;
  };
}