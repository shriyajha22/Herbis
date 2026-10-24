'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, AlertCircle, Tag, Leaf } from 'lucide-react';
import { initialProducts } from '@/lib/seedData';
import { Product } from '@/lib/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to highlight matching substring in search results
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-brand-accentGreen/50 text-brand-darkGreen font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = RouterHook();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function RouterHook() {
    return useRouter();
  }

  // Filter products based on search query
  const cleanQuery = query.trim().toLowerCase();
  
  const filteredProducts: Product[] = cleanQuery
    ? initialProducts.filter((product) => {
        const matchName = product.name.toLowerCase().includes(cleanQuery);
        const matchCategory = product.categoryName.toLowerCase().includes(cleanQuery);
        const matchDesc = product.description.toLowerCase().includes(cleanQuery);
        const matchFlavor = product.flavorProfile?.toLowerCase().includes(cleanQuery);
        const matchHerbs = product.keyHerbs?.some((h) => h.toLowerCase().includes(cleanQuery));
        const matchIng = product.ingredients?.some((i) => i.name.toLowerCase().includes(cleanQuery));
        const matchBenefit = product.benefits?.some((b) => b.toLowerCase().includes(cleanQuery));

        return matchName || matchCategory || matchDesc || matchFlavor || matchHerbs || matchIng || matchBenefit;
      })
    : [];

  // Focus input on modal open & handle ESC key global listener
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation handler (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (!cleanQuery) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0 && selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
        navigateToProduct(filteredProducts[selectedIndex].slug);
      } else if (cleanQuery) {
        executeSearch(cleanQuery);
      }
    }
  };

  const navigateToProduct = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  if (!isOpen) return null;

  const popularTags = [
    { label: 'Blue Tea', slug: 'blue-tea' },
    { label: 'Blue Tea + Elaichi', slug: 'blue-tea-with-elaichi' },
    { label: 'Blue Tea + Ginger Cinnamon', slug: 'blue-tea-with-ginger-cinnamon' },
    { label: 'Guava Jamun Neem', slug: 'guava-jamun-neem-herbal-blend' },
    { label: 'Ayurvedic Kashayam', slug: 'authentic-ayurvedic-kashayam' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-brand-cardWhite border border-brand-mint/40 rounded-modal shadow-premium w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar Header */}
        <div className="p-4 bg-white border-b border-brand-mint/20 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-green flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by product, herb, ingredient, or health benefit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base text-brand-darkGrey bg-transparent focus:outline-none placeholder-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-brand-bgBeige"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => executeSearch(query)}
            className="btn-primary-gradient text-xs px-3.5 py-2 rounded-button flex items-center gap-1 shadow-soft"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-brand-bgBeige"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestions / Results Area */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Scenario 1: Active query with matching suggestions */}
          {cleanQuery && filteredProducts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-mediumGrey px-2">
                <span>Matching Products ({filteredProducts.length})</span>
                <span className="text-[10px] text-gray-400">Use ↑ ↓ to navigate, Enter to select</span>
              </div>
              <div className="space-y-1.5">
                {filteredProducts.map((product, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={product._id}
                      onClick={() => navigateToProduct(product.slug)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 rounded-button border transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-brand-bgBeige border-brand-green shadow-soft scale-[1.01]'
                          : 'bg-white border-gray-100 hover:border-brand-mint'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-image overflow-hidden relative bg-brand-bgBeige flex-shrink-0 border border-brand-mint/20">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-heading font-bold text-sm text-brand-darkGrey truncate">
                              <HighlightMatch text={product.name} query={query} />
                            </h4>
                            <span className="text-[10px] font-semibold text-brand-green bg-brand-accentGreen/30 px-2 py-0.5 rounded-badge flex-shrink-0">
                              <HighlightMatch text={product.categoryName} query={query} />
                            </span>
                          </div>
                          <p className="text-xs text-brand-mediumGrey truncate">
                            <HighlightMatch text={product.subtitle} query={query} />
                          </p>
                          {product.keyHerbs && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 truncate">
                              <Leaf className="w-3 h-3 text-brand-green flex-shrink-0" />
                              <span className="truncate">
                                Herbs: <HighlightMatch text={product.keyHerbs.join(', ')} query={query} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-heading font-bold text-sm text-brand-green block">
                          ₹{product.price}
                        </span>
                        <span className="text-[10px] text-gray-400 block">30 Tea Bags</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scenario 2: Active query with NO matching suggestions */}
          {cleanQuery && filteredProducts.length === 0 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-brand-darkGrey">
                  No herbal teas found for &quot;{query}&quot;
                </h4>
                <p className="text-xs text-brand-mediumGrey">
                  Try searching for Butterfly Pea, Elaichi, Ginger, Guava, Jamun, or Kashayam.
                </p>
              </div>

              {/* Recommended Teas Fallback Grid */}
              <div className="pt-4 border-t border-brand-mint/20 text-left">
                <p className="text-xs font-bold text-brand-darkGrey mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-green" /> Recommended Herbal Teas
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {initialProducts.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigateToProduct(item.slug)}
                      className="p-2.5 rounded-button bg-white border border-gray-100 hover:border-brand-green cursor-pointer flex items-center gap-3 transition-colors shadow-soft"
                    >
                      <div className="w-10 h-10 rounded-image overflow-hidden relative bg-brand-bgBeige flex-shrink-0">
                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-brand-darkGrey truncate">{item.name}</h5>
                        <span className="text-[11px] font-bold text-brand-green">₹{item.price} • 30 Bags</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scenario 3: Empty query (Default state showing popular tags & trending teas) */}
          {!cleanQuery && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-mediumGrey mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-green" /> Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => navigateToProduct(tag.slug)}
                      className="text-xs bg-white text-brand-darkGrey border border-brand-mint/40 hover:border-brand-green hover:bg-brand-bgBeige hover:text-brand-green px-3.5 py-1.5 rounded-badge transition-all duration-200 shadow-soft hover:scale-105 active:scale-95"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-mint/20">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-mediumGrey mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-green" /> Trending Teas This Week
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {initialProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => navigateToProduct(product.slug)}
                      className="p-3 rounded-button bg-white border border-gray-100 hover:border-brand-green cursor-pointer flex items-center gap-3 transition-all duration-200 hover:shadow-soft group"
                    >
                      <div className="w-12 h-12 rounded-image overflow-hidden relative bg-brand-bgBeige flex-shrink-0 border border-brand-mint/20">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-heading font-bold text-xs text-brand-darkGrey truncate group-hover:text-brand-green transition-colors">
                          {product.name}
                        </h5>
                        <p className="text-[11px] text-brand-mediumGrey truncate">{product.subtitle}</p>
                        <span className="text-[11px] font-bold text-brand-green block mt-0.5">
                          ₹{product.price} • 30 Tea Bags
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
