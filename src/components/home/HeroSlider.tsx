'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    badge: "100% Pure Butterfly Pea",
    title: "Vivid Sapphire Blue Tea",
    subtitle: "Organic Clitoria Ternatea flowers rich in anthocyanin antioxidants. Experience the magical purple citrus transformation.",
    ctaText: "Discover Blue Tea",
    ctaLink: "/product/blue-tea",
    image: "/images/blue-tea.jpg",
    tag: "30 Tea Bags • ₹249",
  },
  {
    id: 2,
    badge: "Aromatic Cardamom Infusion",
    title: "Blue Tea with Elaichi",
    subtitle: "Vibrant Butterfly Pea flowers with freshly crushed Tellicherry green cardamom. Digestive comfort & soothing warmth.",
    ctaText: "Explore Elaichi Blue Tea",
    ctaLink: "/product/blue-tea-with-elaichi",
    image: "/images/blue-tea-elaichi.jpg",
    tag: "30 Tea Bags • ₹299",
  },
  {
    id: 3,
    badge: "Supports Digestion & Traditional Wellness",
    title: "Guava + Jamun + Neem Herbal Blend",
    subtitle: "Discover the goodness of three time-honored herbs in one refreshing cup. Thoughtfully crafted to support digestive wellness and promote overall well-being.",
    ctaText: "Discover Guava Jamun Neem",
    ctaLink: "/product/guava-jamun-neem-herbal-blend",
    image: "/images/guava-jamun-neem.jpg",
    tag: "30 Tea Bags • ₹425",
  },
  {
    id: 4,
    badge: "Supports Digestion, Immunity & Metabolism",
    title: "Authentic Ayurvedic Kashayam",
    subtitle: "Crafted from traditional herbs and spices to strengthen immunity, ease digestion, and promote healthy metabolism.",
    ctaText: "Discover Ayurvedic Kashayam",
    ctaLink: "/product/authentic-ayurvedic-kashayam",
    image: "/images/ayurvedic-kashayam.jpg",
    tag: "30 Tea Bags • ₹380",
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full min-h-[540px] md:min-h-[600px] bg-brand-darkGreen overflow-hidden flex items-center">
      {/* Background Image Slide with Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slides[currentIndex].image}
            alt={slides[currentIndex].title}
            fill
            priority
            className="object-cover object-center opacity-70"
          />
          {/* Lightened Soft Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-darkGreen/65 via-brand-darkGreen/40 to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative Botanical Leaf Accents */}
      <div className="absolute top-10 right-10 text-white/5 pointer-events-none hidden lg:block">
        <Leaf className="w-96 h-96 transform rotate-45" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-2xl text-white space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs font-bold px-3.5 py-1.5 rounded-badge backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span>{slides[currentIndex].badge}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold ml-1"></span>
                <span className="text-white/90 font-semibold">{slides[currentIndex].tag}</span>
              </div>

              {/* Title: 40-48px on large screens */}
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-white leading-tight tracking-tight">
                {slides[currentIndex].title}
              </h1>

              {/* Subtitle: 16-18px */}
              <p className="text-base sm:text-lg text-brand-beige/90 leading-relaxed font-light max-w-xl">
                {slides[currentIndex].subtitle}
              </p>

              {/* Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={slides[currentIndex].ctaLink}
                  className="btn-primary-gradient text-sm px-7 py-3.5 rounded-button shadow-soft hover:shadow-xl flex items-center gap-2 transition-all duration-200"
                >
                  <span>{slides[currentIndex].ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/shop"
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm px-6 py-3.5 rounded-button border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105"
                >
                  Browse All 5 Teas
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Quick Trust Highlights */}
          <div className="pt-8 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-brand-beige/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>30 Tea Bags per Box</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-brand-gold" />
              <span>100% Organic Botanicals</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Zero Artificial Additives</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrow Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === i ? 'w-8 bg-brand-gold' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
