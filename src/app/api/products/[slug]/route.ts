import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  await connectToDatabase();
  const params = await context.params;
  const slug = params.slug;

  const product = inMemoryStore.products.find((p) => p.slug === slug || p._id === slug);

  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  }

  const related = inMemoryStore.products
    .filter((p) => (p.category === product.category || p.caffeineLevel === product.caffeineLevel) && p._id !== product._id)
    .slice(0, 4);

  return NextResponse.json({
    success: true,
    product,
    relatedProducts: related,
  });
}
