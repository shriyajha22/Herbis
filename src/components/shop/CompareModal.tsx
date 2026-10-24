'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, ShoppingBag, Sparkles, Scale } from 'lucide-react';
import { initialProducts } from '@/lib/seedData';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/storeContext';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onRemoveProduct: (id: string) => void;
}

export default function CompareModal({ isOpen, onClose, selectedProductIds, onRemoveProduct }: CompareModalProps) {
  const { addToCart } = useStore();

  if (!isOpen) return null;

  const compareProducts = initialProducts.filter((p) => selectedProductIds.includes(p._id));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-modal shadow-premium border border-brand-mint/40 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-brand-darkGreen text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-gold" />
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white">
              Herbal Tea Comparison Matrix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {compareProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-bold text-brand-darkGreen">No teas selected for comparison</p>
              <p className="text-xs text-gray-500">Click &quot;Compare&quot; on any product card in the shop catalog to compare features side-by-side.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {compareProducts.map((product) => (
                <div key={product._id} className="bg-brand-cream/50 rounded-card p-5 border border-brand-mint/30 flex flex-col justify-between space-y-4 relative">
                  <button
                    onClick={() => onRemoveProduct(product._id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-gray-400 hover:text-red-600 shadow-soft"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-image overflow-hidden bg-brand-beige">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green bg-brand-mint/30 px-2 py-0.5 rounded">
                        {product.categoryName}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-brand-darkGreen mt-1 line-clamp-2">
                        {product.name}
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs border-t border-brand-mint/20 pt-3">
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase">Price</span>
                        <span className="font-extrabold text-brand-green text-sm">₹{product.price}</span>
                        <span className="text-gray-400 line-through text-[11px] ml-1.5">₹{product.mrp}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase">Caffeine Level</span>
                        <span className="font-bold text-brand-darkGreen">{product.caffeineLevel}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase">Taste Profile</span>
                        <span className="font-medium text-gray-700">{product.flavorProfile || 'Earthy & Smooth'}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px] uppercase mb-1">Key Ingredients</span>
                        <ul className="space-y-1">
                          {product.ingredients.slice(0, 3).map((ing, idx) => (
                            <li key={idx} className="flex items-center gap-1 text-[11px] text-gray-600">
                              <Check className="w-3 h-3 text-brand-green flex-shrink-0" />
                              <span>{ing.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-brand-green hover:bg-brand-darkGreen text-white font-bold text-xs rounded-button shadow-soft flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
