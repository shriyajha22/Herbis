'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/lib/types';
import { Filter, SlidersHorizontal, Search, RotateCcw, Scale } from 'lucide-react';
import CompareModal from '@/components/shop/CompareModal';

const validHealthBenefits = ['Antioxidant', 'Digestion', 'Immunity', 'Blood Sugar', 'Stress'];

interface ShopPageClientProps {
  initialProducts: Product[];
  categories: Category[];
}

function ShopContent({ initialProducts, categories }: ShopPageClientProps) {
  const searchParams = useSearchParams();

  const validCategorySlugs = categories.map((c) => c.slug);

  const getValidCategory = (param: string | null) => {
    if (!param) return '';
    return validCategorySlugs.includes(param) ? param : '';
  };

  const getValidBenefit = (param: string | null) => {
    if (!param) return '';
    const match = validHealthBenefits.find((b) => b.toLowerCase() === param.toLowerCase());
    return match || '';
  };

  const initialCategoryQuery = getValidCategory(searchParams.get('category'));
  const initialBenefitQuery = getValidBenefit(searchParams.get('benefit'));
  const initialSearchQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryQuery);
  const [selectedBenefit, setSelectedBenefit] = useState(initialBenefitQuery);
  const [maxPrice, setMaxPrice] = useState(600);
  const [sortOption, setSortOption] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>(['prod-1', 'prod-2', 'prod-4']);

  useEffect(() => {
    const cat = getValidCategory(searchParams.get('category'));
    const ben = getValidBenefit(searchParams.get('benefit'));
    const q = searchParams.get('q') || '';

    setSelectedCategory(cat);
    setSelectedBenefit(ben);
    setSearch(q);
  }, [searchParams]);

  // Dynamic filtering logic
  let filteredProducts: Product[] = initialProducts.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = (p.categoryName || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchIng = p.ingredients?.some((ing) => ing.name.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchDesc && !matchIng) return false;
    }

    if (selectedCategory && p.category !== selectedCategory) return false;
    if (
      selectedBenefit &&
      !p.benefits?.some((b) => b.toLowerCase().includes(selectedBenefit.toLowerCase()))
    )
      return false;
    if (p.price > maxPrice) return false;

    return true;
  });

  // Sorting
  if (sortOption === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'newest') {
    filteredProducts.sort((a, b) => (b.isNewArrival ? 1 : -1));
  } else {
    filteredProducts.sort((a, b) => (b.isBestSeller ? 1 : -1));
  }

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBenefit('');
    setMaxPrice(600);
    setSortOption('featured');
  };

  return (
    <div className="py-12 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-brand-darkGreen text-white p-8 rounded-card mb-8 shadow-premium relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-white/10 px-3 py-1 rounded-badge">
              Artisanal Loose Leaf & Botanicals
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
              Herbal Tea Collection
            </h1>
            <p className="text-xs sm:text-sm text-brand-beige/90 font-light">
              Explore 100% pure botanical wellness teas harvested ethically from family-owned organic farms across India.
            </p>
          </div>
        </div>

        {/* Action Controls & Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 bg-white px-4 py-2.5 rounded-button border border-brand-mint text-xs font-bold text-brand-darkGreen shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-green" />
              <span>Filters</span>
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-brand-darkGreen">{filteredProducts.length}</strong> herbal teas
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs bg-white border border-brand-mint/40 rounded-button px-3.5 py-2 font-medium text-brand-darkGreen outline-none shadow-sm"
            >
              <option value="featured">Featured / Best Sellers</option>
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowCompareModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-button bg-brand-beige text-brand-darkGreen font-bold text-xs border border-brand-mint/40 hover:bg-brand-mint/30 transition-colors shadow-sm"
            >
              <Scale className="w-4 h-4 text-brand-green" />
              <span>Compare ({compareProductIds.length})</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:block bg-white p-6 rounded-card border border-brand-mint/30 shadow-card space-y-6 h-fit ${
              mobileFilterOpen ? 'block' : 'hidden'
            }`}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-bold text-sm text-brand-darkGreen flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-green" />
                <span>Filter Teas</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-gray-400 hover:text-brand-green flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-darkGreen">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Blue Tea, Jamun, Detox..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-input bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:border-brand-green outline-none"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-darkGreen">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === ''
                      ? 'bg-brand-cream text-brand-darkGreen font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-brand-cream text-brand-darkGreen font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Benefits */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-darkGreen">Health Benefit</h4>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {validHealthBenefits.map((ben) => (
                  <button
                    key={ben}
                    onClick={() => setSelectedBenefit(selectedBenefit === ben ? '' : ben)}
                    className={`px-2.5 py-1 rounded-badge border transition-colors ${
                      selectedBenefit === ben
                        ? 'bg-brand-darkGreen text-brand-gold border-brand-gold font-bold'
                        : 'border-gray-200 text-gray-600 hover:border-brand-green'
                    }`}
                  >
                    {ben}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold uppercase tracking-wider text-brand-darkGreen">Max Price</h4>
                <span className="font-bold text-brand-green">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-green cursor-pointer"
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-card p-12 text-center border border-brand-mint/30 shadow-card space-y-4">
                <div className="w-16 h-16 bg-brand-beige rounded-full flex items-center justify-center mx-auto text-brand-green">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-lg text-brand-darkGreen">No teas match your criteria</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search query, price filter, or category selection to find what you are looking for.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-brand-green text-white text-xs font-bold px-6 py-2.5 rounded-button shadow-soft"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        selectedProductIds={compareProductIds}
        onRemoveProduct={(id) => setCompareProductIds(compareProductIds.filter((p) => p !== id))}
      />
    </div>
  );
}

export function ShopPageClient(props: ShopPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-brand-darkGreen font-bold">
          Loading Herbal Tea Catalog...
        </div>
      }
    >
      <ShopContent {...props} />
    </Suspense>
  );
}
