/**
 * UserContext (bridge) — exposes legacy `useUser` API powered by AuthContext.
 *
 * Live /api/plans → array of { id, name, monthlyPrice, annualPrice, ... }.
 * We normalise into legacy key-shape ({ starter, growth, agency }) AND expose
 * the raw array as `plans` so newer code can use it directly.
 *
 * Signup form sends { name, email, password, website } — we remap `name` to
 * `fullName` for the live API.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { plansApi } from '../lib/api';

const COOKIE_KEY = 'jalwa_cookie_consent';

const DEFAULT_PRICING = {
  starter: { name: 'Starter', monthlyPrice: 79, annualPrice: 69 },
  growth: { name: 'Growth', monthlyPrice: 199, annualPrice: 166, popular: true },
  agency: { name: 'Agency', monthlyPrice: 499, annualPrice: 416 },
};

const POPULAR_KEY = 'growth';

const normalisePlans = (data) => {
  if (!data) return { keyed: DEFAULT_PRICING, list: [] };

  const list = Array.isArray(data) ? data : Array.isArray(data?.plans) ? data.plans : [];
  if (!list.length) return { keyed: DEFAULT_PRICING, list: [] };

  const keyed = {};
  for (const p of list) {
    const k = (p.name || p.key || p.slug || p.id || '').toString().toLowerCase();
    if (!k) continue;
    const monthly = p.monthlyPrice ?? p.monthly_price ?? p.price_monthly ?? 0;
    const annual = p.annualPrice ?? p.annual_price ?? p.price_annual ?? 0;
    // Live API returns annual as the YEARLY total (e.g. 790 = 79*10) — derive monthly equivalent.
    const annualMonthly = annual && annual > monthly * 6 ? Math.round((annual / 12) * 100) / 100 : annual;
    keyed[k] = {
      id: p.id,
      name: p.name || k.charAt(0).toUpperCase() + k.slice(1),
      monthlyPrice: monthly,
      annualPrice: annualMonthly,
      annualTotal: annual,
      popular: !!(p.popular ?? p.is_popular ?? (k === POPULAR_KEY)),
      raw: p,
    };
  }
  return { keyed: { ...DEFAULT_PRICING, ...keyed }, list };
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
  const [plansList, setPlansList] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await plansApi.list();
        if (cancelled) return;
        const { keyed, list } = normalisePlans(data);
        setPricing(keyed);
        setPlansList(list);
      } catch {
        // Keep defaults silently.
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

  const login = useCallback((email, password) => auth.login({ email, password }), [auth]);

  const signup = useCallback(
    (formData) =>
      auth.signup({
        // Live API requires `fullName`
        fullName: formData?.fullName || formData?.name || '',
        email: formData?.email,
        password: formData?.password,
        // `website` is intentionally not sent (the live register endpoint
        // doesn't accept it and would 422). User can add a site after signup.
      }),
    [auth],
  );

  const value = {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    subscription: auth.subscription,
    login,
    signup,
    logout: auth.logout,
    updateUser: auth.updateUser,
    refresh: auth.refresh,
    cookieConsent,
    acceptCookies,
    pricing,
    plans: plansList,
    getPricing: () => pricing,
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
