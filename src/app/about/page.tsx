'use client';

import React from 'react';
import FarmToCupStory from '@/components/home/FarmToCupStory';
import { ShieldCheck, Heart, Award, CheckCircle2, Sparkles, Sprout } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 bg-brand-cream min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* About Us Hero Section */}
        <div className="bg-white p-8 sm:p-12 rounded-card border border-brand-mint/30 shadow-card mb-16 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge">
              Women-Founded Herbal Wellness
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-brand-darkGreen leading-tight">
              At Prime Brew Herbis, every cup begins at farms.
            </h1>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 font-light leading-relaxed max-w-4xl">
            <p>
              We are a women-founded herbal wellness brand dedicated to bringing pure, natural, and thoughtfully crafted herbal teas directly from farms to your cup. By sourcing directly from our own farms, we ensure freshness, quality, and authenticity in every blend.
            </p>
            <p>
              Rooted in nature and inspired by traditional wellness, our teas are made from carefully selected herbs and flowers to support a healthier lifestyle—without artificial flavors, colors, or additives.
            </p>
          </div>

          {/* Key Taglines Highlight Box */}
          <div className="pt-4 border-t border-brand-mint/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-bold text-brand-darkGreen">
            <div className="flex items-center gap-2 text-brand-green">
              <Sparkles className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>Pure Ingredients. Honest Farming. Wellness in Every Sip.</span>
            </div>
            <div className="bg-brand-beige px-4 py-2 rounded-button text-brand-darkGreen border border-brand-mint/40 w-fit">
              Prime Brew Herbis – From Farms to Your Cup.
            </div>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-card border border-brand-mint/30 shadow-card space-y-3">
            <div className="w-12 h-12 bg-brand-mint/30 text-brand-green rounded-button flex items-center justify-center font-bold">
              <Sprout className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Our Mission</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              To make natural wellness a part of everyday life by delivering pure, farm-grown herbal teas that are fresh, authentic, and crafted with care.
            </p>
          </div>

          <div className="bg-white p-8 rounded-card border border-brand-mint/30 shadow-card space-y-3">
            <div className="w-12 h-12 bg-brand-gold/20 text-brand-darkGreen rounded-button flex items-center justify-center font-bold">
              <Award className="w-6 h-6 text-brand-gold" />
            </div>
            <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Our Vision</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              To create a world where natural wellness is part of everyday life, connecting people with the purity of nature through authentic, farm-grown herbal products.
            </p>
          </div>
        </div>

        {/* Story Component */}
        <FarmToCupStory />

        {/* Certifications */}
        <div className="bg-brand-darkGreen text-white p-10 rounded-card shadow-premium space-y-6 text-center mt-16">
          <h2 className="font-heading font-bold text-2xl text-white">Our Quality & Sustainability Promise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-brand-beige">
            <div className="p-4 bg-white/10 rounded-card border border-white/10">
              <ShieldCheck className="w-8 h-8 text-brand-gold mx-auto mb-2" />
              <h4 className="font-bold text-white">100% Farm Fresh</h4>
            </div>
            <div className="p-4 bg-white/10 rounded-card border border-white/10">
              <Heart className="w-8 h-8 text-brand-gold mx-auto mb-2" />
              <h4 className="font-bold text-white">Women-Founded</h4>
            </div>
            <div className="p-4 bg-white/10 rounded-card border border-white/10">
              <CheckCircle2 className="w-8 h-8 text-brand-gold mx-auto mb-2" />
              <h4 className="font-bold text-white">Zero Artificial Additives</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
