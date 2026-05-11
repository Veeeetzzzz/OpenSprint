import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { API_BASE_URL } from '@/lib/config';
import { extractAuthPayload } from './auth-response';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStoredToken = () => {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  };

  const setStoredToken = (value: string) => {
    try {
      localStorage.setItem('auth_token', value);
    } catch (error) {
      console.warn('Failed to write auth token:', error);
    }
  };

  const removeStoredToken = () => {
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  };

  const parseJsonResponse = useCallback(async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    try {
      return await response.json();
    } catch (error) {
      console.warn('Failed to parse JSON response:', error);
      return null;
    }
  }, []);

  const verifyToken = useCallback(async (tokenToVerify: string, signal?: AbortSignal) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
        },
        signal,
      });

      if (response.ok) {
        const data = await parseJsonResponse(response);
        if (!data?.data?.user) {
          throw new Error('Invalid auth response');
        }
        setUser(data.data.user);
        setToken(tokenToVerify);
      } else {
        // Token is invalid, remove it
        removeStoredToken();
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      console.error('Token verification failed:', error);
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [parseJsonResponse]);

  // Load token from localStorage on mount
  useEffect(() => {
    const controller = new AbortController();
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      void verifyToken(storedToken, controller.signal);
    } else {
      setIsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [verifyToken]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonResponse(response);
      if (!data) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      const { user: userData, token: userToken } = extractAuthPayload(data.data);
      setUser(userData);
      setToken(userToken);
      setStoredToken(userToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await parseJsonResponse(response);
      if (!data) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      const { user: userData, token: userToken } = extractAuthPayload(data.data);
      setUser(userData);
      setToken(userToken);
      setStoredToken(userToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    setUser(null);
    setToken(null);
    removeStoredToken();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC to protect routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <div>Please login to access this page</div>;
    }

    return <Component {...props} />;
  };
}
