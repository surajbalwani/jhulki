import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCors } from '@/lib/cors';

export async function OPTIONS() {
  return handleCors();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400, headers: corsHeaders() });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { category: true, stock: true } } },
    });

    return NextResponse.json(wishlists, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId required' }, { status: 400, headers: corsHeaders() });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ isWishlisted: false }, { headers: corsHeaders() });
    }

    const created = await prisma.wishlist.create({
      data: { userId, productId },
      include: { product: true },
    });

    return NextResponse.json({ isWishlisted: true, wishlist: created }, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}
