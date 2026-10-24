import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initialProducts } from '@/lib/seedData';
import { createPageMetadata, seoEntries } from '@/lib/seo';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function findProduct(slug: string) {
  return initialProducts.find(
    (product) =>
      product.slug === slug ||
      product._id === slug ||
      (slug === 'pre-diabetic-tea' && product._id === 'prod-4') ||
      (slug === 'ayur-tea' && product._id === 'prod-5')
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const path = `/product/${product.slug}`;
  const entry = seoEntries[path] ?? {
    title: `${product.name} | PrimeBrew Herbis`,
    description: product.description,
    keywords: [product.name, 'PrimeBrew Herbis'],
  };

  return createPageMetadata(path, entry, product.images[0]);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (!findProduct(slug)) notFound();
  return <ProductDetailClient params={{ slug }} />;
}
