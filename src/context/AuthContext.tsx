import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, User } from '../types';
import { STORAGE_KEYS } from '../config/github';

interface AuthContextType extends AuthState {
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const userStr = localStorage.getItem(STORAGE_KEYS.user);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setAuth({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        });
      } catch {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        setAuth(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuth(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const loginWithToken = useCallback(async (token: string) => {
    setError(null);
    setAuth(prev => ({ ...prev, loading: true }));
    
    try {
      // Validate token by fetching user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      
      if (!userRes.ok) {
        if (userRes.status === 401) {
          throw new Error('Invalid token. Please check and try again.');
        }
        throw new Error('Failed to connect to GitHub.');
      }
      
      const userData = await userRes.json();
      
      // Check if token has gist scope by trying to list gists
      const gistRes = await fetch('https://api.github.com/gists?per_page=1', {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      
      if (!gistRes.ok) {
        throw new Error('Token missing "gist" scope. Please generate a new token with gist permissions.');
      }
      
      const user: User = {
        login: userData.login,
        avatar_url: userData.avatar_url,
        name: userData.name || userData.login,
      };
      
      localStorage.setItem(STORAGE_KEYS.token, token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      
      setAuth({
        isAuthenticated: true,
        user,
        token,
        loading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      setAuth(prev => ({ ...prev, loading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, loginWithToken, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
