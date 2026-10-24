'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 bg-white p-10 rounded-card border border-brand-mint/30 shadow-card text-xs leading-relaxed text-gray-700">
        <h1 className="font-heading font-extrabold text-3xl text-brand-darkGreen">Privacy Policy</h1>
        <p className="text-gray-400">Last updated: August 4, 2026</p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">1. Data Collection</h2>
        <p>
          At PrimeBrew Herbis, we respect your privacy. We collect personal information such as name, email address, and delivery address when you place an order or subscribe to our newsletter.
        </p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">2. Payment Security</h2>
        <p>
          Payment transactions processed via Razorpay and Stripe use 256-bit bank-grade SSL encryption. PrimeBrew Herbis does not store full credit card or UPI security credentials on its servers.
        </p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">3. Cookies & Tracking</h2>
        <p>
          We use functional cookies to remember your shopping cart items, saved wishlist, and regional preference settings for an optimal shopping experience.
        </p>
      </div>
    </div>
  );
}
