/**
 * AuthContext — Real JWT auth for end users.
 *
 * - Hydrates user from /api/auth/me on mount if an access token is present.
 * - Exposes login/signup/logout helpers wired to the real backend.
 * - Stores tokens via tokenStore (localStorage).
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, tokenStore, ApiError } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      // Some APIs return { user: {...} }, others return the user directly.
      setUser(me?.user || me || null);
    } catch (err) {
      tokenStore.clearUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    tokenStore.setUserTokens({
      access_token: res.access_token,
      refresh_token: res.refresh_token,
    });
    const me = await authApi.me();
    const u = me?.user || me || null;
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    if (res?.access_token) {
      tokenStore.setUserTokens({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      const me = await authApi.me();
      const u = me?.user || me || null;
      setUser(u);
      return u;
    }
    // Some APIs require a separate login after register.
    return login({ email: payload.email, password: payload.password });
  }, [login]);

  const logout = useCallback(() => {
    tokenStore.clearUser();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refresh: hydrate,
    updateUser,
    ApiError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
