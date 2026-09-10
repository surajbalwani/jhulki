import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCors } from '@/lib/cors';

export async function OPTIONS() {
  return handleCors();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort');

    const where: any = {};
    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        stock: true,
      },
    });

    return NextResponse.json(products, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch products.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, salePrice, images, categorySlug, isFeatured, isNewArrival, stock } = body;

    if (!name || !description || price === undefined || !categorySlug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, categorySlug' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
          slug: categorySlug,
        },
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'],
        categoryId: category.id,
        isFeatured: !!isFeatured,
        isNewArrival: isNewArrival !== undefined ? !!isNewArrival : true,
        stock: {
          create: Array.isArray(stock)
            ? stock.map((s: { size: string; quantity: number }) => ({
                size: s.size,
                quantity: Number(s.quantity) || 0,
              }))
            : [
                { size: 'S', quantity: 10 },
                { size: 'M', quantity: 15 },
                { size: 'L', quantity: 10 },
                { size: 'XL', quantity: 5 },
              ],
        },
      },
      include: {
        category: true,
        stock: true,
      },
    });

    return NextResponse.json(product, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create product.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
