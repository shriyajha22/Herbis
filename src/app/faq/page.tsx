'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Sparkles, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'ordering' | 'sourcing' | 'brewing' | 'returns';
}

const faqData: FAQItem[] = [
  {
    question: 'How are PrimeBrew Herbis teas sourced?',
    answer: 'All our herbal teas are cultivated and harvested directly on our own farms in Karnataka. We source directly from our own farms to eliminate middlemen and deliver the freshest harvest from our farm to your cup.',
    category: 'sourcing',
  },
  {
    question: 'Are all your tea blends caffeine-free?',
    answer: 'Yes! Our signature Blue Tea blends (Butterfly Pea Flower), Guava + Jamun + Neem Herbal Blend, and Authentic Ayurvedic Kashayam are 100% naturally caffeine-free, making them ideal for any time of the day or evening.',
    category: 'sourcing',
  },
  {
    question: 'How long does shipping take across India?',
    answer: 'We process and dispatch all orders within 24 hours. Metro deliveries typically arrive in 2–3 business days, while non-metro locations take 3–5 business days via Shiprocket Express Shipping.',
    category: 'ordering',
  },
  {
    question: 'Is shipping free for my order?',
    answer: 'We offer Free Express Shipping on all orders above ₹799 across India. Orders below ₹799 incur a flat nominal shipping fee of ₹70.',
    category: 'ordering',
  },
  {
    question: 'How should I store my herbal teas for maximum freshness?',
    answer: 'Keep your tea sealed in an airtight tin canister or eco pouch in a cool, dry place away from direct sunlight, moisture, and strong spices. Properly stored herbs retain full aroma and potency for up to 18 months.',
    category: 'brewing',
  },
  {
    question: 'What is the ideal water temperature for brewing Blue Tea?',
    answer: 'We recommend steeping 1 tea bag (or 1.5g loose tea) in 200ml of hot water at 85°C–90°C for 4 to 6 minutes. Squeeze fresh lemon juice into your brewed Blue Tea to watch it magically transform from deep indigo to vibrant purple!',
    category: 'brewing',
  },
  {
    question: 'What is your return and refund policy?',
    answer: 'We offer a hassle-free 7-day return policy for unopened and damaged packages. If you receive a damaged or incorrect shipment, contact us with your order ID within 48 hours for an instant replacement or full refund.',
    category: 'returns',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = activeCategory === 'all'
    ? faqData
    : faqData.filter((item) => item.category === activeCategory);

  return (
    <div className="py-16 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-brand-green" /> Got Questions? We Have Answers
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-brand-darkGreen">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-600 font-light max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our organic harvesting, shipping timelines, brewing guides, and return policies.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'ordering', label: 'Ordering & Shipping' },
            { id: 'sourcing', label: 'Sourcing & Organic Quality' },
            { id: 'brewing', label: 'Brewing & Storage' },
            { id: 'returns', label: 'Returns & Refund' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs font-bold px-4 py-2.5 rounded-button transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-green text-white shadow-soft scale-105'
                  : 'bg-white text-brand-darkGreen hover:bg-brand-beige border border-brand-mint/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-card border border-brand-mint/30 shadow-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-brand-darkGreen hover:text-brand-green transition-colors"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-brand-beige flex items-center justify-center text-brand-darkGreen shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-brand-green text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-gray-600 font-light leading-relaxed border-t border-gray-100 mt-1 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Banner */}
        <div className="bg-brand-darkGreen text-white rounded-card p-8 shadow-premium text-center space-y-4">
          <h3 className="font-heading font-bold text-xl text-white">Still have questions?</h3>
          <p className="text-xs text-brand-mint/90 max-w-md mx-auto">
            Our wellness support team is available Monday to Saturday (9 AM – 7 PM IST) to assist you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/contact"
              className="bg-brand-gold text-brand-darkGreen font-bold text-xs px-6 py-3 rounded-button shadow-gold hover:bg-white transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Contact Customer Support
            </Link>
            <a
              href="mailto:Contact.primebrew@gmail.com"
              className="bg-white/10 text-white font-bold text-xs px-6 py-3 rounded-button border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-brand-gold" /> Email Care Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
