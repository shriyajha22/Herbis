'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Heart, Check, Leaf, Shield } from 'lucide-react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/storeContext';

export default function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedWeight, setSelectedWeight] = useState(
    product.weightVariants?.[0]?.weight || "30 Tea Bags"
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'benefits' | 'nutrition'>('ingredients');

  const selectedVariant = product.weightVariants?.find((v) => v.weight === selectedWeight);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const isWishlisted = isInWishlist(product._id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-modal shadow-premium w-full max-w-3xl overflow-hidden border border-brand-mint/30 relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-brand-darkGreen transition-colors shadow-soft"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Product Image */}
        <div className="md:w-1/2 bg-brand-beige relative min-h-[280px] md:min-h-[420px]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.discountPercentage > 0 && (
            <span className="absolute top-4 left-4 bg-brand-gold text-brand-darkGreen font-bold text-xs px-3 py-1 rounded-badge shadow-gold">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Right Details */}
        <div className="md:w-1/2 p-6 overflow-y-auto space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-brand-green font-semibold">
              <Leaf className="w-3.5 h-3.5" />
              <span>{product.categoryName}</span>
              <span className="text-gray-300">•</span>
              <span className="bg-brand-mint/40 text-brand-darkGreen font-bold px-2 py-0.5 rounded">30 Tea Bags</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{product.caffeineLevel}</span>
            </div>

            <h2 className="font-heading font-bold text-xl text-brand-darkGreen">{product.name}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{product.subtitle}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-1 border-t border-gray-100">
              <span className="font-heading font-bold text-2xl text-brand-green">₹{currentPrice}</span>
              {currentMrp > currentPrice && (
                <span className="text-sm text-gray-400 line-through">₹{currentMrp}</span>
              )}
              <span className="text-xs text-sky-600 font-semibold">(Inclusive of all taxes)</span>
            </div>

            {/* Weight Variant Selector */}
            {product.weightVariants && product.weightVariants.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-brand-darkGreen uppercase tracking-wider block">
                  Select Size / Packaging:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weightVariants.map((variant) => (
                    <button
                      key={variant.weight}
                      onClick={() => setSelectedWeight(variant.weight)}
                      className={`text-xs px-3 py-1.5 rounded-button border font-medium transition-all ${
                        selectedWeight === variant.weight
                          ? 'border-brand-green bg-brand-green text-white font-bold shadow-soft'
                          : 'border-gray-200 bg-brand-beige text-brand-charcoal hover:border-brand-green'
                      }`}
                    >
                      {variant.weight} - ₹{variant.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabbed Info */}
            <div className="pt-2">
              <div className="flex border-b border-gray-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 mr-4 ${activeTab === 'ingredients' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`pb-2 mr-4 ${activeTab === 'benefits' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`pb-2 ${activeTab === 'nutrition' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
                >
                  Nutrition
                </button>
              </div>

              <div className="py-3 text-xs text-gray-600">
                {activeTab === 'ingredients' && (
                  <ul className="space-y-1">
                    {product.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                        <span><strong>{ing.name}</strong> {ing.percentage && `(${ing.percentage})`} - {ing.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'benefits' && (
                  <ul className="space-y-1">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'nutrition' && (
                  <div className="grid grid-cols-2 gap-2 bg-brand-beige p-2.5 rounded-button text-[11px]">
                    <div>Calories: <strong>{product.nutritionInfo.calories}</strong></div>
                    <div>Carbs: <strong>{product.nutritionInfo.carbs}</strong></div>
                    <div>Protein: <strong>{product.nutritionInfo.protein}</strong></div>
                    <div>Antioxidants: <strong>{product.nutritionInfo.antioxidants}</strong></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quantity & CTA */}
          <div className="pt-3 border-t border-gray-200 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  addToCart(product, selectedWeight, quantity);
                  onClose();
                }}
                className="flex-1 btn-primary-gradient text-xs py-3 rounded-button shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                Add to Cart • ₹{currentPrice * quantity}
              </button>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3 rounded-button border transition-colors ${
                  isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="block text-center text-xs font-semibold text-brand-darkGreen hover:text-brand-green underline"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
