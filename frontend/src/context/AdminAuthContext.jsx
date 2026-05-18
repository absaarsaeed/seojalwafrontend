/**
 * AdminAuthContext — Admin session auth.
 *
 * Live API:
 *   POST /api/admin/auth/login → data: { accessToken, admin? }
 *   Admin token stored in sessionStorage; cleared on tab close.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { adminAuthApi, tokenStore, ApiError } from '../lib/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStore.getAdmin());
  const [admin, setAdmin] = useState(null);

  const login = useCallback(async ({ username, password }) => {
    const data = await adminAuthApi.login({ username, password });
    const token =
      data?.accessToken || data?.access_token || data?.token || data?.adminToken;
    if (!token) {
      throw new ApiError('Login response missing token', { status: 500, data });
    }
    tokenStore.setAdmin(token);
    setAdmin(data?.admin || data?.user || { username });
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
