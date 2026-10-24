'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Timer } from 'lucide-react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/storeContext';
import BrewingGuideModal from './BrewingGuideModal';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [showBrewingGuide, setShowBrewingGuide] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const isWishlisted = isInWishlist(product._id);

  return (
    <>
      <div className="group bg-white rounded-card border border-brand-mint/30 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col overflow-hidden relative">
        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-brand-gold text-brand-darkGreen font-bold text-[10px] uppercase px-2.5 py-1 rounded-badge shadow-gold">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Heart Icon */}
        <button
          onClick={() => toggleWishlist(product._id)}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 ${
            isWishlisted
              ? 'bg-red-50 text-red-500 shadow-md'
              : 'bg-white/80 text-gray-400 hover:text-red-500 shadow-soft'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-brand-beige group">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Quick Action Overlay Buttons */}
          <div className="absolute inset-x-2 bottom-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 flex gap-1.5 z-10">
            <button
              onClick={() => setShowQuickView(true)}
              className="flex-1 bg-white/95 hover:bg-white active:scale-95 text-brand-darkGreen text-[11px] font-semibold py-1.5 rounded-button backdrop-blur-sm flex items-center justify-center gap-1 shadow-soft hover:shadow-md transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
            <button
              onClick={() => setShowBrewingGuide(true)}
              className="bg-brand-darkGreen hover:bg-black active:scale-95 text-brand-gold text-[11px] font-semibold px-2.5 py-1.5 rounded-button flex items-center justify-center transition-all"
              title="Brewing Timer & Guide"
            >
              <Timer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Content Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Category Name */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span className="font-medium text-brand-green uppercase tracking-wider text-[10px]">
                {product.categoryName}
              </span>
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-heading font-bold text-sm text-brand-darkGreen line-clamp-1 hover:text-brand-green transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Subtitle / Key Benefit */}
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-light">
              {product.subtitle}
            </p>
          </div>

          {/* Price & Add to Cart Action */}
          <div className="pt-2 border-t border-brand-mint/20 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-bold text-base text-brand-green">
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                )}
              </div>
              <span className="text-[11px] text-brand-darkGreen font-semibold block mt-0.5">30 Tea Bags • {product.caffeineLevel}</span>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="btn-primary-gradient text-xs font-semibold px-4 py-2 rounded-button shadow-soft flex items-center gap-1.5 transition-all duration-200"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBrewingGuide && (
        <BrewingGuideModal product={product} onClose={() => setShowBrewingGuide(false)} />
      )}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
