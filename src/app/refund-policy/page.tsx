'use client';

import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 bg-white p-10 rounded-card border border-brand-mint/30 shadow-card text-xs leading-relaxed text-gray-700">
        <h1 className="font-heading font-extrabold text-3xl text-brand-darkGreen">Refund & Cancellation Policy</h1>
        <p className="text-gray-400">Last updated: August 4, 2026</p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">1. 7-Day Freshness Return Guarantee</h2>
        <p>
          If your tea canister arrives damaged or vacuum seal is tampered with, notify us within 7 days of delivery for a 100% free replacement or full refund.
        </p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">2. Refund Processing Timeline</h2>
        <p>
          Approved refunds are credited to original payment source (UPI, Card, Bank) within 3-5 business days.
        </p>
      </div>
    </div>
  );
}
