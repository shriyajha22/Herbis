'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { useUI } from './uiContext';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserAddresses: (addresses: any[]) => void;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useUI();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('pbh_user_session');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleSetCurrentUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem('pbh_user_session', JSON.stringify(user));
        } else {
          localStorage.removeItem('pbh_user_session');
        }
      } catch (e) {}
    }
  }, []);

  // Verify server session from HTTP-only cookie on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.user) {
          handleSetCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsAuthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [handleSetCurrentUser]);

  const updateUserAddresses = useCallback(
    (addresses: any[]) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, addresses };
      handleSetCurrentUser(updatedUser);

      try {
        const storedUsersRaw = localStorage.getItem('pbh_users');
        const users: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        const idx = users.findIndex((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (idx > -1) {
          users[idx].addresses = addresses;
          localStorage.setItem('pbh_users', JSON.stringify(users));
        }
      } catch (e) {}
    },
    [currentUser, handleSetCurrentUser]
  );

  const loginAsDemoAdmin = useCallback(() => {
    const adminUser: User = {
      _id: 'usr-admin',
      name: 'PrimeBrew Admin',
      email: 'Contact.primebrew@gmail.com',
      role: 'admin',
      addresses: [],
      wishlist: [],
      walletBalance: 1000,
    };
    handleSetCurrentUser(adminUser);
    showToast('Logged in as Admin (PrimeBrew Admin)', 'success');
  }, [handleSetCurrentUser, showToast]);

  const logout = useCallback(async () => {
    const isCurrentlyAdmin =
      currentUser?.role === 'admin' ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout API error:', e);
    }

    handleSetCurrentUser(null);

    try {
      localStorage.removeItem('pbh_user_session');
      localStorage.removeItem('pbh_cart');
      localStorage.removeItem('pbh_wishlist');
      localStorage.removeItem('pbh_orders');
      localStorage.removeItem('pbh_users');

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('pbh_cart_') || key.startsWith('pbh_wishlist_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    showToast('Logged out successfully', 'info');

    if (typeof window !== 'undefined') {
      if (isCurrentlyAdmin) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/';
      }
    }
  }, [currentUser, handleSetCurrentUser, showToast]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        updateUserAddresses,
        loginAsDemoAdmin,
        logout,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
