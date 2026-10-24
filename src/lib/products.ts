import { prisma } from '@/lib/prisma';
import { initialProducts } from '@/lib/seedData';
import { Product } from '@/lib/types';

export function toProductDto(p: any): Product {
  return {
    _id: p.id,
    name: p.name,
    slug: p.slug,
    subtitle: p.subtitle || '',
    description: p.description,
    category: p.category,
    categoryName: p.categoryName,
    price: Number(p.price),
    mrp: Number(p.mrp),
    discountPercentage: Number(p.discountPercentage || 0),
    rating: Number(p.rating || 5.0),
    reviewCount: Number(p.reviewCount || 0),
    stock: Number(p.stock || 0),
    inStock: Boolean(p.inStock),
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
    isNewArrival: Boolean(p.isNewArrival),
    images: Array.isArray(p.images) ? p.images : [],
    weightVariants: Array.isArray(p.weightVariants) ? (p.weightVariants as any) : [],
    ingredients: Array.isArray(p.ingredients) ? (p.ingredients as any) : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    caffeineLevel: p.caffeineLevel || 'Naturally Caffeine-Free',
    brewingGuide: (p.brewingGuide as any) || { temp: '', steepTime: '', waterAmount: '', servingSuggestion: '' },
    nutritionInfo: (p.nutritionInfo as any) || { calories: '', carbs: '', protein: '', fat: '', antioxidants: '' },
    flavorProfile: p.flavorProfile || '',
    storageInstructions: p.storageInstructions || '',
    netQuantity: p.netQuantity || '',
    keyHerbs: Array.isArray(p.keyHerbs) ? p.keyHerbs : [],
    certifications: Array.isArray(p.certifications) ? p.certifications : [],
    sku: p.sku || '',
    origin: p.origin || 'PrimeBrew Herbis Own Farms, Karnataka',
    createdDate: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const clean = slug.toLowerCase();
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: { equals: clean, mode: 'insensitive' } },
          { id: { equals: clean, mode: 'insensitive' } },
        ],
      },
    });

    if (product) return toProductDto(product);
  } catch (error) {
    console.warn('Database lookup failed in getProductBySlug, using seed fallback:', error);
  }

  // Fallback to static seed data if needed
  const fallback = initialProducts.find(
    (p) =>
      p.slug.toLowerCase() === clean ||
      p._id.toLowerCase() === clean ||
      (clean === 'pre-diabetic-tea' && p._id === 'prod-4') ||
      (clean === 'ayur-tea' && p._id === 'prod-5')
  );
  return fallback || null;
}

export async function getRelatedProducts(currentId: string, category?: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: { not: currentId },
        ...(category ? { category } : {}),
      },
      take: 4,
    });

    if (products.length >= 4) {
      return products.map(toProductDto);
    }

    const moreProducts = await prisma.product.findMany({
      where: {
        id: { notIn: [currentId, ...products.map((p) => p.id)] },
      },
      take: 4 - products.length,
    });

    return [...products, ...moreProducts].map(toProductDto);
  } catch (error) {
    console.warn('Database lookup failed in getRelatedProducts, using seed fallback:', error);
    const matches = initialProducts.filter(
      (p) => p._id !== currentId && (!category || p.category === category)
    );
    if (matches.length < 4) {
      const others = initialProducts.filter((p) => p._id !== currentId && !matches.includes(p));
      return [...matches, ...others].slice(0, 4);
    }
    return matches.slice(0, 4);
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (products.length > 0) {
      return products.map(toProductDto);
    }
  } catch (error) {
    console.warn('Database lookup failed in getAllProducts, using seed fallback:', error);
  }
  return initialProducts;
}
