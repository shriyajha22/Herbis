import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const caffeine = searchParams.get('caffeine') || '';
  const benefit = searchParams.get('benefit') || '';
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 10000;
  const sort = searchParams.get('sort') || 'featured';

  let filtered = [...inMemoryStore.products];

  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        p.ingredients.some((i) => i.name.toLowerCase().includes(query))
    );
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (caffeine) {
    filtered = filtered.filter((p) => p.caffeineLevel.toLowerCase().includes(caffeine.toLowerCase()));
  }

  if (benefit) {
    filtered = filtered.filter((p) => p.benefits.some((b) => b.toLowerCase().includes(benefit.toLowerCase())));
  }

  if (minPrice > 0 || maxPrice < 10000) {
    filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  }

  // Sorting
  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  } else {
    // Default featured / best sellers
    filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    products: filtered,
  });
}

export async function POST(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const newProduct = {
      _id: `prod-${Date.now()}`,
      ...body,
      inStock: body.stock > 0,
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 0,
    };

    inMemoryStore.products.unshift(newProduct);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
  }
}
