'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Mail, ShieldCheck, Truck, RefreshCw, Award, Instagram, Facebook, Twitter, Phone, MapPin, CheckCircle, BadgeCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/storeContext';

export default function Footer() {
  const pathname = usePathname();
  const { currentUser, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isWindowAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminUser = currentUser?.role === 'admin';

  if (isAdminPath || isWindowAdmin || isAdminUser) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast('Subscribed! Check your inbox for your 15% discount voucher.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-brand-darkGreen text-brand-beige pt-16 pb-12 border-t border-brand-green/30">
      {/* Brand Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center p-4 rounded-card bg-white/5 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-semibold text-white text-sm">
              100% Organic & Pure
            </h4>
            <p className="text-xs text-brand-mint/80 mt-1">
              Direct farm harvest without synthetic pesticides
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-card bg-white/5 backdrop-blur-sm border border-white/10">
            <BadgeCheck className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-semibold text-white text-sm">
              FSSAI Licensed
            </h4>
            <p className="text-xs text-brand-mint/80 mt-1">
              Licensed food business
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-card bg-white/5 backdrop-blur-sm border border-white/10">
            <RefreshCw className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-semibold text-white text-sm">
              Fresh Batch Guarantee
            </h4>
            <p className="text-xs text-brand-mint/80 mt-1">
              Small batch roasted & packed under 7 days
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-card bg-white/5 backdrop-blur-sm border border-white/10">
            <Truck className="w-8 h-8 text-brand-gold mb-2" />
            <h4 className="font-heading font-semibold text-white text-sm">
              Express Pan-India Shipping
            </h4>
            <p className="text-xs text-brand-mint/80 mt-1">
              Free express delivery on orders above ₹799
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Official Logo with Tagline */}
            <div className="inline-block bg-white p-3.5 rounded-card shadow-soft max-w-[240px]">
              <Image
                src="/images/logo_tagline.png"
                alt="PrimeBrew Herbis - From Farms to your Cup"
                width={200}
                height={71}
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-xs leading-relaxed text-brand-mint/90 max-w-sm">
              Farm to Cup. Nature in Every Sip. We source artisanal herbal teas directly from our own farms in Karnataka to deliver pure wellness, unmatched aroma, and zero-chemical vitality.
            </p>

            {/* Address & Contact Details */}
            <div className="space-y-2 text-xs text-brand-mint/90 max-w-sm pt-2 border-t border-white/10">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-white font-medium">Address:</strong> H-No A 75, Ekta Vihar, Jaitpur Extension Part 1, Badarpur, New Delhi – 110044
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <p>
                  <strong className="text-white font-medium">Mobile:</strong>{' '}
                  <a href="tel:+918377074324" className="hover:text-brand-gold transition-colors font-medium">
                    +91 8377074324
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <p>
                  <strong className="text-white font-medium">Email:</strong>{' '}
                  <a href="mailto:Contact.primebrew@gmail.com" className="hover:text-brand-gold transition-colors">
                    Contact.primebrew@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <a
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/primebrew_herbis"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 border border-brand-gold/40 hover:bg-brand-gold hover:text-brand-darkGreen text-white text-xs font-semibold px-3.5 py-2 rounded-badge transition-all"
            >
              <Instagram className="w-4 h-4 text-brand-gold group-hover:text-brand-darkGreen" />
              <span>Follow & Chat @primebrew_herbis on Instagram</span>
            </a>
            {/* <div className="pt-2">
              <p className="text-xs font-semibold text-white mb-2 uppercase tracking-wider">Join Our Tea Circle & Get 15% OFF</p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border border-brand-mint/30 rounded-input px-3.5 py-2 text-xs text-white placeholder-brand-mint/60 focus:outline-none focus:border-brand-gold flex-1"
                />
                <button
                  type="submit"
                  className="bg-brand-gold text-brand-darkGreen font-semibold text-xs px-4 py-2 rounded-button hover:bg-white transition-colors"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-brand-gold mt-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Welcome to PrimeBrew Herbis!
                </p>
              )}
            </div> */}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4 border-b border-brand-gold/40 pb-1.5 inline-block">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-mint/80">
              <li><Link href="/shop?category=detox-tea" className="hover:text-brand-gold transition-colors">Detox Tea</Link></li>
              <li><Link href="/shop?category=sleep-tea" className="hover:text-brand-gold transition-colors">Sleep & Relaxation</Link></li>
              <li><Link href="/shop?category=immunity-tea" className="hover:text-brand-gold transition-colors">Immunity Boosters</Link></li>
              <li><Link href="/shop?category=weight-loss-tea" className="hover:text-brand-gold transition-colors">Weight Loss & Oolong</Link></li>
              <li><Link href="/shop?category=stress-relief-tea" className="hover:text-brand-gold transition-colors">Stress Relief & Adaptogens</Link></li>
              <li><Link href="/shop?category=womens-wellness-tea" className="hover:text-brand-gold transition-colors">Women&apos;s Wellness</Link></li>
              <li><Link href="/shop?category=gift-boxes" className="hover:text-brand-gold transition-colors">Luxury Gift Boxes</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-brand-gold transition-colors">Teapots & Infusers</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4 border-b border-brand-gold/40 pb-1.5 inline-block">
              Company & Help
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-mint/80">
              <li><Link href="/about" className="hover:text-brand-gold transition-colors">Farm to Cup Story</Link></li>
              <li><Link href="/tea-benefits" className="hover:text-brand-gold transition-colors">Tea Health Benefits</Link></li>
              <li><Link href="/blogs" className="hover:text-brand-gold transition-colors">Herbal Recipes & Articles</Link></li>
              <li><Link href="/faq" className="hover:text-brand-gold transition-colors">Frequently Asked Questions (FAQ)</Link></li>
              <li><Link href="/track-order" className="hover:text-brand-gold transition-colors">Track Order Status</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-gold transition-colors">My Customer Account</Link></li>
              <li><Link href="/contact" className="hover:text-brand-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal & Policies Info */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4 border-b border-brand-gold/40 pb-1.5 inline-block">
              Policies & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-mint/80">
              <li><Link href="/privacy-policy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-gold transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-brand-gold transition-colors">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-brand-gold transition-colors">Refund & Cancellation</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and payment icons */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-mint/70">
          <p>© {new Date().getFullYear()} PrimeBrew Herbis. All rights reserved. Crafted with care from Farm to Cup.</p>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">Payment Method</span>
            <span className="bg-amber-600/90 font-bold px-2.5 py-1 rounded text-[11px] text-white">Cash on Delivery (COD Only)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
