import type { Metadata } from 'next';

interface SeoEntry {
  title: string;
  description: string;
  keywords: string[];
}

// Approved copy from PrimeBrew_SEO_Meta.docx.
export const seoEntries: Record<string, SeoEntry> = {
  '/': {
    title: 'Caffeine-Free Herbal & Ayurvedic Teas - PrimeBrew Herbis',
    description: 'Shop pure, caffeine-free herbal and Ayurvedic teas online, delivered across India and New Delhi, hand-picked from our own Karnataka farms for daily wellness.',
    keywords: ['buy herbal tea online', 'caffeine free herbal tea', 'ayurvedic herbal tea', 'best herbal tea in India', 'best herbal tea in New Delhi'],
  },
  '/product/blue-tea': {
    title: 'PrimeBrew Herbis Butterfly Pea Blue Tea, 100% Organic',
    description: 'Brew our organic Butterfly Pea flower tea for a caffeine-free, antioxidant-rich cup that turns a magical blue-to-purple hue. Order online across India.',
    keywords: ['butterfly pea flower tea', 'caffeine free blue tea', 'butterfly pea tea online', 'best blue tea in India', 'best butterfly pea flower tea in India', 'best blue tea brand in India'],
  },
  '/product/guava-jamun-neem-herbal-blend': {
    title: 'Guava, Jamun & Neem Herbal Tea by PrimeBrew Herbis',
    description: 'A natural Guava, Jamun and Neem herbal blend crafted for everyday digestive comfort and traditional wellness. Organic, caffeine-free, and made in India.',
    keywords: ['guava jamun neem herbal tea', 'guava jamun neem tea online', 'organic herbal tea online', 'best herbal tea in India for daily wellness', 'natural herbal tea blend India', 'guava jamun neem herbal tea India'],
  },
  '/product/authentic-ayurvedic-kashayam': {
    title: 'PrimeBrew Herbis Ayurvedic Kashayam for Digestion & Immunity',
    description: 'A traditional Ayurvedic Kashayam blended with ginger, cinnamon and warming spices to support digestion and immunity. Order this authentic brew online.',
    keywords: ['buy ayurvedic kashayam online', 'ayurvedic wellness tea', 'best ayurvedic kashayam', 'natural ayurvedic kashayam online', 'traditional ayurvedic kashayam India', 'premium ayurvedic kashayam online'],
  },
  '/shop': {
    title: 'Shop Premium Herbal & Ayurvedic Teas | PrimeBrew Herbis',
    description: 'Explore our farm-fresh collection of caffeine-free Blue Tea, Ayurvedic Kashayam, and wellness infusions. 100% natural and organically sourced.',
    keywords: ['buy herbal tea online', 'shop blue tea', 'ayurvedic tea shop', 'caffeine free teas', 'herbal tea collection'],
  },
  '/blogs': {
    title: 'Herbal Wellness Journal & Tea Recipes | PrimeBrew Herbis',
    description: 'Read the latest insights on herbal healing, Butterfly Pea benefits, mindful tea rituals, and daily Ayurvedic wellness recipes.',
    keywords: ['herbal tea recipes', 'blue tea benefits', 'ayurvedic tea rituals', 'wellness blog', 'herbal healing articles'],
  },
};

export function createPageMetadata(path: string, entry?: SeoEntry, image = '/images/logo_opaque.png'): Metadata {
  const safeEntry: SeoEntry = entry || {
    title: 'PrimeBrew Herbis | Pure Herbal & Ayurvedic Teas',
    description: 'Shop 100% pure, caffeine-free herbal and Ayurvedic infusions sourced directly from our pristine farms.',
    keywords: ['herbal tea', 'ayurvedic tea', 'primebrew herbis', 'organic tea'],
  };

  return {
    title: { absolute: safeEntry.title },
    description: safeEntry.description,
    keywords: safeEntry.keywords,
    alternates: { canonical: path },
    openGraph: {
      title: safeEntry.title,
      description: safeEntry.description,
      url: path,
      siteName: 'PrimeBrew Herbis',
      type: 'website',
      images: [{ url: image, alt: safeEntry.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: safeEntry.title,
      description: safeEntry.description,
      images: [image],
    },
  };
}
