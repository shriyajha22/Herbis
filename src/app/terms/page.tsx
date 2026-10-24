'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 bg-white p-10 rounded-card border border-brand-mint/30 shadow-card text-xs leading-relaxed text-gray-700">
        <h1 className="font-heading font-extrabold text-3xl text-brand-darkGreen">Terms & Conditions</h1>
        <p className="text-gray-400">Last updated: August 4, 2026</p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">1. Acceptance of Terms</h2>
        <p>
          By accessing and purchasing products on PrimeBrew Herbis (primebrewherbis.com), you agree to be bound by these terms, conditions, and applicable Indian laws.
        </p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">2. Product Disclaimer</h2>
        <p>
          Our herbal teas support natural wellness. However, descriptions are educational and not intended to diagnose, treat, or cure medical conditions. Consult your doctor if pregnant or taking medication.
        </p>
      </div>
    </div>
  );
}
