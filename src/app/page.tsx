import HomePageClient from './HomePageClient';
import { createPageMetadata, seoEntries } from '@/lib/seo';
import { getAllProducts } from '@/lib/products';

export const metadata = createPageMetadata('/', seoEntries['/']);

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const products = await getAllProducts();
  return <HomePageClient products={products} />;
}
