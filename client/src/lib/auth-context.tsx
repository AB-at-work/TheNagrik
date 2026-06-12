'use client';

import * as React from 'react';
import { api, setAccessToken, tryRefresh, getAccessToken } from './api';

export type UserRole = 'super_admin' | 'admin' | 'editor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

// Simple JWT payload parser
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function initAuth() {
      try {
        const success = await tryRefresh();
        
        if (success) {
          const token = getAccessToken();
          if (token) {
            const payload = parseJwt(token);
            
            if (payload && payload.sub) {
              setUser({
                id: payload.sub,
                name: payload.name || 'Admin User',
                email: payload.email || '',
                role: payload.role as UserRole,
              });
            }
          }
        }
      } catch (err) {
        // Not logged in, clear state
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = React.useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await api.post('/auth/logout', undefined, { auth: true });
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.href = '/admin/login';
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
