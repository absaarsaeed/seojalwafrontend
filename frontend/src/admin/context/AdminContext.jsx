import { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_PRICING, SETTINGS_DATA, COUPONS, BLOG_POSTS, ANNOUNCEMENTS, USERS_LIST, API_KEYS_CONFIG } from '../data/dummyData';
import { AdminAuthProvider, useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';

const AdminContext = createContext(null);

const STORAGE_KEY = 'seo_jalwa_admin';

const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge in any API key sections that didn't exist when the stored state was created
      // (e.g. `analytics` was added after launch). Existing sections are preserved.
      const mergedApiKeys = { ...API_KEYS_CONFIG, ...(parsed.apiKeys || {}) };
      Object.keys(API_KEYS_CONFIG).forEach((sectionKey) => {
        if (!mergedApiKeys[sectionKey]) mergedApiKeys[sectionKey] = API_KEYS_CONFIG[sectionKey];
      });
      return { ...parsed, apiKeys: mergedApiKeys };
    } catch {
      return null;
    }
  }
  return null;
};

const defaultState = {
  pricing: DEFAULT_PRICING,
  settings: SETTINGS_DATA,
  coupons: COUPONS,
  blogPosts: BLOG_POSTS,
  announcements: ANNOUNCEMENTS,
  users: USERS_LIST,
  apiKeys: API_KEYS_CONFIG,
  userNotes: {}
};

export const AdminProvider = ({ children }) => (
  <AdminAuthProvider>
    <AdminBridge>{children}</AdminBridge>
  </AdminAuthProvider>
);

const AdminBridge = ({ children }) => {
  const adminAuth = useAdminAuth();
  const [state, setState] = useState(() => {
    const initial = getInitialState();
    return initial || defaultState;
  });

  // Persist to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Hydrate state from live API once the admin session is active.
  useEffect(() => {
    if (!adminAuth.isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const [coupons, blogPosts, announcements, apiKeysArr, settings] = await Promise.all([
          adminApi.coupons().catch(() => null),
          adminApi.blog().catch(() => null),
          adminApi.announcements().catch(() => null),
          adminApi.apiKeys().catch(() => null),
          adminApi.settings().catch(() => null),
        ]);
        if (cancelled) return;
        setState((prev) => {
          const next = { ...prev };
          if (Array.isArray(coupons) && coupons.length) next.coupons = coupons;
          if (Array.isArray(blogPosts) && blogPosts.length) next.blogPosts = blogPosts;
          if (Array.isArray(announcements) && announcements.length) next.announcements = announcements;
          if (Array.isArray(apiKeysArr) && apiKeysArr.length) {
            // Live API returns flat array; UI groups keys into sections. Build a lookup by `key`.
            next.liveApiKeys = apiKeysArr.reduce((acc, k) => {
              acc[k.key] = k;
              return acc;
            }, {});
          }
          if (settings && typeof settings === 'object') next.liveSettings = settings;
          return next;
        });
      } catch {
        // Silent — fallbacks remain
      }
    })();
    return () => { cancelled = true; };
  }, [adminAuth.isAuthenticated]);

  // Auth now flows from AdminAuthContext (real backend).
  const login = async (username, password) => {
    try {
      await adminAuth.login({ username, password });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    adminAuth.logout();
  };

  const updatePricing = (newPricing) => {
    setState(prev => ({ ...prev, pricing: newPricing }));
  };

  const updateSettings = (newSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  };

  const addCoupon = (coupon) => {
    setState(prev => ({
      ...prev,
      coupons: [{ ...coupon, id: Date.now() }, ...prev.coupons]
    }));
  };

  const updateCoupon = (id, updates) => {
    setState(prev => ({
      ...prev,
      coupons: prev.coupons.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCoupon = (id) => {
    setState(prev => ({
      ...prev,
      coupons: prev.coupons.filter(c => c.id !== id)
    }));
  };

  const addBlogPost = (post) => {
    setState(prev => ({
      ...prev,
      blogPosts: [{ ...post, id: Date.now(), views: 0 }, ...prev.blogPosts]
    }));
  };

  const updateBlogPost = (id, updates) => {
    setState(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteBlogPost = (id) => {
    setState(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.filter(p => p.id !== id)
    }));
  };

  const addAnnouncement = (announcement) => {
    setState(prev => ({
      ...prev,
      announcements: [{ ...announcement, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...prev.announcements]
    }));
  };

  const updateUserStatus = (userId, status) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status } : u)
    }));
  };

  const updateUserNote = (userId, note) => {
    setState(prev => ({
      ...prev,
      userNotes: { ...prev.userNotes, [userId]: note }
    }));
  };

  const updateApiKey = (section, keyId, values) => {
    setState(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [section]: prev.apiKeys[section].map(k =>
          k.id === keyId ? { ...k, ...values, status: 'connected' } : k
        )
      }
    }));
  };

  const value = {
    ...state,
    isAuthenticated: adminAuth.isAuthenticated,
    login,
    logout,
    updatePricing,
    updateSettings,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addAnnouncement,
    updateUserStatus,
    updateUserNote,
    updateApiKey
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
