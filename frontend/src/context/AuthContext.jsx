/**
 * AuthContext — Real JWT auth for end users.
 *
 * Response shapes (from live API):
 *   POST /api/auth/register / /api/auth/login → data: { user, accessToken, refreshToken }
 *   GET  /api/auth/me                          → data: { user, subscription, sites }
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, tokenStore, ApiError } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const applyMe = (me) => {
    const rawUser = me?.user || null;
    // Backwards-compat: legacy UI code reads `user.name` / `user.plan` / `user.website`.
    // The backend may return subscription.plan as either a plain string or a
    // full Plan document — always extract a renderable string here.
    const subPlan = me?.subscription?.plan;
    const subPlanName = typeof subPlan === 'object' && subPlan
      ? (subPlan.name || subPlan.id || '')
      : (typeof subPlan === 'string' ? subPlan : '');
    const rawPlan = rawUser?.plan;
    const userPlanName = typeof rawPlan === 'object' && rawPlan
      ? (rawPlan.name || rawPlan.id || '')
      : (typeof rawPlan === 'string' ? rawPlan : '');
    const normalisedUser = rawUser
      ? {
          ...rawUser,
          name: rawUser.name || rawUser.fullName || '',
          plan: userPlanName || me?.subscription?.planName || subPlanName || 'Free',
          website: rawUser.website || (me?.sites?.[0]?.url || ''),
        }
      : null;
    setUser(normalisedUser);
    setSubscription(me?.subscription || null);
    setSites(Array.isArray(me?.sites) ? me.sites : []);
  };

  const hydrate = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setSubscription(null);
      setSites([]);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      applyMe(me);
    } catch {
      tokenStore.clearUser();
      setUser(null);
      setSubscription(null);
      setSites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    tokenStore.setUserTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    // /auth/me has the richer payload (subscription + sites)
    try {
      const me = await authApi.me();
      applyMe(me);
    } catch {
      applyMe({ user: data.user });
    }
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    if (data?.accessToken) {
      tokenStore.setUserTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      try {
        const me = await authApi.me();
        applyMe(me);
      } catch {
        applyMe({ user: data.user });
      }
      return data.user;
    }
    // Fallback: log in after register.
    return login({ email: payload.email, password: payload.password });
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clearing local tokens is what matters
    }
    tokenStore.clearUser();
    setUser(null);
    setSubscription(null);
    setSites([]);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    user,
    subscription,
    sites,
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
