import { createContext, useContext, useEffect, useState } from 'react';

const SiteContext = createContext(null);

const STORAGE_KEY = 'jalwa_active_site';
const SITES_KEY = 'jalwa_sites';

const DEFAULT_SITES = [
  { id: 'myblog', domain: 'myblog.com', name: 'My Blog', platform: 'WordPress' },
  { id: 'mystore', domain: 'mystore.com', name: 'My Store', platform: 'Shopify' },
];

const load = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const SiteProvider = ({ children }) => {
  const [sites, setSites] = useState(() => load(SITES_KEY, DEFAULT_SITES));
  const [activeSiteId, setActiveSiteId] = useState(() => {
    const stored = load(STORAGE_KEY, null);
    return stored || DEFAULT_SITES[0].id;
  });

  useEffect(() => {
    localStorage.setItem(SITES_KEY, JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSiteId));
  }, [activeSiteId]);

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0];

  const addSite = ({ domain, name, platform }) => {
    const id = domain.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-' + Date.now();
    const newSite = { id, domain, name, platform };
    setSites((prev) => [...prev, newSite]);
    setActiveSiteId(id);
    return newSite;
  };

  return (
    <SiteContext.Provider value={{ sites, activeSite, activeSiteId, setActiveSiteId, addSite }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};
