
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    let userData = null;
    const isAdmin = email === 'a@a.com' && password === '1234567';
    const isTestUser = email === 'testuser@letsdropship.com' && password === 'Demo@1234';

    if (isAdmin) {
      userData = {
        email,
        name: 'অ্যাডমিন',
        isMember: true,
        isAdmin: true,
        referralCode: 'ADMINREF123',
        subscription: {
          plan: "Admin Access",
          validUntil: "2025-12-31T00:00:00.000Z",
          importsRemaining: Infinity,
          importsTotal: Infinity,
          storeConnected: true,
          storeType: "Shopify"
        }
      };
    } else if (isTestUser) {
      userData = {
        email,
        name: 'টেস্ট ব্যবহারকারী',
        isMember: true,
        isAdmin: false,
        referralCode: 'LETSDROP123',
        subscription: {
          plan: "Starter Plan",
          validUntil: "2025-12-31T00:00:00.000Z",
          importsRemaining: 85,
          importsTotal: 100,
          storeConnected: true,
          storeType: "Shopify"
        }
      };
    }

    if (userData) {
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }

    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const becomeMember = () => {
    if (user && !user.isMember) {
      const updatedUser = {
        ...user,
        isMember: true,
        subscription: {
          plan: "Starter Plan",
          validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          importsRemaining: 85,
          importsTotal: 100,
          storeConnected: false,
          storeType: null
        }
      };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isMember: user?.isMember || false,
    isAdmin: user?.isAdmin || false,
    loading,
    login,
    logout,
    becomeMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
