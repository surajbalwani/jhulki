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

    const where = userId ? { userId } : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(orders, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items, totalAmount, shippingAddress, paymentMethod } = body;

    if (!userId || !items || !items.length || !shippingAddress) {
      return NextResponse.json({ error: 'Invalid order parameters' }, { status: 400, headers: corsHeaders() });
    }

    const orderNumber = 'JHL-' + Math.floor(100000 + Math.random() * 900000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount: parseFloat(totalAmount),
        shippingName: shippingAddress.fullName,
        shippingStreet: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingZip: shippingAddress.postalCode,
        shippingPhone: shippingAddress.phone,
        paymentMethod: paymentMethod || 'Luxury Card',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.product?.id,
            size: item.size,
            quantity: Number(item.quantity),
            price: parseFloat(item.product?.salePrice || item.product?.price || item.price),
          })),
        },
      },
      include: { items: true },
    });

    // Clear cart after order
    await prisma.cartItem.deleteMany({ where: { userId } });

    return NextResponse.json(order, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}
