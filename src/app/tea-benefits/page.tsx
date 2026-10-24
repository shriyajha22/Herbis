'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Moon, ShieldCheck, Sun, Activity, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TeaBenefitsPage() {
  const guideCategories = [
    {
      title: "Detoxification & Liver Health",
      icon: Sparkles,
      color: "text-sky-700 bg-sky-50 border-sky-200",
      desc: "Herbal detox blends utilize wild dandelion root, lemongrass, and milk thistle. Dandelion contains taraxacin which stimulates bile production in the liver, while green tea polyphenols flush cellular waste.",
      recommendedSlug: "detox-tea",
    },
    {
      title: "Sleep Optimization & Nervous System Relief",
      icon: Moon,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      desc: "Egyptian chamomile flowers contain apigenin—an antioxidant that binds to specific GABA receptors in the brain to reduce insomnia and promote natural REM sleep cycles without morning grogginess.",
      recommendedSlug: "sleep-tea",
    },
    {
      title: "Immune Shield & Anti-Inflammatory Synergy",
      icon: ShieldCheck,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      desc: "Tellicherry cardamom paired with true Ceylon cinnamon bark and ginger root offers potent natural anti-inflammatory defense and cellular immunity.",
      recommendedSlug: "immunity-tea",
    },
    {
      title: "Cortisol Reduction & Stress Adaptogens",
      icon: Sun,
      color: "text-rose-700 bg-rose-50 border-rose-200",
      desc: "Natural Butterfly Pea Flowers and green cardamom regulate body tension, mitigating daily stress while sharpening mental clarity.",
      recommendedSlug: "stress-relief-tea",
    },
    {
      title: "Metabolic Support & Fat Oxidation",
      icon: Activity,
      color: "text-teal-700 bg-teal-50 border-teal-200",
      desc: "Formosa Ti Kuan Yin Oolong tea paired with Garcinia Cambogia stimulates fat oxidation and helps moderate post-meal blood sugar levels naturally.",
      recommendedSlug: "weight-loss-tea",
    },
    {
      title: "Hormonal Balance & Radiant Skin",
      icon: Heart,
      color: "text-purple-700 bg-purple-50 border-purple-200",
      desc: "Shatavari root and wild red raspberry leaf nourish female endocrine health, easing monthly cramps while rose buds deliver natural vitamin C for glowing skin.",
      recommendedSlug: "womens-wellness-tea",
    },
  ];

  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge">
            Botanical Science & Wellness
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-brand-darkGreen">
            The Science Behind Herbal Teas
          </h1>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Discover how centuries of Ayurvedic wisdom meet modern botanical science to restore balance, energy, and vitality in every cup.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guideCategories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`p-8 rounded-card border ${item.color} shadow-card space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-button bg-white flex items-center justify-center shadow-soft">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-heading font-bold text-lg text-brand-darkGreen">{item.title}</h2>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-light">{item.desc}</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:text-brand-darkGreen hover:underline pt-2 group/btn"
                >
                  <span>Explore {item.title.split(' ')[0]} Teas</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
