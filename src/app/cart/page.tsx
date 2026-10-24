'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/storeContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Gift } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTax,
    cartTotal,
    appliedCoupon,
    removeCoupon,
    giftWrap,
    setGiftWrap,
  } = useStore();

  return (
    <div className="py-12 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-extrabold text-3xl text-brand-darkGreen mb-8">
          Shopping Cart ({cart.length} items)
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-card p-12 text-center border border-brand-mint/30 shadow-card space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-brand-beige rounded-full flex items-center justify-center mx-auto text-brand-green">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Your Cart is Empty</h2>
            <p className="text-xs text-gray-500">
              Discover our range of 100% organic Himalayan herbal teas.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-brand-green text-white font-bold text-xs px-6 py-3 rounded-button shadow-soft hover:bg-brand-darkGreen transition-colors"
            >
              Explore Teas Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Items Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-card border border-brand-mint/30 shadow-card overflow-hidden">
                <div className="p-4 bg-brand-beige border-b border-brand-mint/20 text-xs font-bold text-brand-darkGreen grid grid-cols-12">
                  <span className="col-span-6">Product Details</span>
                  <span className="col-span-2 text-center">Price</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>

                <div className="divide-y divide-gray-100 p-4 space-y-4">
                  {cart.map((item, idx) => (
                    <div key={`${item.product._id}-${item.selectedWeight}-${idx}`} className="grid grid-cols-12 items-center gap-2 text-xs pt-4 first:pt-0">
                      <div className="col-span-6 flex gap-3 items-center">
                        <div className="w-16 h-16 rounded-card overflow-hidden relative bg-brand-beige flex-shrink-0">
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-brand-darkGreen text-xs">{item.product.name}</h4>
                          <span className="text-[11px] text-gray-500 block">{item.selectedWeight}</span>
                          <button
                            onClick={() => removeFromCart(item.product._id, item.selectedWeight)}
                            className="text-[11px] btn-action-remove font-semibold flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 text-center font-semibold text-gray-700">
                        ₹{item.unitPrice}
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.selectedWeight, item.quantity - 1)}
                            className="w-6 h-6 rounded-full btn-action-decrease flex items-center justify-center shadow-soft"
                            title="Decrease Quantity"
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </button>
                          <span className="w-6 text-center font-bold text-brand-darkGreen">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.selectedWeight, item.quantity + 1)}
                            className="w-6 h-6 rounded-full btn-action-increase flex items-center justify-center shadow-soft"
                            title="Increase Quantity"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-bold text-brand-green">
                        ₹{item.unitPrice * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <div className="bg-white rounded-card border border-brand-mint/30 shadow-card p-6 h-fit space-y-4">
              <h3 className="font-heading font-bold text-base text-brand-darkGreen border-b border-gray-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-brand-darkGreen">₹{cartSubtotal}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-sky-700 font-semibold">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="font-medium">-₹{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST Tax (5%)</span>
                  <span className="font-medium text-brand-darkGreen">₹{cartTax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="font-medium text-brand-darkGreen">
                    {cartShipping === 0 ? <strong className="text-sky-600 font-bold">FREE</strong> : `₹${cartShipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-darkGreen pt-3 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span className="text-brand-green text-lg">₹{cartTotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full btn-primary-gradient py-3.5 rounded-button shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
