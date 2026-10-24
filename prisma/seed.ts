import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  initialCategories,
  initialProducts,
  initialReviews,
  initialCoupons,
} from '../src/lib/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed into PostgreSQL...');

  // 1. Seed Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || 'Contact.primebrew@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@PrimeBrew2026';
  const adminHash =
    process.env.ADMIN_PASSWORD_HASH ||
    (await bcrypt.hash(adminPassword, 10));

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      passwordHash: adminHash,
      name: 'PrimeBrew Admin',
    },
    create: {
      name: 'PrimeBrew Admin',
      email: adminEmail,
      phone: '+91 98765 43210',
      role: Role.ADMIN,
      passwordHash: adminHash,
      walletBalance: 1000,
      wishlist: [],
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Seed Demo Customer User
  const customerEmail = 'customer@primebrew.local';
  const customerHash = await bcrypt.hash('Customer@1234', 10);
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      name: 'Arjun Sharma',
      email: customerEmail,
      phone: '+91 91234 56789',
      role: Role.CUSTOMER,
      passwordHash: customerHash,
      walletBalance: 250,
      wishlist: ['prod-1', 'prod-2'],
      addresses: {
        create: {
          fullName: 'Arjun Sharma',
          phone: '+91 91234 56789',
          addressLine1: 'Flat 402, Green Glen Layout, Bellandur',
          addressLine2: 'Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Demo customer seeded: ${customer.email}`);

  // 3. Seed Categories
  for (const cat of initialCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        iconName: cat.iconName,
        image: cat.image,
        itemCount: cat.itemCount,
        featured: cat.featured,
      },
      create: {
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconName: cat.iconName,
        image: cat.image,
        itemCount: cat.itemCount,
        featured: cat.featured,
      },
    });
  }
  console.log(`✅ ${initialCategories.length} categories seeded`);

  // 4. Seed Products
  for (const prod of initialProducts) {
    const existingCat = await prisma.category.findUnique({
      where: { slug: prod.category },
    });

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        subtitle: prod.subtitle || '',
        description: prod.description,
        category: prod.category,
        categoryName: prod.categoryName,
        categoryId: existingCat?.id || null,
        price: prod.price,
        mrp: prod.mrp,
        discountPercentage: prod.discountPercentage,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        stock: prod.stock,
        inStock: prod.inStock,
        isFeatured: Boolean(prod.isFeatured),
        isBestSeller: Boolean(prod.isBestSeller),
        isNewArrival: Boolean(prod.isNewArrival),
        images: prod.images,
        weightVariants: prod.weightVariants || [],
        ingredients: prod.ingredients || [],
        benefits: prod.benefits || [],
        caffeineLevel: prod.caffeineLevel,
        brewingGuide: prod.brewingGuide,
        nutritionInfo: prod.nutritionInfo,
        flavorProfile: prod.flavorProfile || '',
        storageInstructions: prod.storageInstructions || '',
        netQuantity: prod.netQuantity || '',
        keyHerbs: prod.keyHerbs || [],
        certifications: prod.certifications || [],
        sku: prod.sku || '',
        origin: prod.origin || 'PrimeBrew Herbis Own Farms, Karnataka',
      },
      create: {
        id: prod._id,
        name: prod.name,
        slug: prod.slug,
        subtitle: prod.subtitle || '',
        description: prod.description,
        category: prod.category,
        categoryName: prod.categoryName,
        categoryId: existingCat?.id || null,
        price: prod.price,
        mrp: prod.mrp,
        discountPercentage: prod.discountPercentage,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        stock: prod.stock,
        inStock: prod.inStock,
        isFeatured: Boolean(prod.isFeatured),
        isBestSeller: Boolean(prod.isBestSeller),
        isNewArrival: Boolean(prod.isNewArrival),
        images: prod.images,
        weightVariants: prod.weightVariants || [],
        ingredients: prod.ingredients || [],
        benefits: prod.benefits || [],
        caffeineLevel: prod.caffeineLevel,
        brewingGuide: prod.brewingGuide,
        nutritionInfo: prod.nutritionInfo,
        flavorProfile: prod.flavorProfile || '',
        storageInstructions: prod.storageInstructions || '',
        netQuantity: prod.netQuantity || '',
        keyHerbs: prod.keyHerbs || [],
        certifications: prod.certifications || [],
        sku: prod.sku || '',
        origin: prod.origin || 'PrimeBrew Herbis Own Farms, Karnataka',
      },
    });
  }
  console.log(`✅ ${initialProducts.length} products seeded`);

  // 5. Seed Reviews
  for (const rev of initialReviews) {
    const prodExists = await prisma.product.findUnique({
      where: { id: rev.productId },
    });
    if (prodExists) {
      await prisma.review.upsert({
        where: { id: rev._id },
        update: {},
        create: {
          id: rev._id,
          productId: rev.productId,
          userName: rev.userName,
          userAvatar: rev.userAvatar || null,
          rating: rev.rating,
          title: rev.title,
          comment: rev.comment,
          date: rev.date,
          verifiedBuyer: rev.verifiedBuyer,
          helpfulCount: rev.helpfulCount,
        },
      });
    }
  }
  console.log(`✅ ${initialReviews.length} reviews seeded`);

  // 6. Seed Coupons
  for (const coup of initialCoupons) {
    await prisma.coupon.upsert({
      where: { code: coup.code },
      update: {},
      create: {
        code: coup.code,
        discountType: coup.discountType,
        discountValue: coup.discountValue,
        minOrderAmount: coup.minOrderAmount,
        maxDiscount: coup.maxDiscount || null,
        expiryDate: coup.expiryDate || null,
      },
    });
  }
  console.log(`✅ ${initialCoupons.length} coupons seeded`);

  // 7. Seed Sample Notifications
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          title: 'Database Migrated to PostgreSQL',
          message: 'PostgreSQL migration successfully executed with Prisma ORM.',
          type: 'info',
        },
        {
          title: 'Stock Monitoring Active',
          message: 'Atomic transaction stock deduction is now enabled.',
          type: 'stock',
        },
      ],
    });
    console.log('✅ Initial notifications seeded');
  }

  console.log('🎉 PostgreSQL database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
