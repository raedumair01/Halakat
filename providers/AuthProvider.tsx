import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { clearActiveSession, getActiveSession, setActiveSession } from '../services/authSession';
import { getProfile, login, logout, refreshSession, signup, updateProfile, type UserProfile } from '../services/authApi';

type SessionUser = UserProfile;

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
  token: string | null;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: { email: string; otp: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (payload: Partial<Pick<SessionUser, 'fullName' | 'bio' | 'location' | 'streakGoal'>>) => Promise<void>;
  updateLocalProfile: (payload: Partial<Pick<SessionUser, 'fullName' | 'bio' | 'location' | 'streakGoal'>>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);

  const syncSessionUser = async (nextToken: string, nextUser: SessionUser, nextRefreshToken?: string) => {
    setUser(nextUser);
    if (nextRefreshToken) refreshTokenRef.current = nextRefreshToken;
    await setActiveSession({ token: nextToken, refreshToken: nextRefreshToken || refreshTokenRef.current || undefined, user: nextUser });
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const session = await getActiveSession();

        if (!session?.token) {
          return;
        }

        const refreshed = await refreshSession(session.refreshToken || session.token, session.refreshToken ? undefined : session.token);
        if (!isMounted) return;

        setToken(refreshed.token);
        await syncSessionUser(refreshed.token, refreshed.user, refreshed.refreshToken);
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

  useEffect(() => {
    if (!isReady || !token) return;

    const refreshWhenActive = async (state: string) => {
      if (state !== 'active') return;
      if (refreshInFlightRef.current) return refreshInFlightRef.current;
      const task = (async () => {
        try {
          const session = await getActiveSession();
          if (!session?.token) return;
          const refreshed = await refreshSession(session.refreshToken || session.token, session.refreshToken ? undefined : session.token);
          setToken(refreshed.token);
          await syncSessionUser(refreshed.token, refreshed.user, refreshed.refreshToken);
        } catch (error) {
          console.warn('Background session refresh failed:', error);
        }
      })();
      refreshInFlightRef.current = task;
      await task.finally(() => { refreshInFlightRef.current = null; });
    };

    const subscription = AppState.addEventListener('change', refreshWhenActive);
    return () => subscription.remove();
  }, [isReady, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: !!token && !!user,
      user,
      token,
      async signIn(payload) {
        const response = await login(payload);
        setToken(response.token);
        await syncSessionUser(response.token, response.user, response.refreshToken);
      },
      async signUp(payload) {
        const response = await signup(payload);
        setToken(response.token);
        await syncSessionUser(response.token, response.user, response.refreshToken);
      },
      async signOut() {
        const activeToken = token;
        // Always clear local credentials even if the device is offline.
        try {
          if (activeToken) {
            await logout(activeToken);
          }
        } catch (error) {
          console.warn('Server logout could not be confirmed:', error);
        } finally {
          setToken(null);
          setUser(null);
          refreshTokenRef.current = null;
          await clearActiveSession();
        }
      },
      async refreshProfile() {
        if (!token) return;
        const freshUser = await getProfile(token);
        await syncSessionUser(token, freshUser);
      },
      async saveProfile(payload) {
        if (!token) {
          throw new Error('No active session found.');
        }

        const freshUser = await updateProfile(token, payload);
        await syncSessionUser(token, freshUser);
      },
      updateLocalProfile(payload) {
        setUser(prev => {
          if (!prev || !token) return prev;

          const nextUser = { ...prev, ...payload };
          void setActiveSession({ token, user: nextUser }).catch(error => {
            console.error('Failed to sync local profile update:', error);
          });
          return nextUser;
        });
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
