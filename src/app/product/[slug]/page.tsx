import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { createPageMetadata, seoEntries } from '@/lib/seo';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product._id, product.category);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
