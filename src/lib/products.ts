import { inMemoryStore } from '@/lib/db';
import { Product } from '@/lib/types';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const clean = slug.toLowerCase();
  const product = inMemoryStore.products.find(
    (p) =>
      p.slug.toLowerCase() === clean ||
      p._id.toLowerCase() === clean ||
      (clean === 'pre-diabetic-tea' && p._id === 'prod-4') ||
      (clean === 'ayur-tea' && p._id === 'prod-5')
  );
  return product || null;
}

export async function getRelatedProducts(currentId: string, category?: string): Promise<Product[]> {
  const matches = inMemoryStore.products.filter(
    (p) => p._id !== currentId && (!category || p.category === category)
  );
  if (matches.length < 4) {
    const others = inMemoryStore.products.filter((p) => p._id !== currentId && !matches.includes(p));
    return [...matches, ...others].slice(0, 4);
  }
  return matches.slice(0, 4);
}

export async function getAllProducts(): Promise<Product[]> {
  return inMemoryStore.products;
}
