import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toProductDto } from '@/lib/products';
import { verifyAdminToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.slug.toLowerCase().trim();

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: { equals: slug, mode: 'insensitive' } },
          { id: { equals: slug, mode: 'insensitive' } },
        ],
      },
      include: {
        reviews: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const related = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        category: product.category,
      },
      take: 4,
    });

    return NextResponse.json({
      success: true,
      product: toProductDto(product),
      relatedProducts: related.map(toProductDto),
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const params = await context.params;
    const slug = params.slug.toLowerCase().trim();
    const body = await request.json();

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: { equals: slug, mode: 'insensitive' } }, { id: slug }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const updateData: any = { ...body };
    delete updateData._id;
    delete updateData.id;
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
      updateData.inStock = updateData.stock > 0;
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
    });

    await logAdminAction(auth.admin?.email || 'admin', 'UPDATE', 'PRODUCT', updated.id, {
      name: updated.name,
      changes: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: toProductDto(updated),
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const params = await context.params;
    const slug = params.slug.toLowerCase().trim();

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: { equals: slug, mode: 'insensitive' } }, { id: slug }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: existing.id },
    });

    await logAdminAction(auth.admin?.email || 'admin', 'DELETE', 'PRODUCT', existing.id, {
      name: existing.name,
      slug: existing.slug,
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
