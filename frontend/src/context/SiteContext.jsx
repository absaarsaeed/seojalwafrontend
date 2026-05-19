/**
 * SiteContext — Real /api/sites integration.
 *
 * - Fetches sites on auth state change (only when user logged in).
 * - Active site selection persisted in localStorage.
 * - `addSite` calls POST /api/sites; supported payload fields per live API:
 *     { name, url, platform }  where platform is restricted (wordpress, shopify, ...)
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { sitesApi } from '../lib/api';
import { useAuth } from './AuthContext';

const SiteContext = createContext(null);

const ACTIVE_KEY = 'jalwa_active_site';

const normaliseSite = (s) => {
  if (!s) return s;
  // Derive a friendly `domain` from a `url` field if needed.
  let domain = s.domain;
  if (!domain && s.url) {
    try {
      domain = new URL(s.url).hostname;
    } catch {
      domain = s.url.replace(/^https?:\/\//, '').split('/')[0];
    }
  }
  return { ...s, domain: domain || s.name };
};

export const SiteProvider = ({ children }) => {
  const { isAuthenticated, sites: authSites } = useAuth();
  const [sites, setSites] = useState(() => (Array.isArray(authSites) ? authSites : []));
  const [activeSiteId, setActiveSiteId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSites([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await sitesApi.list();
      const list = Array.isArray(data) ? data : data?.sites || [];
      setSites(list.map(normaliseSite));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial hydration from /api/auth/me sites
  useEffect(() => {
    if (Array.isArray(authSites) && authSites.length) {
      setSites(authSites.map(normaliseSite));
    }
  }, [authSites]);

  // Refetch whenever the user logs in/out
  useEffect(() => {
    if (isAuthenticated) refresh();
    else setSites([]);
  }, [isAuthenticated, refresh]);

  // Keep activeSiteId valid + persisted
  useEffect(() => {
    if (!sites.length) return;
    const found = activeSiteId && sites.find((s) => s.id === activeSiteId);
    if (!found) {
      setActiveSiteId(sites[0].id);
    }
  }, [sites, activeSiteId]);

  useEffect(() => {
    try {
      if (activeSiteId) localStorage.setItem(ACTIVE_KEY, activeSiteId);
    } catch {}
  }, [activeSiteId]);

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0] || null;

  const addSite = useCallback(async ({ name, url, domain, platform }) => {
    // Accept legacy `domain` field for backwards compatibility.
    const payload = {
      name,
      url: url || domain,
      // Live API requires UPPERCASE enum values: WORDPRESS, SHOPIFY, ...
      platform: (platform || 'wordpress').toUpperCase(),
    };
    const created = await sitesApi.create(payload);
    const site = normaliseSite(created?.id ? created : created?.site || created);
    setSites((prev) => [...prev, site]);
    if (site?.id) setActiveSiteId(site.id);
    return site;
  }, []);

  const value = {
    sites,
    activeSite,
    activeSiteId: activeSite?.id || null,
    setActiveSiteId,
    addSite,
    refresh,
    isLoading,
    error,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};
