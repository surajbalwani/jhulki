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
    { name: 'Kurta', slug: 'kurta', description: 'Handcrafted luxury raw silk & Gajji silk designer kurtas for men' },
    { name: 'Chaniya Choli', slug: 'chaniya-choli', description: 'Bespoke Kutchi mirrorwork & artisanal silk chaniya choli sets' },
    { name: 'Blouse', slug: 'blouse', description: 'Haute couture hand-embroidered blouses & corsets' },
    { name: 'Accessories', slug: 'accessories', description: 'Handcrafted leather bags, gold jewelry, and silk scarves' },
    { name: 'Kids', slug: 'kids', description: 'Bespoke luxury wear and occasion attire for children' },
    { name: 'Couple', slug: 'couple', description: 'Matching haute couture ensembles for couples' },
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
      price: 18450.00,
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
      price: 28900.00,
      salePrice: 24000.00,
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
      price: 14500.00,
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
      price: 9800.00,
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
      name: 'Little Prince Velvet Sherwani Set',
      slug: 'little-prince-velvet-sherwani',
      description: 'Hand-embroidered royal velvet jacket with silk pyjama trousers for young gentlemen.',
      price: 3500.00,
      images: [
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1000'
      ],
      categorySlug: 'kids',
      isFeatured: true,
      stock: [
        { size: '2-3Y', quantity: 5 },
        { size: '4-5Y', quantity: 8 },
        { size: '6-7Y', quantity: 6 },
      ]
    },
    {
      name: 'Royal Heritage Matching Couple Set',
      slug: 'royal-heritage-matching-couple-set',
      description: 'Coordinated gold embroidered tuxedo & floor-length gown set crafted for grand celebrations.',
      price: 38000.00,
      salePrice: 34500.00,
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000'
      ],
      categorySlug: 'couple',
      isFeatured: true,
      stock: [
        { size: 'Set M/S', quantity: 3 },
        { size: 'Set L/M', quantity: 4 },
      ]
    },
    {
      name: 'Jhulki First Edition Chaniya Choli set',
      slug: 'jhulki-first-edition-chaniya-choli-set',
      description: 'Handcrafted luxury Kutchi mirrorwork embroidered choli blouse paired with a high-flared pleated black skirt and vibrant red silk dupatta. Features Jhulki signature gold-stitched inner branding tag.',
      price: 4999.00,
      salePrice: 4299.00,
      images: [
        '/products/chaniya-choli/full.jpg',
        '/products/chaniya-choli/back.jpg',
        '/products/chaniya-choli/zoom.jpg',
        '/products/chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Royal Black Asymmetrical Kutchi Embroidered Kurta Set',
      slug: 'royal-black-asymmetrical-kutchi-kurta',
      description: 'Hand-tailored raw silk knee-length black kurta sherwani with an asymmetrical vertical Kutchi mirror-work panel. Features Jhulki signature gold inner collar tag.',
      price: 1899.00,
      salePrice: 1599.00,
      images: [
        '/products/kurta-black-kutchi/full.jpg',
        '/products/kurta-black-kutchi/back.jpg',
        '/products/kurta-black-kutchi/side.jpg',
        '/products/kurta-black-kutchi/zoom.jpg',
        '/products/kurta-black-kutchi/tag.jpg'
      ],
      categorySlug: 'kurta',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [
        { size: '38R', quantity: 6 },
        { size: '40R', quantity: 10 },
        { size: '42R', quantity: 5 },
      ]
    },
    {
      name: 'Festive Teal Blue Gajji Silk Printed Kurta Set',
      slug: 'festive-teal-blue-gajji-silk-kurta',
      description: 'Pure Gajji silk kurta in royal teal blue with gold bandhani dot prints and 3 hand-embroidered red pocket patches with hanging yellow tassels. Paired with white pyjama trousers.',
      price: 1499.00,
      salePrice: 1299.00,
      images: [
        '/products/kurta-teal-gajji/full.jpg',
        '/products/kurta-teal-gajji/back.jpg',
        '/products/kurta-teal-gajji/side.jpg',
        '/products/kurta-teal-gajji/zoom.jpg'
      ],
      categorySlug: 'kurta',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [
        { size: '38R', quantity: 8 },
        { size: '40R', quantity: 12 },
        { size: '42R', quantity: 6 },
      ]
    },
    {
      name: 'Ivory Multi-Color Bandhani Tiered Chaniya Choli Set',
      slug: 'ivory-multicolor-bandhani-chaniya-choli',
      description: 'Handcrafted pure white tiered flared cotton lehenga skirt with colorful embroidery speckles, paired with a vibrant Kutchi mirror-work sleeveless blouse, multi-color tie-dye Bandhani dupatta, and pompom tassels.',
      price: 4499.00,
      salePrice: 3899.00,
      images: [
        '/products/ivory-multicolor-bandhani-chaniya-choli/full.jpg',
        '/products/ivory-multicolor-bandhani-chaniya-choli/back.jpg',
        '/products/ivory-multicolor-bandhani-chaniya-choli/zoom.jpg',
        '/products/ivory-multicolor-bandhani-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Imperial Off-White Gold Mirrorwork Chaniya Choli Set',
      slug: 'imperial-offwhite-gold-mirrorwork-chaniya-choli',
      description: 'Off-white heavy flared silk lehenga featuring rich metallic gold zari borders and diamond-embroidered Kutchi mirrorwork motifs. Includes shell-tasseled blouse and striped gold dupatta.',
      price: 6499.00,
      salePrice: 5999.00,
      images: [
        '/products/imperial-offwhite-gold-mirrorwork-chaniya-choli/full.jpg',
        '/products/imperial-offwhite-gold-mirrorwork-chaniya-choli/back.jpg',
        '/products/imperial-offwhite-gold-mirrorwork-chaniya-choli/zoom.jpg',
        '/products/imperial-offwhite-gold-mirrorwork-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Royal Violet Mirrorwork Corset Chaniya Choli Set',
      slug: 'royal-violet-mirrorwork-corset-chaniya-choli',
      description: 'Deep royal purple silk sweetheart corset blouse detailed with Kutchi mirrorwork and hanging pearl drop trim, paired with a knife-pleated purple flared lehenga and mirror waist trim.',
      price: 5299.00,
      salePrice: 4699.00,
      images: [
        '/products/royal-violet-mirrorwork-corset-chaniya-choli/full.jpg',
        '/products/royal-violet-mirrorwork-corset-chaniya-choli/back.jpg',
        '/products/royal-violet-mirrorwork-corset-chaniya-choli/zoom.jpg',
        '/products/royal-violet-mirrorwork-corset-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Black & Magenta Kutchi Embroidered Chaniya Choli Set',
      slug: 'black-magenta-kutchi-embroidered-chaniya-choli',
      description: 'High-flared black cotton lehenga with vibrant multi-color Kutchi embroidered hem border, paired with a black embroidered blouse and a scalloped hot pink dupatta.',
      price: 4799.00,
      salePrice: 4199.00,
      images: [
        '/products/black-magenta-kutchi-embroidered-chaniya-choli/full.jpg',
        '/products/black-magenta-kutchi-embroidered-chaniya-choli/back.jpg',
        '/products/black-magenta-kutchi-embroidered-chaniya-choli/zoom.jpg',
        '/products/black-magenta-kutchi-embroidered-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Plum & Ivory Royal Kutchi Patchwork Chaniya Choli Set',
      slug: 'plum-ivory-royal-kutchi-chaniya-choli',
      description: 'Deep plum silk choli with geometric Kutchi patch embroidery and gold woven sleeves, complemented by a pristine ivory pleated lehenga with wide tissue zari hem border.',
      price: 5899.00,
      salePrice: 5299.00,
      images: [
        '/products/plum-ivory-royal-kutchi-chaniya-choli/full.jpg',
        '/products/plum-ivory-royal-kutchi-chaniya-choli/back.jpg',
        '/products/plum-ivory-royal-kutchi-chaniya-choli/zoom.jpg',
        '/products/plum-ivory-royal-kutchi-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Black Georgette Rabari Embroidered Navratri Chaniya Choli Set',
      slug: 'black-georgette-rabari-navratri-chaniya-choli',
      description: 'Jet black georgette Navratri ensemble featuring Rabari waistband peplum flaps, multi-tiered elephant & floral Kutchi borders, and mustard yellow crushed silk dupatta.',
      price: 5499.00,
      salePrice: 4899.00,
      images: [
        '/products/black-georgette-rabari-navratri-chaniya-choli/full.jpg',
        '/products/black-georgette-rabari-navratri-chaniya-choli/back.jpg',
        '/products/black-georgette-rabari-navratri-chaniya-choli/zoom.jpg',
        '/products/black-georgette-rabari-navratri-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Purple & White Dual-Tone Kutchi Mirrorwork Chaniya Choli Set',
      slug: 'purple-white-dualtone-kutchi-chaniya-choli',
      description: 'Dual-tone purple and ivory flared chaniya choli set embellished with traditional Kutchi floral mirrorwork borders and matching arch-motif embroidered white drape dupatta.',
      price: 3999.00,
      salePrice: 3499.00,
      images: [
        '/products/purple-white-dualtone-kutchi-chaniya-choli/full.jpg',
        '/products/purple-white-dualtone-kutchi-chaniya-choli/back.jpg',
        '/products/purple-white-dualtone-kutchi-chaniya-choli/zoom.jpg',
        '/products/purple-white-dualtone-kutchi-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'White Lotus Printed Kutchi Embroidered Chaniya Choli Set',
      slug: 'white-lotus-kutchi-embroidered-chaniya-choli',
      description: 'Pristine white cotton lehenga with lotus block prints, gold damask jacquard flare, and colorful Kutchi mirrorwork middle border band. Paired with black choli and crimson pompom dupatta.',
      price: 4699.00,
      salePrice: 3999.00,
      images: [
        '/products/white-lotus-kutchi-embroidered-chaniya-choli/full.jpg',
        '/products/white-lotus-kutchi-embroidered-chaniya-choli/back.jpg',
        '/products/white-lotus-kutchi-embroidered-chaniya-choli/zoom.jpg',
        '/products/white-lotus-kutchi-embroidered-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Noir Royal Tiered Gold Zari Chaniya Choli Set',
      slug: 'noir-royal-tiered-gold-zari-chaniya-choli',
      description: 'Haute couture noir black tiered crushed silk lehenga accented with handcrafted gold zari bootis and wide metallic gold border, paired with full-sleeve black blouse and rani pink Banarasi dupatta.',
      price: 6999.00,
      salePrice: 6299.00,
      images: [
        '/products/noir-royal-tiered-gold-zari-chaniya-choli/full.jpg',
        '/products/noir-royal-tiered-gold-zari-chaniya-choli/back.jpg',
        '/products/noir-royal-tiered-gold-zari-chaniya-choli/zoom.jpg',
        '/products/noir-royal-tiered-gold-zari-chaniya-choli/tag.jpg'
      ],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [
        { size: 'Free Size', quantity: 15 },
      ]
    },
    {
      name: 'Aura Emerald Hand-Embroidered Chaniya Choli Set',
      slug: 'aura-emerald-hand-embroidered-chaniya-choli-set',
      description: 'Handcrafted emerald green silk chaniya choli set embellished with traditional Kutchi mirrorwork and gold zari border.',
      price: 3200.00,
      salePrice: 2899.00,
      images: ['/products/new-women/nw-1.jpeg', '/products/new-women/nw-2.jpeg', '/products/new-women/nw-3.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Blush Pink Mirrorwork Zari Chaniya Choli Set',
      slug: 'blush-pink-mirrorwork-zari-chaniya-choli-set',
      description: 'Soft blush pink silk chaniya choli with mirrorwork corset blouse and high-flared pleated skirt.',
      price: 3499.00,
      salePrice: 3199.00,
      images: ['/products/new-women/nw-4.jpeg', '/products/new-women/nw-5.jpeg', '/products/new-women/nw-6.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Maroon Velvet Royal Kutchi Chaniya Choli Set',
      slug: 'maroon-velvet-royal-kutchi-chaniya-choli-set',
      description: 'Royal maroon velvet choli blouse paired with Kutchi mirrorwork flared lehenga and bandhani dupatta.',
      price: 3699.00,
      salePrice: 3299.00,
      images: ['/products/new-women/nw-7.jpeg', '/products/new-women/nw-8.jpeg', '/products/new-women/nw-9.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Royal Sapphire Blue Bandhani Chaniya Choli Set',
      slug: 'royal-sapphire-blue-bandhani-chaniya-choli-set',
      description: 'Sapphire blue Gajji silk chaniya choli set adorned with gold bandhani prints and traditional mirror tassels.',
      price: 3899.00,
      salePrice: 3499.00,
      images: ['/products/new-women/nw-10.jpeg', '/products/new-women/nw-11.jpeg', '/products/new-women/nw-12.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Mustard Yellow Festive Garba Chaniya Choli Set',
      slug: 'mustard-yellow-festive-garba-chaniya-choli-set',
      description: 'Vibrant mustard yellow flared cotton lehenga with elephant motifs and vibrant multi-color Kutchi border.',
      price: 3999.00,
      salePrice: 3599.00,
      images: ['/products/new-women/nw-13.jpeg', '/products/new-women/nw-14.jpeg', '/products/new-women/nw-15.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Crimson Red Heritage Patchwork Chaniya Choli Set',
      slug: 'crimson-red-heritage-patchwork-chaniya-choli-set',
      description: 'Classic crimson red silk choli paired with geometric Rabari patchwork skirt and tissue gold zari drape.',
      price: 4199.00,
      salePrice: 3799.00,
      images: ['/products/new-women/nw-16.jpeg', '/products/new-women/nw-17.jpeg', '/products/new-women/nw-18.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Ivory Pearl Embroidered Corset Chaniya Choli Set',
      slug: 'ivory-pearl-embroidered-corset-chaniya-choli-set',
      description: 'Pristine ivory sweetheart corset choli with pearl drop embroidery and high-flare knife pleated lehenga.',
      price: 4299.00,
      salePrice: 3899.00,
      images: ['/products/new-women/nw-19.jpeg', '/products/new-women/nw-20.jpeg', '/products/new-women/nw-21.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Teal Blue Mirrorwork Pleated Chaniya Choli Set',
      slug: 'teal-blue-mirrorwork-pleated-chaniya-choli-set',
      description: 'Royal teal blue silk flared chaniya choli with arch-motif mirrorwork hem and matching drape.',
      price: 4499.00,
      salePrice: 3999.00,
      images: ['/products/new-women/nw-22.jpeg', '/products/new-women/nw-23.jpeg', '/products/new-women/nw-24.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      isBogoEnabled: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    },
    {
      name: 'Deep Plum Floral Jacquard Chaniya Choli Set',
      slug: 'deep-plum-floral-jacquard-chaniya-choli-set',
      description: 'Deep plum silk choli with jacquard floral motifs and wide gold zari hem border.',
      price: 4500.00,
      salePrice: 3999.00,
      images: ['/products/new-women/nw-25.jpeg', '/products/new-women/nw-26.jpeg', '/products/new-women/nw-27.jpeg'],
      categorySlug: 'chaniya-choli',
      isFeatured: true,
      stock: [{ size: 'Free Size', quantity: 15 }]
    }
  ];

  for (const p of products) {
    const categoryId = categoriesMap[p.categorySlug];
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        salePrice: p.salePrice || null,
        description: p.description,
        name: p.name,
      },
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
    console.log(`Seeded Product: ${created.name} | Price: ₹${created.price}`);
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
