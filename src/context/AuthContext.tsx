import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'student' | 'instructor';

export type AuthUser = {
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: true } | { success: false; message: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vt-ai-auth-user';

const HARD_CODED_USERS: Array<{ email: string; password: string; name: string; role: UserRole }> = [
  { email: 'student@vt.edu', password: 'learn123', name: 'Sarah Johnson', role: 'student' },
  { email: 'instructor@vt.edu', password: 'teach123', name: 'Dr. Anya Sharma', role: 'instructor' }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthUser;
        setUser(parsed);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const found = HARD_CODED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      return { success: false as const, message: 'Invalid email or password' };
    }
    const authUser: AuthUser = { email: found.email, name: found.name, role: found.role };
    setUser(authUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authUser));
    return { success: true as const };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


