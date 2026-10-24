'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { initialCoupons } from '../seedData';
import { useAuth } from './authContext';
import { useUI } from './uiContext';

interface CartContextType {
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { showToast, setIsCartOpen } = useUI();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);

  // Sync cart when user switches or logs in/out
  useEffect(() => {
    if (currentUser?.email) {
      const keyEmail = currentUser.email.toLowerCase();
      try {
        const savedCart = localStorage.getItem(`pbh_cart_${keyEmail}`);
        const guestCart = localStorage.getItem('pbh_cart_guest');

        setCart((prevCart) => {
          if (prevCart.length > 0) {
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
    } else {
      try {
        const guestCart = localStorage.getItem('pbh_cart_guest');
        if (guestCart) {
          setCart(JSON.parse(guestCart));
        }
      } catch (e) {}
    }
  }, [currentUser]);

  // Persist cart changes
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

  const addToCart = useCallback(
    (product: Product, selectedWeight?: string, quantity = 1) => {
      const weight = selectedWeight || product.weightVariants?.[0]?.weight || 'Standard';
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
    },
    [showToast, setIsCartOpen]
  );

  const removeFromCart = useCallback(
    (productId: string, weight: string) => {
      setCart((prev) => prev.filter((item) => !(item.product._id === productId && item.selectedWeight === weight)));
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, weight: string, quantity: number) => {
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
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      const discount = (cartSubtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount
        ? appliedCoupon.maxDiscount
        : discount;
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, cartSubtotal]);

  const cartShipping = useMemo(
    () => (cartSubtotal > 799 || cart.length === 0 ? 0 : 70),
    [cartSubtotal, cart.length]
  );

  const cartTax = useMemo(
    () => Math.round((cartSubtotal - cartDiscount) * 0.05 * 100) / 100,
    [cartSubtotal, cartDiscount]
  );

  const cartTotal = useMemo(
    () =>
      Math.max(
        0,
        Math.round((cartSubtotal - cartDiscount + cartShipping + cartTax + (giftWrap ? 49 : 0)) * 100) / 100
      ),
    [cartSubtotal, cartDiscount, cartShipping, cartTax, giftWrap]
  );

  const applyCoupon = useCallback(
    (code: string) => {
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
    },
    [cartSubtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  }, [showToast]);

  return (
    <CartContext.Provider
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
