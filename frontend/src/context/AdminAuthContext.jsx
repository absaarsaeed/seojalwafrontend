/**
 * AdminAuthContext — Real admin session auth.
 *
 * - Admin token is stored in sessionStorage (so it clears on tab close).
 * - Calls POST /api/admin/auth/login with { username, password }.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminAuthApi, tokenStore, ApiError } from '../lib/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStore.getAdmin());
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Re-sync on mount in case sessionStorage was cleared in another tab.
    setIsAuthenticated(!!tokenStore.getAdmin());
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const res = await adminAuthApi.login({ username, password });
    const token = res?.access_token || res?.token || res?.admin_token;
    if (!token) {
      throw new ApiError('Login response missing token', { status: 500, data: res });
    }
    tokenStore.setAdmin(token);
    setAdmin(res?.admin || res?.user || { username });
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clearAdmin();
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  const value = { isAuthenticated, admin, login, logout, ApiError };

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
