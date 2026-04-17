import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearActiveSession, getActiveSession, setActiveSession } from '../services/authSession';
import { getProfile, login, signup, updateProfile, type UserProfile } from '../services/authApi';

type SessionUser = UserProfile;

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
  token: string | null;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: { fullName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (payload: Partial<Pick<SessionUser, 'fullName' | 'bio' | 'location' | 'streakGoal'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const session = await getActiveSession();

        if (!session?.token) {
          return;
        }

        const freshUser = await getProfile(session.token);
        if (!isMounted) return;

        setToken(session.token);
        setUser(freshUser);
        await setActiveSession({ token: session.token, user: freshUser });
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        await clearActiveSession();
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: !!token && !!user,
      user,
      token,
      async signIn(payload) {
        const response = await login(payload);
        setToken(response.token);
        setUser(response.user);
        await setActiveSession({ token: response.token, user: response.user });
      },
      async signUp(payload) {
        const response = await signup(payload);
        setToken(response.token);
        setUser(response.user);
        await setActiveSession({ token: response.token, user: response.user });
      },
      async signOut() {
        setToken(null);
        setUser(null);
        await clearActiveSession();
      },
      async refreshProfile() {
        if (!token) return;
        const freshUser = await getProfile(token);
        setUser(freshUser);
        await setActiveSession({ token, user: freshUser });
      },
      async saveProfile(payload) {
        if (!token) {
          throw new Error('No active session found.');
        }

        const freshUser = await updateProfile(token, payload);
        setUser(freshUser);
        await setActiveSession({ token, user: freshUser });
      },
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
