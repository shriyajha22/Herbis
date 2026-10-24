'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import BrewingGuideModal from '@/components/shop/BrewingGuideModal';
import { initialProducts } from '@/lib/seedData';
import { useStore } from '@/lib/storeContext';
import { Heart, ShoppingBag, Timer, ShieldCheck, Truck, RefreshCw, CheckCircle2, ChevronRight, Share2, Sparkles, Leaf, Moon, Activity, Coffee, Shield, Check, Flower2, Sparkle } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = initialProducts.find(
    (p) =>
      p.slug === slug ||
      p._id === slug ||
      (slug === 'pre-diabetic-tea' && p._id === 'prod-4') ||
      (slug === 'ayur-tea' && p._id === 'prod-5')
  );
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useStore();
  const [selectedWeight, setSelectedWeight] = useState(product?.weightVariants?.[0]?.weight || "30 Tea Bags");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'benefits' | 'brewing' | 'nutrition'>('ingredients');
  const [showBrewingGuide, setShowBrewingGuide] = useState(false);

  if (!product) {
    return notFound();
  }

  const selectedVariant = product.weightVariants?.find((v) => v.weight === selectedWeight);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const isWishlisted = isInWishlist(product._id);

  const relatedProducts = initialProducts.filter((p) => p._id !== product._id).slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="py-12 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-brand-green">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/shop" className="hover:text-brand-green">Shop</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-brand-green">{product.categoryName}</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-brand-darkGreen truncate">{product.name}</span>
        </nav>

        {/* Main Product Specs Card */}
        <div className="bg-white rounded-card border border-brand-mint/30 shadow-card p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-image overflow-hidden bg-brand-beige border border-brand-mint/20 shadow-soft">
              <Image
                src={product.images[0]}
                alt={
                  product.slug === 'authentic-ayurvedic-kashayam' || product._id === 'prod-5' || product.slug === 'ayur-tea'
                    ? "PrimeBrew Herbis Authentic Ayurvedic Kashayam made with traditional herbs, Ginger, Cinnamon, Black Pepper, Cardamom, and Coriander."
                    : product.slug === 'guava-jamun-neem-herbal-blend' || product._id === 'prod-4' || product.slug === 'pre-diabetic-tea'
                    ? "PrimeBrew Herbis Guava + Jamun + Neem Herbal Blend made with premium Guava leaves, natural Jamun, and Neem leaves."
                    : product.slug === 'blue-tea-with-ginger-cinnamon' || product._id === 'prod-3'
                    ? "PrimeBrew Herbis Blue Tea + Ginger Cinnamon made with Butterfly Pea Flowers, Ginger, and Ceylon Cinnamon."
                    : product.slug === 'blue-tea-with-elaichi' || product._id === 'prod-2'
                    ? "PrimeBrew Herbis Blue Tea + Elaichi made with Butterfly Pea Flowers and Green Cardamom."
                    : product.slug === 'blue-tea' || product._id === 'prod-1'
                    ? "PrimeBrew Herbis Blue Tea made from premium Butterfly Pea Flowers."
                    : product.name
                }
                fill
                priority
                className="object-cover"
              />
              {product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 bg-brand-gold text-brand-darkGreen font-bold text-xs px-3 py-1 rounded-badge shadow-gold">
                  {product.discountPercentage}% OFF
                </span>
              )}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-brand-darkGreen backdrop-blur-sm transition-colors shadow-soft"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Product Buy Information */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-brand-mint/30 text-brand-darkGreen text-xs font-bold px-3 py-1 rounded-badge uppercase tracking-wider">
                  {product.categoryName}
                </span>
                <span className="text-xs text-gray-500 font-medium">Origin: {product.origin}</span>
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-darkGreen leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                {product.subtitle}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-3 text-xs pt-1">
                <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-badge text-[11px]">
                  In Stock ({product.stock} units left)
                </span>
              </div>

              {/* Key Highlights: Net Quantity, Flavor & Storage */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-brand-beige/80 rounded-card border border-brand-mint/30 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Net Quantity</span>
                  <span className="font-bold text-brand-darkGreen">30 Tea Bags</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Caffeine Level</span>
                  <span className="font-bold text-brand-darkGreen">{product.caffeineLevel}</span>
                </div>
                {product.flavorProfile && (
                  <div className="col-span-2 border-t border-brand-mint/20 pt-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Flavor Profile</span>
                    <span className="text-gray-700 font-medium">{product.flavorProfile}</span>
                  </div>
                )}
                {product.storageInstructions && (
                  <div className="col-span-2 border-t border-brand-mint/20 pt-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Storage Instructions</span>
                    <span className="text-gray-700">{product.storageInstructions}</span>
                  </div>
                )}
              </div>

              {/* Price & Savings */}
              <div className="bg-brand-beige/60 p-4 rounded-card border border-brand-mint/30 flex items-baseline gap-3">
                <span className="font-heading font-extrabold text-3xl text-brand-green">
                  ₹{currentPrice}
                </span>
                {currentMrp > currentPrice && (
                  <span className="text-base text-gray-400 line-through">₹{currentMrp}</span>
                )}
                <span className="text-xs font-bold text-sky-700">
                  Save ₹{currentMrp - currentPrice} ({product.discountPercentage}%)
                </span>
              </div>

              {/* Size / Weight Variants */}
              {product.weightVariants && product.weightVariants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-darkGreen uppercase tracking-wider block">
                    Choose Packaging / Net Weight:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {product.weightVariants.map((v) => (
                      <button
                        key={v.weight}
                        onClick={() => setSelectedWeight(v.weight)}
                        className={`p-3 rounded-button border text-left text-xs transition-all ${
                          selectedWeight === v.weight
                            ? 'border-brand-green bg-brand-green text-white font-bold shadow-soft'
                            : 'border-gray-200 bg-white text-brand-charcoal hover:border-brand-green'
                        }`}
                      >
                        <div className="truncate">{v.weight}</div>
                        <div className="text-[11px] opacity-90 mt-0.5">₹{v.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-brand-darkGreen uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full btn-action-decrease flex items-center justify-center font-bold text-sm shadow-soft"
                    title="Decrease Quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-brand-darkGreen">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full btn-action-increase flex items-center justify-center font-bold text-sm shadow-soft"
                    title="Increase Quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => addToCart(product, selectedWeight, quantity)}
                  className="flex-1 btn-primary-gradient text-sm py-4 rounded-button shadow-soft flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  Add to Cart • ₹{currentPrice * quantity}
                </button>

                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`p-4 rounded-button border transition-colors ${
                    isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-500 hover:text-red-500'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => setShowBrewingGuide(true)}
                className="w-full bg-brand-beige hover:bg-brand-mint/20 text-brand-darkGreen font-bold text-xs py-3 rounded-button border border-brand-mint/40 flex items-center justify-center gap-2 transition-colors"
              >
                <Timer className="w-4 h-4 text-brand-green" />
                Launch Interactive Steep Timer & Brewing Guide
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>Express Dispatch in 24h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>100% Organically Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>7-Day Freshness Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Health Benefits & Pure Botanicals Showcase */}
        <div className="mt-12 space-y-8 bg-gradient-to-b from-brand-beige/60 to-white rounded-card p-6 sm:p-10 border border-brand-mint/40 shadow-soft relative overflow-hidden">
          {/* Subtle Botanical BG Pattern */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-mint/10 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-green bg-white px-3.5 py-1.5 rounded-badge border border-brand-mint/30 shadow-soft inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Farm to Cup Pure Wellness
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-darkGreen">
              Key Health Benefits
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light">
              Formulated with 100% natural Butterfly Pea Flowers to nourish your body, mind, and daily vitality.
            </p>
          </div>

          {/* Benefit Cards Grid (Attractive Icon Cards with Hover Animations) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
            {/* Benefit Card 1: Metabolism */}
            <div className="group relative bg-white p-5 rounded-card border border-brand-mint/30 shadow-card hover:shadow-xl hover:border-brand-green hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-sky-900/5 group-hover:text-sky-900/10 transition-all duration-300 pointer-events-none">
                <Leaf className="w-24 h-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-sky-100/80 text-sky-800 flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-brand-darkGreen group-hover:text-brand-green transition-colors">
                  🌿 Supports Metabolism & Weight Management
                </h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  Helps support a healthy metabolism when combined with a balanced diet and active lifestyle.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-bold text-sky-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Metabolic Support
              </div>
            </div>

            {/* Benefit Card 2: Relaxation & Sleep */}
            <div className="group relative bg-white p-5 rounded-card border border-brand-mint/30 shadow-card hover:shadow-xl hover:border-brand-green hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-indigo-900/5 group-hover:text-indigo-900/10 transition-all duration-300 pointer-events-none">
                <Moon className="w-24 h-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-800 flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Moon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-brand-darkGreen group-hover:text-indigo-700 transition-colors">
                  😌 Promotes Relaxation & Better Sleep
                </h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  Naturally calms the nervous system, helping reduce stress and promote restful sleep.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Restful Night Companion
              </div>
            </div>

            {/* Benefit Card 3: Blood Sugar */}
            <div className="group relative bg-white p-5 rounded-card border border-brand-mint/30 shadow-card hover:shadow-xl hover:border-brand-green hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-rose-900/5 group-hover:text-rose-900/10 transition-all duration-300 pointer-events-none">
                <Activity className="w-24 h-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-800 flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-brand-darkGreen group-hover:text-rose-700 transition-colors">
                  🩸 Supports Healthy Blood Sugar Levels
                </h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  May help stabilize blood sugar levels after meals as part of a healthy lifestyle.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-bold text-rose-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Post-Meal Glucose Care
              </div>
            </div>

            {/* Benefit Card 4: Antioxidants */}
            <div className="group relative bg-white p-5 rounded-card border border-brand-mint/30 shadow-card hover:shadow-xl hover:border-brand-green hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-amber-900/5 group-hover:text-amber-900/10 transition-all duration-300 pointer-events-none">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-darkGreen transition-all duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-brand-darkGreen group-hover:text-amber-800 transition-colors">
                  🛡️ Rich in Natural Antioxidants
                </h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  Contains powerful antioxidants that help fight free radicals and reduce oxidative stress.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-bold text-amber-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Cellular Shield
              </div>
            </div>

            {/* Benefit Card 5: Caffeine-Free */}
            <div className="group relative bg-white p-5 rounded-card border border-brand-mint/30 shadow-card hover:shadow-xl hover:border-brand-green hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute -right-4 -bottom-4 text-teal-900/5 group-hover:text-teal-900/10 transition-all duration-300 pointer-events-none">
                <Coffee className="w-24 h-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-brand-darkGreen group-hover:text-teal-700 transition-colors">
                  ☕ 100% Caffeine-Free
                </h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  A naturally caffeine-free herbal tea that can be enjoyed any time of the day.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-1 text-[11px] font-bold text-teal-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Any Time Wellness Sip
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mt-8 pt-8 border-t border-brand-mint/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Ingredients */}
            <div className="bg-white p-5 rounded-card border border-brand-mint/30 shadow-soft space-y-2 hover:border-brand-green transition-colors">
              <div className="flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-brand-green" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-darkGreen">
                  Ingredients
                </h3>
              </div>
              <p className="font-bold text-sm text-brand-darkGreen">
                100% Premium Butterfly Pea Flowers
              </p>
            </div>

            {/* Taste Profile */}
            <div className="bg-white p-5 rounded-card border border-brand-mint/30 shadow-soft space-y-2 hover:border-brand-green transition-colors">
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-brand-gold" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-darkGreen">
                  Taste Profile
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Mild', 'Floral', 'Earthy'].map((taste) => (
                  <span
                    key={taste}
                    className="bg-brand-beige border border-brand-mint/40 text-brand-darkGreen font-bold text-xs px-3 py-1 rounded-badge shadow-soft"
                  >
                    {taste}
                  </span>
                ))}
              </div>
            </div>

            {/* Perfect For */}
            <div className="bg-white p-5 rounded-card border border-brand-mint/30 shadow-soft space-y-2 hover:border-brand-green transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-darkGreen">
                  Perfect For
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-sky-900 pt-1">
                {['Daily Wellness', 'Evening Relaxation', 'Healthy Lifestyle', 'Natural Herbal Tea Lovers'].map((item) => (
                  <span key={item} className="bg-sky-50 text-sky-900 border border-sky-200 px-2 py-0.5 rounded-badge">
                    • {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Why Choose PrimeBrew Herbis Blue Tea? */}
            <div className="bg-white p-5 rounded-card border border-brand-mint/30 shadow-soft space-y-2 hover:border-brand-green transition-colors">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-green" />
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-darkGreen">
                  Why Choose PrimeBrew Herbis?
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px] font-semibold text-sky-900 pt-1">
                {[
                  'Farm-to-Cup Quality',
                  'Premium Handpicked Herbs',
                  'No Artificial Colours',
                  'No Artificial Flavours',
                  'No Preservatives',
                  'Vegan',
                  'Gluten-Free',
                ].map((reason) => (
                  <span key={reason} className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-brand-green flex-shrink-0" /> {reason}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs Section */}
        <div className="mt-12 bg-white rounded-card border border-brand-mint/30 shadow-card overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-brand-beige overflow-x-auto text-xs font-bold text-gray-600">
            {[
              { key: 'ingredients', label: '🌿 Ingredients & Botanicals' },
              { key: 'benefits', label: '✨ Health Benefits' },
              { key: 'brewing', label: '☕ Brewing Ritual' },
              { key: 'nutrition', label: '📊 Nutrition Facts' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 flex-shrink-0 transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-brand-darkGreen border-t-2 border-brand-green shadow-soft'
                    : 'hover:text-brand-green'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-brand-darkGreen">Hand-Selected Organic Ingredients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.ingredients.map((ing, i) => (
                    <div key={i} className="p-4 rounded-card bg-brand-beige border border-brand-mint/30 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xs text-brand-darkGreen">
                          {ing.name} {ing.percentage && <span className="text-brand-green">({ing.percentage})</span>}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 font-light">{ing.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-brand-darkGreen">Targeted Health Advantages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="group p-4 rounded-card border border-brand-mint/30 bg-sky-50/50 hover:bg-white hover:shadow-soft hover:border-brand-green transition-all flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-brand-darkGreen leading-snug">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'brewing' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-brand-darkGreen">The Perfect Steep Instructions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-brand-beige p-4 rounded-card text-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Ideal Temperature</span>
                    <span className="font-bold text-base text-brand-darkGreen">{product.brewingGuide.temp}</span>
                  </div>
                  <div className="bg-brand-beige p-4 rounded-card text-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Steeping Time</span>
                    <span className="font-bold text-base text-brand-darkGreen">{product.brewingGuide.steepTime}</span>
                  </div>
                  <div className="bg-brand-beige p-4 rounded-card text-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Water Ratio</span>
                    <span className="font-bold text-base text-brand-darkGreen">{product.brewingGuide.waterAmount}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 bg-white p-4 rounded-card border border-brand-mint/30">
                  <strong>Serving Suggestion:</strong> {product.brewingGuide.servingSuggestion}
                </p>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="space-y-4 max-w-md">
                <h3 className="font-heading font-bold text-lg text-brand-darkGreen">Nutritional Information (Per Cup)</h3>
                <table className="w-full text-xs text-left border border-gray-200 rounded-card overflow-hidden">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-brand-beige">
                      <td className="p-3 font-semibold text-brand-darkGreen">Calories</td>
                      <td className="p-3 text-gray-700">{product.nutritionInfo.calories}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-brand-darkGreen">Carbohydrates</td>
                      <td className="p-3 text-gray-700">{product.nutritionInfo.carbs}</td>
                    </tr>
                    <tr className="bg-brand-beige">
                      <td className="p-3 font-semibold text-brand-darkGreen">Protein</td>
                      <td className="p-3 text-gray-700">{product.nutritionInfo.protein}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-brand-darkGreen">Total Fat</td>
                      <td className="p-3 text-gray-700">{product.nutritionInfo.fat}</td>
                    </tr>
                    <tr className="bg-brand-beige">
                      <td className="p-3 font-semibold text-brand-darkGreen">Active Antioxidants</td>
                      <td className="p-3 text-sky-700 font-bold">{product.nutritionInfo.antioxidants}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Recommendations */}
        <div className="mt-16 space-y-6">
          <h2 className="font-heading font-bold text-2xl text-brand-darkGreen">You May Also Enjoy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {showBrewingGuide && (
        <BrewingGuideModal product={product} onClose={() => setShowBrewingGuide(false)} />
      )}
    </div>
  );
}
