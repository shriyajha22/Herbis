'use client';

import React from 'react';
import { UIProvider, useUI } from './uiContext';
import { AuthProvider, useAuth } from './authContext';
import { WishlistProvider, useWishlist } from './wishlistContext';
import { CartProvider, useCart } from './cartContext';

export { useUI, useAuth, useWishlist, useCart };
export { UIProvider, AuthProvider, WishlistProvider, CartProvider };

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </UIProvider>
  );
}
