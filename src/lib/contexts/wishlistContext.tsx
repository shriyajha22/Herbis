'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import { useUI } from './uiContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { showToast } = useUI();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Synchronize user wishlist when current user changes
  useEffect(() => {
    if (currentUser?.email) {
      const keyEmail = currentUser.email.toLowerCase();
      try {
        const savedWishlist = localStorage.getItem(`pbh_wishlist_${keyEmail}`);
        const userWishlist = currentUser.wishlist || (savedWishlist ? JSON.parse(savedWishlist) : []);
        setWishlist(Array.isArray(userWishlist) ? userWishlist : []);
      } catch (e) {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [currentUser]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];

        if (exists) {
          showToast('Removed from Wishlist', 'info');
        } else {
          showToast('Added to Wishlist', 'success');
        }

        if (currentUser?.email) {
          const keyEmail = currentUser.email.toLowerCase();
          try {
            localStorage.setItem(`pbh_wishlist_${keyEmail}`, JSON.stringify(updated));
          } catch (e) {}

          fetch('/api/user/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, wishlist: updated }),
          }).catch(() => {});
        }

        return updated;
      });
    },
    [currentUser, showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
