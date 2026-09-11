import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCors } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCors();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        category: true,
        stock: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(product, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch product details.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, salePrice, saleStartTime, saleEndTime, isSaleEnabled, isBogoEnabled, bogoPairProductId, images, isFeatured, isNewArrival, stock } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(saleStartTime !== undefined && { saleStartTime: saleStartTime ? new Date(saleStartTime) : null }),
        ...(saleEndTime !== undefined && { saleEndTime: saleEndTime ? new Date(saleEndTime) : null }),
        ...(isSaleEnabled !== undefined && { isSaleEnabled: !!isSaleEnabled }),
        ...(isBogoEnabled !== undefined && { isBogoEnabled: !!isBogoEnabled }),
        ...(bogoPairProductId !== undefined && { bogoPairProductId: bogoPairProductId || null }),
        ...(images && { images }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isNewArrival !== undefined && { isNewArrival }),
      },
      include: { category: true, stock: true },
    });

    if (Array.isArray(stock)) {
      for (const s of stock) {
        await prisma.productStock.upsert({
          where: { productId_size: { productId: id, size: s.size } },
          update: { quantity: Number(s.quantity) },
          create: { productId: id, size: s.size, quantity: Number(s.quantity) },
        });
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, stock: true },
    });

    return NextResponse.json(updatedProduct, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update product.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Product deleted.' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
