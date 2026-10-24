'use client';

import React from 'react';
import { AppProviders, useAuth, useCart, useWishlist, useUI } from './contexts';

export { useAuth, useCart, useWishlist, useUI };

// Backward-compatible StoreProvider
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

// Backward-compatible useStore hook
export function useStore() {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();

  return {
    // Cart
    cart: cart.cart,
    addToCart: cart.addToCart,
    removeFromCart: cart.removeFromCart,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
    cartSubtotal: cart.cartSubtotal,
    cartDiscount: cart.cartDiscount,
    cartShipping: cart.cartShipping,
    cartTax: cart.cartTax,
    cartTotal: cart.cartTotal,
    appliedCoupon: cart.appliedCoupon,
    applyCoupon: cart.applyCoupon,
    removeCoupon: cart.removeCoupon,
    giftWrap: cart.giftWrap,
    setGiftWrap: cart.setGiftWrap,

    // Wishlist
    wishlist: wishlist.wishlist,
    toggleWishlist: wishlist.toggleWishlist,
    isInWishlist: wishlist.isInWishlist,

    // Auth
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    updateUserAddresses: auth.updateUserAddresses,
    loginAsDemoAdmin: auth.loginAsDemoAdmin,
    logout: auth.logout,
    isAuthLoading: auth.isAuthLoading,

    // UI
    isCartOpen: ui.isCartOpen,
    setIsCartOpen: ui.setIsCartOpen,
    isSearchOpen: ui.isSearchOpen,
    setIsSearchOpen: ui.setIsSearchOpen,
    toasts: ui.toasts,
    showToast: ui.showToast,
    removeToast: ui.removeToast,
  };
}
