'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthState, LoginCredentials, UserRole } from '@/types';
import {
  mockLogin,
  mockLogout,
  getStoredUser,
  setStoredUser,
  getHomePathForRole
} from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setState({
        user: storedUser,
        isLoading: false,
        isAuthenticated: true
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const result = await mockLogin(credentials);
    
    if (result.success && result.user) {
      setStoredUser(result.user);
      setState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true
      });
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await mockLogout();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}