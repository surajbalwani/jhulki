import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Jhulki Luxury database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jhulki.com' },
    update: {},
    create: {
      email: 'admin@jhulki.com',
      passwordHash: adminPassword,
      fullName: 'Jhulki Admin',
      role: 'ADMIN',
    },
  });

  // Create demo customer user
  const customerPassword = await bcrypt.hash('CustomerPass123!', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'client@jhulki.com' },
    update: {},
    create: {
      email: 'client@jhulki.com',
      passwordHash: customerPassword,
      fullName: 'Sophia Laurent',
      role: 'CUSTOMER',
    },
  });

  // Create Categories
  const categoriesData = [
    { name: 'Men', slug: 'men', description: 'Tailored suits, cashmere coats, and haute outerwear' },
    { name: 'Women', slug: 'women', description: 'Silk gowns, luxury coats, and artisanal tailoring' },
    { name: 'Accessories', slug: 'accessories', description: 'Handcrafted leather bags, gold jewelry, and silk scarves' },
    { name: 'Footwear', slug: 'footwear', description: 'Handmade Italian leather boots & velvet loafers' },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoriesMap[c.slug] = cat.id;
  }

  // Create Luxury Seed Products
  const products = [
    {
      name: 'Midnight Silk Tuxedo Suit',
      slug: 'midnight-silk-tuxedo-suit',
      description: 'Crafted from 100% pure Mulberry silk with hand-stitched satin lapels. Designed for grand galas and high-profile evenings.',
      price: 2450.00,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000'
      ],
      categorySlug: 'men',
      isFeatured: true,
      stock: [
        { size: '38R', quantity: 8 },
        { size: '40R', quantity: 12 },
        { size: '42R', quantity: 6 },
      ]
    },
    {
      name: 'Aurelia Gold Embroided Evening Gown',
      slug: 'aurelia-gold-embroided-gown',
      description: 'An ethereal floor-length gown woven with 24k gold metallic threads and a sculpted corset bodice.',
      price: 3890.00,
      salePrice: 3400.00,
      images: [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'
      ],
      categorySlug: 'women',
      isFeatured: true,
      stock: [
        { size: 'XS', quantity: 4 },
        { size: 'S', quantity: 10 },
        { size: 'M', quantity: 7 },
        { size: 'L', quantity: 3 },
      ]
    },
    {
      name: 'Cashmere Double-Breasted Trench Coat',
      slug: 'cashmere-double-breasted-trench',
      description: 'Soft virgin cashmere tailored in Florence with horn buttons and a waist cinching belt.',
      price: 1850.00,
      images: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
        'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1000'
      ],
      categorySlug: 'women',
      isFeatured: true,
      stock: [
        { size: 'S', quantity: 15 },
        { size: 'M', quantity: 12 },
        { size: 'L', quantity: 5 },
      ]
    },
    {
      name: 'Monogram Leather Duffle Bag',
      slug: 'monogram-leather-duffle-bag',
      description: 'Full-grain Tuscan calfskin duffle with palladium gold hardware and personalized monogram tag.',
      price: 1290.00,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000'
      ],
      categorySlug: 'accessories',
      isFeatured: false,
      stock: [
        { size: 'One Size', quantity: 20 },
      ]
    },
    {
      name: 'Royal Velvet Embroidered Loafers',
      slug: 'royal-velvet-embroidered-loafers',
      description: 'Handcrafted velvet slippers with gold bullion crest emblem and cushioned leather lining.',
      price: 790.00,
      images: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000'
      ],
      categorySlug: 'footwear',
      isFeatured: true,
      stock: [
        { size: '40 EU', quantity: 5 },
        { size: '41 EU', quantity: 10 },
        { size: '42 EU', quantity: 8 },
        { size: '43 EU', quantity: 4 },
      ]
    }
  ];

  for (const p of products) {
    const categoryId = categoriesMap[p.categorySlug];
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice || null,
        images: p.images,
        categoryId,
        isFeatured: p.isFeatured,
        stock: {
          create: p.stock
        }
      }
    });
    console.log(`Seeded Product: ${created.name}`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
