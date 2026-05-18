import { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_PRICING, SETTINGS_DATA, COUPONS, BLOG_POSTS, ANNOUNCEMENTS, USERS_LIST, API_KEYS_CONFIG } from '../data/dummyData';

const AdminContext = createContext(null);

const STORAGE_KEY = 'seo_jalwa_admin';

const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

const defaultState = {
  isAuthenticated: false,
  pricing: DEFAULT_PRICING,
  settings: SETTINGS_DATA,
  coupons: COUPONS,
  blogPosts: BLOG_POSTS,
  announcements: ANNOUNCEMENTS,
  users: USERS_LIST,
  apiKeys: API_KEYS_CONFIG,
  userNotes: {}
};

export const AdminProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const initial = getInitialState();
    return initial || defaultState;
  });

  // Persist to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (username, password) => {
    if (username === 'jalwa' && password === 'jalwaadmin') {
      setState(prev => ({ ...prev, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false }));
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
