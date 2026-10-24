'use client';

import React from 'react';
import Link from 'next/link';
import { Moon, Sparkles, ShieldCheck, Sun, Activity, Heart, ArrowUpRight } from 'lucide-react';

const benefits = [
  {
    icon: Moon,
    title: "Restorative Sleep & REM Support",
    desc: "Natural whole flowers like Chamomile and Lavender relax the nervous system and decrease time to fall asleep.",
    slug: "sleep-tea",
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    iconColor: "text-indigo-600",
  },
  {
    icon: Sparkles,
    title: "Gentle Liver & Digestive Cleansing",
    desc: "Dandelion root and lemongrass assist natural hepatic detoxification and relieve post-meal abdominal bloating.",
    slug: "detox-tea",
    color: "bg-sky-50 border-sky-200 text-sky-800",
    iconColor: "text-sky-600",
  },
  {
    icon: ShieldCheck,
    title: "Cellular Immune Fortification",
    desc: "Tellicherry cardamom and true Ceylon cinnamon bark support daily immune defense and fight inflammation.",
    slug: "immunity-tea",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    iconColor: "text-amber-600",
  },
  {
    icon: Sun,
    title: "Cortisol Reduction & Anxiety Ease",
    desc: "Natural Butterfly Pea Flowers and green cardamom soothe body stress responses while maintaining calm focus.",
    slug: "stress-relief-tea",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    iconColor: "text-rose-600",
  },
  {
    icon: Activity,
    title: "Metabolic Rate & Fat Oxidation",
    desc: "High-altitude Oolong and Garcinia Cambogia enhance daily calorie burn without caffeinated jitters.",
    slug: "weight-loss-tea",
    color: "bg-teal-50 border-teal-200 text-teal-800",
    iconColor: "text-teal-600",
  },
  {
    icon: Heart,
    title: "Female Hormonal Equilibrium",
    desc: "Rejuvenating Shatavari and red raspberry leaf offer monthly cycle comfort and skin luminosity.",
    slug: "womens-wellness-tea",
    color: "bg-purple-50 border-purple-200 text-purple-800",
    iconColor: "text-purple-600",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-brand-bgBeige relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge">
              Targeted Herbal Wellness
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-brand-darkGreen">
              Why Drink Herbal Teas?
            </h2>
            <p className="text-sm text-brand-mediumGrey leading-relaxed font-light">
              Unlike caffeinated beverages that cause energy crashes, pure plant botanicals deliver bio-available vitamins, antioxidants, and adaptogenic support for sustained long-term health.
            </p>
          </div>
          <Link
            href="/tea-benefits"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-green hover:text-brand-darkGreen transition-colors uppercase tracking-wider bg-brand-cardWhite px-5 py-3 rounded-button border border-brand-mint/40 shadow-soft"
          >
            <span>Explore Science & Benefits Guide</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Link
                key={i}
                href="/shop"
                className={`p-6 rounded-card border ${b.color} shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
              >
                <div>
                  <div className="w-12 h-12 rounded-button bg-white flex items-center justify-center mb-4 shadow-soft">
                    <Icon className={`w-6 h-6 ${b.iconColor}`} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-brand-darkGreen mb-2 group-hover:text-brand-green transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-light mb-4">
                    {b.desc}
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-brand-green gap-1 group-hover:gap-2 transition-all">
                  <span>Shop Teas for {b.title.split(' ')[0]}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
