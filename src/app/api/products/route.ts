import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toProductDto } from '@/lib/products';
import { verifyAdminToken } from '@/lib/auth';
import { productSchema } from '@/lib/validators';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const caffeine = searchParams.get('caffeine')?.trim() || '';
    const benefit = searchParams.get('benefit')?.trim() || '';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sort = searchParams.get('sort') || 'featured';

    const where: any = {};

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (caffeine) {
      where.caffeineLevel = { contains: caffeine, mode: 'insensitive' };
    }

    if (benefit) {
      where.benefits = { has: benefit };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { subtitle: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { categoryName: { contains: query, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { isNewArrival: 'desc' };
    } else {
      orderBy = [{ isBestSeller: 'desc' }, { rating: 'desc' }];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    const dtos = products.map(toProductDto);

    return NextResponse.json({
      success: true,
      total: dtos.length,
      products: dtos,
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid product data' },
        { status: 400 }
      );
    }

    const data = validation.data;
    const rawSlug = data.slug || data.name;
    const slug = rawSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A product with this slug already exists' },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        subtitle: body.subtitle || '',
        description: data.description,
        category: data.category,
        categoryName: body.categoryName || data.category,
        price: data.price,
        mrp: data.mrp,
        discountPercentage: data.discountPercentage || 0,
        stock: data.stock,
        inStock: data.stock > 0,
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        isNewArrival: Boolean(data.isNewArrival),
        images: data.images || [],
        weightVariants: body.weightVariants || [],
        ingredients: body.ingredients || [],
        benefits: body.benefits || [],
        caffeineLevel: data.caffeineLevel || 'Naturally Caffeine-Free',
        brewingGuide: body.brewingGuide || {},
        nutritionInfo: body.nutritionInfo || {},
        flavorProfile: body.flavorProfile || '',
        storageInstructions: body.storageInstructions || '',
        netQuantity: body.netQuantity || '',
        keyHerbs: body.keyHerbs || [],
        certifications: body.certifications || [],
        sku: body.sku || `PBH-${Date.now()}`,
        origin: body.origin || 'PrimeBrew Herbis Own Farms, Karnataka',
      },
    });

    await logAdminAction(auth.admin?.email || 'admin', 'CREATE', 'PRODUCT', product.id, {
      name: product.name,
      slug: product.slug,
      price: product.price,
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: toProductDto(product),
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
