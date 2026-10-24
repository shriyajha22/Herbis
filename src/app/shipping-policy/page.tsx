'use client';

import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 bg-white p-10 rounded-card border border-brand-mint/30 shadow-card text-xs leading-relaxed text-gray-700">
        <h1 className="font-heading font-extrabold text-3xl text-brand-darkGreen">Shipping Policy</h1>
        <p className="text-gray-400">Last updated: August 4, 2026</p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">1. Pan-India Express Delivery</h2>
        <p>
          We partner with Shiprocket Express to deliver tea packages safely across India. All orders above ₹799 qualify for FREE express shipping. Orders below ₹799 carry a flat ₹70 shipping charge.
        </p>

        <h2 className="font-heading font-bold text-base text-brand-darkGreen pt-2">2. Dispatch & Tracking</h2>
        <p>
          Small-batch orders are packed and dispatched within 24 hours of placement. Live tracking numbers are sent via SMS and Email upon shipment.
        </p>
      </div>
    </div>
  );
}
