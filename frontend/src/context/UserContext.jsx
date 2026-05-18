/**
 * UserContext (bridge)
 *
 * Wraps AuthProvider and exposes the legacy `useUser` API so existing pages
 * keep working without changes:
 *   { isAuthenticated, user, login, signup, logout, updateUser,
 *     cookieConsent, acceptCookies, getPricing }
 *
 * - Auth state now flows from AuthContext (real backend).
 * - `login` / `signup` remain async; existing pages should await them.
 * - `getPricing` is a synchronous accessor returning the most recently fetched
 *   /api/plans payload (normalised). It falls back to DEFAULT_PRICING until the
 *   first successful fetch (kicked off on mount).
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { plansApi } from '../lib/api';

const COOKIE_KEY = 'jalwa_cookie_consent';

const DEFAULT_PRICING = {
  starter: { name: 'Starter', monthlyPrice: 79, annualPrice: 69 },
  growth: { name: 'Growth', monthlyPrice: 199, annualPrice: 166, popular: true },
  agency: { name: 'Agency', monthlyPrice: 499, annualPrice: 416 },
};

// Normalise a /api/plans response into the legacy { starter, growth, agency } shape.
const normalisePlans = (data) => {
  if (!data) return DEFAULT_PRICING;

  // Already keyed: { starter: {...}, growth: {...}, agency: {...} }
  if (!Array.isArray(data) && (data.starter || data.growth || data.agency)) {
    return { ...DEFAULT_PRICING, ...data };
  }

  // Array of plan objects from the API.
  const list = Array.isArray(data) ? data : data.plans || [];
  if (!list.length) return DEFAULT_PRICING;

  const byKey = {};
  for (const p of list) {
    const key = (p.key || p.slug || p.id || p.name || '').toString().toLowerCase();
    if (!key) continue;
    byKey[key] = {
      name: p.name || key.charAt(0).toUpperCase() + key.slice(1),
      monthlyPrice: p.monthly_price ?? p.monthlyPrice ?? p.price_monthly ?? 0,
      annualPrice: p.annual_price ?? p.annualPrice ?? p.price_annual ?? 0,
      popular: !!(p.popular ?? p.is_popular),
    };
  }
  return { ...DEFAULT_PRICING, ...byKey };
};

const LegacyUserContext = createContext(null);

const UserBridge = ({ children }) => {
  const auth = useAuth();

  const [cookieConsent, setCookieConsent] = useState(() => {
    try {
      return localStorage.getItem(COOKIE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const pricingRef = useRef(pricing);
  pricingRef.current = pricing;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await plansApi.list();
        if (cancelled) return;
        setPricing(normalisePlans(res));
      } catch {
        // Silent fallback to defaults — surface in PricingPage if needed.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const acceptCookies = useCallback(() => {
    try {
      localStorage.setItem(COOKIE_KEY, '1');
    } catch {}
    setCookieConsent(true);
  }, []);

  // Legacy sync login/signup signatures kept for backwards compatibility,
  // but now return promises. Existing pages should `await` them.
  const login = useCallback((email, password) => auth.login({ email, password }), [auth]);
  const signup = useCallback(
    (formData) =>
      auth.signup({
        name: formData?.name,
        email: formData?.email,
        password: formData?.password,
        website: formData?.website,
      }),
    [auth],
  );

  const value = {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    login,
    signup,
    logout: auth.logout,
    updateUser: auth.updateUser,
    cookieConsent,
    acceptCookies,
    pricing,
    getPricing: () => pricingRef.current,
  };

  return <LegacyUserContext.Provider value={value}>{children}</LegacyUserContext.Provider>;
};

export const UserProvider = ({ children }) => (
  <AuthProvider>
    <UserBridge>{children}</UserBridge>
  </AuthProvider>
);

export const useUser = () => {
  const ctx = useContext(LegacyUserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
