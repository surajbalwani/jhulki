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
      return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders() });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, stock: true },
        },
      },
    });

    return NextResponse.json(items, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, productId, size, quantity } = body;

    if (!userId || !productId || !size) {
      return NextResponse.json({ error: 'userId, productId, and size required' }, { status: 400, headers: corsHeaders() });
    }

    const qty = quantity || 1;

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_size: { userId, productId, size },
      },
      update: {
        quantity: { increment: qty },
      },
      create: {
        userId,
        productId,
        size,
        quantity: qty,
      },
      include: { product: true },
    });

    return NextResponse.json(cartItem, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (id) {
      await prisma.cartItem.delete({ where: { id } });
    } else if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}
