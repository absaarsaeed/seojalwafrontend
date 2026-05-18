import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

const STORAGE_KEY = 'seo_jalwa_user';
const PRICING_KEY = 'seo_jalwa_admin';

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

const defaultUser = {
  id: '1',
  name: 'Ahmed Hassan',
  email: 'ahmed@mybrand.com',
  website: 'https://mybrand.com',
  plan: 'Growth',
  avatar: null,
  jalwaScore: 67,
  createdAt: '2025-10-15'
};

const defaultState = {
  isAuthenticated: false,
  user: null,
  cookieConsent: false
};

export const UserProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const initial = getInitialState();
    return initial || defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const signup = (userData) => {
    const newUser = {
      ...defaultUser,
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({ ...prev, isAuthenticated: true, user: newUser }));
    return true;
  };

  const login = (email, password) => {
    // For demo, any login works
    setState(prev => ({ 
      ...prev, 
      isAuthenticated: true, 
      user: { ...defaultUser, email } 
    }));
    return true;
  };

  const logout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false, user: null }));
  };

  const updateUser = (updates) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates }
    }));
  };

  const acceptCookies = () => {
    setState(prev => ({ ...prev, cookieConsent: true }));
  };

  // Get pricing from admin panel localStorage
  const getPricing = () => {
    try {
      const adminData = localStorage.getItem(PRICING_KEY);
      if (adminData) {
        const parsed = JSON.parse(adminData);
        if (parsed.pricing) {
          return parsed.pricing;
        }
      }
    } catch {}
    
    // Default pricing
    return {
      starter: { name: 'Starter', monthlyPrice: 79, annualPrice: 69 },
      growth: { name: 'Growth', monthlyPrice: 199, annualPrice: 166, popular: true },
      agency: { name: 'Agency', monthlyPrice: 499, annualPrice: 416 }
    };
  };

  const value = {
    ...state,
    signup,
    login,
    logout,
    updateUser,
    acceptCookies,
    getPricing
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
