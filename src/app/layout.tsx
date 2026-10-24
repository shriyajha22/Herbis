import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { StoreProvider } from '@/lib/storeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ToastContainer from '@/components/layout/ToastContainer';
import FloatingChat from '@/components/home/FloatingChat';
import ActivityTracker from '@/components/layout/ActivityTracker';

const siteUrl = 'https://www.primebrewherbis.com';
const siteTitle = 'Caffeine-Free Herbal & Ayurvedic Teas - PrimeBrew Herbis';
const siteDescription =
  'Shop pure, caffeine-free herbal and Ayurvedic teas online, delivered across India and New Delhi, hand-picked from our own Karnataka farms for daily wellness.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | PrimeBrew Herbis',
  },
  description: siteDescription,
  keywords: [
    'buy herbal tea online',
    'caffeine free herbal tea',
    'ayurvedic herbal tea',
    'best herbal tea in India',
    'best herbal tea in New Delhi',
  ],
  // Set each page's canonical in its own metadata, including '/' on the homepage.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: 'PrimeBrew Herbis',
    images: [
      {
        url: '/images/logo_opaque.png',
        width: 1731,
        height: 502,
        alt: 'PrimeBrew Herbis Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/images/logo_opaque.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PrimeBrew Herbis',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    image: `${siteUrl}/images/logo.png`,
    description: 'Farm to Cup. Nature in Every Sip. Premium artisanal herbal teas sourced directly from trusted farms in Karnataka.',
    email: 'Contact.primebrew@gmail.com',
    sameAs: ['https://instagram.com/primebrew_herbis'],
  };

  return (
    <html lang='en' className='scroll-smooth'>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className='bg-brand-cream text-brand-charcoal antialiased min-h-screen flex flex-col justify-between selection:bg-brand-mint selection:text-brand-darkGreen'>
        <StoreProvider>
          <ActivityTracker />
          <Navbar />
          <CartDrawer />
          <ToastContainer />
          <main className='flex-1'>{children}</main>
          <FloatingChat />
          <Footer />
        </StoreProvider>

        <Script
          src='https://www.googletagmanager.com/gtag/js?id=G-HW6XV7VF4T'
          strategy='afterInteractive'
        />
        <Script id='google-analytics' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HW6XV7VF4T');
          `}
        </Script>
      </body>
    </html>
  );
}
