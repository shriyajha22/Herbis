'use client';

import React from 'react';
import Image from 'next/image';
import { Mountain, Sun, Sparkles, Box, HeartHandshake } from 'lucide-react';

const steps = [
  {
    icon: Mountain,
    step: "01",
    title: "Direct Own Farm Cultivation",
    desc: "Our herbs and flowers are grown and harvested directly on our own farms in Karnataka. Ideal growing conditions and sustainable farming practices ensure exceptional quality in every blend.",
    img: "/images/blue-tea.jpg"
  },
  {
    icon: Sun,
    step: "02",
    title: "Selective Dawn Harvesting",
    desc: "Experienced local farmers hand-pick whole leaves, flower buds, and roots at morning dew when volatile aromatic essential oils are at their highest concentration.",
    img: "/images/blue-tea-elaichi.jpg"
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Gentle Solar & Shadow Drying",
    desc: "Herbs are slowly air-dried under natural shade to preserve delicate antioxidants, natural flavonoids, and pristine green leaf colors.",
    img: "/images/blue-tea-ginger-cinnamon.jpg"
  },
  {
    icon: HeartHandshake,
    step: "04",
    title: "Ayurvedic Master Blending",
    desc: "Formulated by certified Ayurvedic herbalists to ensure precise synergistic ratios for maximum absorption and biological harmony.",
    img: "/images/guava-jamun-neem.jpg"
  },
  {
    icon: Box,
    step: "05",
    title: "Airtight Eco Packaging",
    desc: "Sealed in 100% recyclable tin canisters and bio-pyramid tea bags to protect freshness directly from our farm warehouse to your teacup.",
    img: "/images/ayurvedic-kashayam.jpg"
  }
];

export default function FarmToCupStory() {
  return (
    <section className="py-20 bg-brand-bgSoft relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge">
            Transparency & Origin
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-brand-darkGreen">
            Our Farm to Cup Journey
          </h2>
        </div>

        {/* Timeline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-brand-cardWhite rounded-card p-5 border border-brand-mint/30 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video rounded-image overflow-hidden mb-4 bg-brand-beige">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-brand-darkGreen text-brand-gold font-bold text-xs px-2.5 py-1 rounded-badge shadow-soft">
                      {item.step}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-button bg-brand-mint/30 text-brand-green flex items-center justify-center mb-3 group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-heading font-bold text-sm text-brand-darkGreen mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
