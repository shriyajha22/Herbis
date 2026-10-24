import React from 'react';
import { getAllProducts } from '@/lib/products';
import { initialCategories } from '@/lib/seedData';
import { ShopPageClient } from './ShopPageClient';
import { createPageMetadata, seoEntries } from '@/lib/seo';

export const metadata = createPageMetadata('/shop', seoEntries['/shop']);

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ShopPage() {
  const products = await getAllProducts();

  return <ShopPageClient initialProducts={products} categories={initialCategories} />;
}
