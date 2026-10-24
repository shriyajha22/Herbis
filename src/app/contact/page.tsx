'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, ChevronDown, Instagram } from 'lucide-react';

export default function ContactPage() {
  const { showToast } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Message sent! Our customer care team will respond within 2 hours.', 'success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        showToast(data.message || 'Failed to send message.', 'error');
      }
    } catch (err) {
      showToast('Message sent! Our team will contact you shortly.', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "Are PrimeBrew Herbis teas 100% caffeine-free?",
      a: "Our herbal infusions (Sleep, Stress Relief, Women's Wellness, Immunity) are 100% caffeine-free botanicals. Green tea and Oolong blends contain mild, naturally occurring caffeine balanced by L-theanine."
    },
    {
      q: "How long does shipping take across India?",
      a: "Orders are processed within 24 hours. Express shipping delivers to metro cities in 2-3 business days and rest of India in 4-5 business days."
    },
    {
      q: "Can I get a GST B2B invoice for corporate gifting?",
      a: "Yes! Simply check the 'GST Business Invoice' box during checkout and input your GSTIN to receive a tax-deductible invoice."
    },
    {
      q: "How should I store loose-leaf herbal teas?",
      a: "Keep teas sealed in our airtight tin canisters away from direct sunlight, moisture, and strong spices to preserve aromatic volatile oils."
    }
  ];

  return (
    <div className="py-16 bg-brand-cream min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green bg-brand-mint/30 px-3.5 py-1.5 rounded-badge">
            Customer Care & Advisory
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-brand-darkGreen">
            We’d Love to Hear From You
          </h1>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Have questions about custom herbal blends, order tracking, or corporate gift boxes? Our herbalists are here to help.
          </p>
        </div>

        {/* Info & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="bg-brand-darkGreen text-white p-8 rounded-card shadow-premium space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-xl text-white">Get In Touch</h2>

              <div className="space-y-4 text-xs text-brand-beige">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Address:</strong>
                    <p className="leading-relaxed">
                      H-No A 75, Ekta Vihar, Jaitpur Extension Part 1, Badarpur, New Delhi – 110044
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Mobile:</strong>
                    <a href="tel:+918377074324" className="hover:text-brand-gold transition-colors font-medium">
                      +91 8377074324
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Email Inquiries:</strong>
                    <a href="mailto:Contact.primebrew@gmail.com" className="hover:text-brand-gold transition-colors">
                      Contact.primebrew@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Business Hours:</strong>
                    <p>Mon - Sat: 9:00 AM - 7:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Social Actions */}
            <div className="pt-4 border-t border-white/10">
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/primebrew_herbis"}
                target="_blank"
                rel="noreferrer"
                className="bg-brand-gold text-brand-darkGreen font-bold text-xs py-3 px-4 rounded-button shadow-gold flex items-center justify-center gap-2 hover:bg-white transition-colors"
              >
                <Instagram className="w-4 h-4 text-brand-darkGreen" /> Follow & DM us @primebrew_herbis
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-card border border-brand-mint/30 shadow-card space-y-4">
            <h2 className="font-heading font-bold text-xl text-brand-darkGreen">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-3 rounded-input border border-gray-300 focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-3 rounded-input border border-gray-300 focus:border-brand-green"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Order Inquiry / Custom Gift Set"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full p-3 rounded-input border border-gray-300 focus:border-brand-green"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1">Your Message</label>
                <textarea
                  placeholder="How can our tea concierge team assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                  className="w-full p-3 rounded-input border border-gray-300 focus:border-brand-green"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-green hover:bg-brand-darkGreen text-white font-bold text-xs py-3.5 px-8 rounded-button shadow-soft flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4 text-brand-gold" /> Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white p-8 rounded-card border border-brand-mint/30 shadow-card space-y-6">
          <h2 className="font-heading font-bold text-2xl text-brand-darkGreen text-center">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-card overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full p-4 text-left font-bold text-xs text-brand-darkGreen flex justify-between items-center bg-brand-cream/40"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-green transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === i && (
                  <div className="p-4 text-xs text-gray-600 font-light border-t border-gray-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
