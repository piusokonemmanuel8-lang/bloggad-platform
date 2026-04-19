import { createContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: 'bloggad_token',
  user: 'bloggad_user',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.user);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '');
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEYS.token);

      if (!savedToken) {
        setBootstrapping(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get('/api/auth/me');

        if (data?.ok && data?.user) {
          setUser(data.user);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
        setBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (payload) => {
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', payload);

      if (data?.ok) {
        const nextToken = data.token || '';
        const nextUser = data.user || null;

        setToken(nextToken);
        setUser(nextUser);

        localStorage.setItem(STORAGE_KEYS.token, nextToken);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));

        return data;
      }

      throw new Error(data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/register', payload);

      if (data?.ok) {
        const nextToken = data.token || '';
        const nextUser = data.user || null;

        setToken(nextToken);
        setUser(nextUser);

        localStorage.setItem(STORAGE_KEYS.token, nextToken);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));

        return data;
      }

      throw new Error(data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      bootstrapping,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'admin',
      isAffiliate: user?.role === 'affiliate',
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}