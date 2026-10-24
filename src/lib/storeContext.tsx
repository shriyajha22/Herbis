'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Coupon, User } from './types';
import { initialCoupons } from './seedData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedWeight?: string, quantity?: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTax: number;
  cartTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  giftWrap: boolean;
  setGiftWrap: (val: boolean) => void;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth & Addresses
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserAddresses: (addresses: any[]) => void;
  loginAsDemoAdmin: () => void;
  logout: () => void;

  // UI Drawers & Toasts
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Helper to load user-specific Cart & Wishlist
  const syncUserCartAndWishlist = (user: User | null) => {
    if (user && user.email) {
      const keyEmail = user.email.toLowerCase();
      // Load or preserve Customer Cart
      try {
        const savedCart = localStorage.getItem(`pbh_cart_${keyEmail}`);
        const guestCart = localStorage.getItem('pbh_cart_guest');

        setCart((prevCart) => {
          if (prevCart.length > 0) {
            // User had items in cart before logging in -> preserve them!
            localStorage.setItem(`pbh_cart_${keyEmail}`, JSON.stringify(prevCart));
            localStorage.removeItem('pbh_cart_guest');
            return prevCart;
          } else if (guestCart) {
            const parsedGuest = JSON.parse(guestCart);
            if (Array.isArray(parsedGuest) && parsedGuest.length > 0) {
              localStorage.setItem(`pbh_cart_${keyEmail}`, JSON.stringify(parsedGuest));
              localStorage.removeItem('pbh_cart_guest');
              return parsedGuest;
            }
          }
          return savedCart ? JSON.parse(savedCart) : [];
        });
      } catch (e) {
        setCart([]);
      }

      // Load Customer Wishlist
      try {
        const savedWishlist = localStorage.getItem(`pbh_wishlist_${keyEmail}`);
        const userWishlist = user.wishlist || (savedWishlist ? JSON.parse(savedWishlist) : []);
        setWishlist(Array.isArray(userWishlist) ? userWishlist : []);
      } catch (e) {
        setWishlist([]);
      }
    } else {
      // Logout / Unauthenticated state: preserve guest cart from localStorage if present
      try {
        const guestCart = localStorage.getItem('pbh_cart_guest');
        if (guestCart) {
          setCart(JSON.parse(guestCart));
        }
      } catch (e) {}
    }
  };

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
    syncUserCartAndWishlist(user);
  }, []);

  // Verify server session from HTTP-only cookie on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          handleSetCurrentUser(data.user);
        } else if (data.status === 401 || data.message?.includes('Unauthenticated')) {
          // Only clear if server explicitly rejects token
          // handleSetCurrentUser(null);
        }
      })
      .catch((e) => {});
  }, [handleSetCurrentUser]);

  // Save cart changes to customer-specific storage
  useEffect(() => {
    if (currentUser?.email) {
      try {
        localStorage.setItem(`pbh_cart_${currentUser.email.toLowerCase()}`, JSON.stringify(cart));
      } catch (e) {}
    } else {
      try {
        localStorage.setItem('pbh_cart_guest', JSON.stringify(cart));
      } catch (e) {}
    }
  }, [cart, currentUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, selectedWeight?: string, quantity = 1) => {
    const weight = selectedWeight || (product.weightVariants?.[0]?.weight || "Standard");
    const weightVariant = product.weightVariants?.find((v) => v.weight === weight);
    const unitPrice = weightVariant ? weightVariant.price : product.price;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product._id === product._id && item.selectedWeight === weight
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, selectedWeight: weight, unitPrice, quantity }];
      }
    });

    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, weight: string) => {
    setCart((prev) => prev.filter((item) => !(item.product._id === productId && item.selectedWeight === weight)));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId && item.selectedWeight === weight
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && cartDiscount > appliedCoupon.maxDiscount) {
        cartDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      cartDiscount = appliedCoupon.discountValue;
    }
  }

  const cartShipping = cartSubtotal > 799 || cart.length === 0 ? 0 : 70;
  const cartTax = Math.round((cartSubtotal - cartDiscount) * 0.05 * 100) / 100; // 5% GST on tea
  const cartTotal = Math.max(0, Math.round((cartSubtotal - cartDiscount + cartShipping + cartTax + (giftWrap ? 49 : 0)) * 100) / 100);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = initialCoupons.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid coupon code' };
    }
    if (cartSubtotal < found.minOrderAmount) {
      return { success: false, message: `Minimum order amount for ${found.code} is ₹${found.minOrderAmount}` };
    }

    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied!`, 'success');
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const toggleWishlist = (productId: string) => {
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
        }).catch((e) => {});
      }

      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const updateUserAddresses = (addresses: any[]) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, addresses };
    setCurrentUser(updatedUser);
    // Sync to local cache
    try {
      const storedUsersRaw = localStorage.getItem('pbh_users');
      const users: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const idx = users.findIndex((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (idx > -1) {
        users[idx].addresses = addresses;
        localStorage.setItem('pbh_users', JSON.stringify(users));
      }
    } catch (e) {}
  };

  const loginAsDemoAdmin = () => {
    const adminUser: User = {
      _id: "usr-admin",
      name: "PrimeBrew Admin",
      email: "Contact.primebrew@gmail.com",
      role: "admin",
      addresses: [],
      wishlist: [],
      walletBalance: 1000
    };
    handleSetCurrentUser(adminUser);
    showToast("Logged in as Admin (PrimeBrew Admin)", "success");
  };

  const logout = async () => {
    const isCurrentlyAdmin = currentUser?.role === 'admin' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout API error:', e);
    }

    setCurrentUser(null);
    setCart([]);
    setWishlist([]);

    try {
      localStorage.removeItem('pbh_user_session');
      localStorage.removeItem('pbh_cart');
      localStorage.removeItem('pbh_wishlist');
      localStorage.removeItem('pbh_orders');
      localStorage.removeItem('pbh_users');

      // Purge any user-specific local storage keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('pbh_cart_') || key.startsWith('pbh_wishlist_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    showToast("Logged out successfully", "info");

    if (typeof window !== 'undefined') {
      if (isCurrentlyAdmin) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTax,
        cartTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        giftWrap,
        setGiftWrap,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        updateUserAddresses,
        loginAsDemoAdmin,
        logout,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
