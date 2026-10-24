'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, Gift, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/storeContext';

export default function CartDrawer() {
  const pathname = usePathname();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
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
    currentUser,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const isWindowAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminUser = currentUser?.role === 'admin';

  if (isAdminPath || isWindowAdmin || isAdminUser) {
    return null;
  }

  if (!isCartOpen) return null;

  const freeShippingThreshold = 799;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-cream border-l border-brand-mint/30 shadow-premium flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-brand-mint/20 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-green" />
              <h2 className="font-heading font-bold text-lg text-brand-darkGreen">Your Herbal Basket</h2>
              <span className="bg-brand-mint/30 text-brand-darkGreen text-xs font-bold px-2 py-0.5 rounded-badge">
                {cart.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-brand-darkGreen hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-brand-beige px-5 py-3 border-b border-brand-mint/20" style={{backgroundColor:'#F0F8FF'}}>
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              {amountNeededForFreeShipping > 0 ? (
                <span className="text-brand-charcoal">
                  Add <strong className="text-brand-green">₹{amountNeededForFreeShipping}</strong> more for <strong>FREE Express Shipping</strong>!
                </span>
              ) : (
                <span className="text-brand-green font-bold flex items-center gap-1">
                  🎉 Congratulations! You unlocked FREE Express Shipping!
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-green h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{backgroundColor:'#F0F8FF'}}>
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-brand-mint/20 rounded-full flex items-center justify-center mx-auto text-brand-green">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-brand-darkGreen">Your cart is currently empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our artisanal farm-fresh teas to start your wellness journey today.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-brand-green text-white font-semibold text-xs px-6 py-3 rounded-button hover:bg-brand-darkGreen transition-colors shadow-soft"
                >
                  <Link href="/shop">Browse Tea Collection</Link>
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product._id}-${item.selectedWeight}-${idx}`}
                  className="bg-white p-3.5 rounded-card border border-brand-mint/30 shadow-card flex gap-3 items-center"
                >
                  <div className="w-16 h-16 rounded-image overflow-hidden relative flex-shrink-0 bg-brand-beige">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-semibold text-xs text-brand-darkGreen truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-gray-500">{item.selectedWeight}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-xs text-brand-green">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.selectedWeight, item.quantity - 1)}
                          className="w-6 h-6 rounded-full btn-action-decrease flex items-center justify-center shadow-soft"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-brand-darkGreen">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.selectedWeight, item.quantity + 1)}
                          className="w-6 h-6 rounded-full btn-action-increase flex items-center justify-center shadow-soft"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product._id, item.selectedWeight)}
                    className="p-1.5 btn-action-remove rounded-full transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-brand-mint/20 space-y-4">
              {/* Gift Wrapping Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-button bg-brand-beige/60 border border-brand-mint/30 text-xs">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-brand-gold" />
                  <span className="font-medium text-brand-darkGreen">Add Eco Gift Wrap (₹49)</span>
                </div>
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 accent-brand-green cursor-pointer"
                />
              </div>

              {/* Coupon Code Section */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-button bg-sky-50 border border-sky-200 text-xs text-sky-800">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-sky-600" />
                      <span>Code <strong>{appliedCoupon.code}</strong> applied (-₹{cartDiscount})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs font-bold text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. HERBALNEW50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-input focus:outline-none focus:border-brand-green"
                    />
                    <button
                      type="submit"
                      className="bg-brand-darkGreen text-white text-xs font-semibold px-3 py-1.5 rounded-button hover:bg-brand-green transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
              </div>

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-brand-darkGreen">₹{cartSubtotal}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-sky-700 font-semibold">
                    <span>Discount</span>
                    <span className="font-medium">-₹{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-medium text-brand-darkGreen">₹{cartTax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-brand-darkGreen">
                    {cartShipping === 0 ? <strong className="text-sky-600">FREE</strong> : `₹${cartShipping}`}
                  </span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between">
                    <span>Gift Wrap</span>
                    <span className="font-medium text-brand-darkGreen">₹49</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-brand-darkGreen pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-brand-green text-base">₹{cartTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full btn-primary-gradient py-3.5 rounded-button shadow-soft flex items-center justify-center gap-2 transition-all duration-300 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" /> 256-bit Bank Grade SSL Encryption
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
