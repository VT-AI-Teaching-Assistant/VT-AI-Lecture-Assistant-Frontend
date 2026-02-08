import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/ApiService';

export type UserRole = 'student' | 'instructor';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  entityId: number;
  isFirstTime?: boolean;
  hasRegisteredCourses?: boolean;
  lastCourseId?: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vt-ai-auth-user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserInfo = useCallback(async () => {
    try {
      const response = await apiService.get<{ success: boolean; data: any }>('/auth/me');
      
      if (response.success && response.data) {
        const userData = response.data;
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as UserRole,
          entityId: userData.entityId,
          isFirstTime: userData.firstTime,
          hasRegisteredCourses: userData.hasRegisteredCourses,
          lastCourseId: userData.lastCourseId
        };
        setUser(authUser);
        // Store minimal info for persistence check
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ 
          id: authUser.id, 
          email: authUser.email, 
          role: authUser.role 
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error);
      throw error;
    }
  }, []);

  // On mount, try to restore session using refresh token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a minimal user info in localStorage
        const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedUser) {
          // Try to refresh access token using HTTP-only cookie
          const response = await apiService.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh');
          
          if (response.success && response.data && response.data.accessToken) {
            apiService.setToken(response.data.accessToken);
            
            // Fetch current user info from backend
            await refreshUserInfo();
          } else {
            // Refresh failed, clear localStorage
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } catch (error: any) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUserInfo]);

  const logout = useCallback(async () => {
    try {
      // Call backend logout API
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear everything
      setUser(null);
      apiService.clearToken();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('vt-ai-selected-course');
      localStorage.removeItem('vt-ai-user-profile');
      localStorage.removeItem('vt-ai-instructor-data');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await refreshUserInfo();
  }, [refreshUserInfo]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, logout, refreshUser }),
    [user, isLoading, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


