import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, User } from '../types';
import { GITHUB_CONFIG, GITHUB_SCOPES, STORAGE_KEYS } from '../config/github';

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

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

  const login = () => {
    const params = new URLSearchParams({
      client_id: GITHUB_CONFIG.clientId,
      redirect_uri: GITHUB_CONFIG.redirectUri,
      scope: GITHUB_SCOPES.join(' '),
      state: crypto.randomUUID(),
    });
    
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
  };

  const handleCallback = async (code: string) => {
    setAuth(prev => ({ ...prev, loading: true }));
    
    try {
      // Exchange code for token via proxy (to keep client_secret secure)
      // For local dev/testing, you can use a direct token
      if (!GITHUB_CONFIG.tokenProxyUrl) {
        throw new Error('Token proxy URL not configured. Set VITE_TOKEN_PROXY_URL in .env');
      }

      const tokenRes = await fetch(GITHUB_CONFIG.tokenProxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const { access_token } = await tokenRes.json();
      
      // Get user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = await userRes.json();
      
      localStorage.setItem(STORAGE_KEYS.token, access_token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      
      setAuth({
        isAuthenticated: true,
        user,
        token: access_token,
        loading: false,
      });
    } catch (error) {
      console.error('Auth error:', error);
      setAuth(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, handleCallback }}>
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
