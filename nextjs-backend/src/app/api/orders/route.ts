import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCors } from '@/lib/cors';

export const dynamic = 'force-dynamic';

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
    
    // Calculate order totalAmount, giving priority to final discounted total from frontend (accounting for BOGO & Sale offers)
    let computedTotal = 0;
    const orderItemsData = items.map((item: any) => {
      const itemPrice = parseFloat(item.product?.salePrice || item.product?.price || item.price || 0);
      const qty = Number(item.quantity) || 1;
      computedTotal += itemPrice * qty;
      return {
        productId: item.productId || item.product?.id,
        size: item.size,
        quantity: qty,
        price: itemPrice,
      };
    });

    // Use passed totalAmount (final discounted amount like 4699 after BOGO/Sales)
    const parsedTotal = (totalAmount && parseFloat(totalAmount) > 0) ? parseFloat(totalAmount) : computedTotal;
    const advancePaid = Math.round(parsedTotal * 0.20);
    const balanceDue = parsedTotal - advancePaid;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount: parsedTotal,
        advancePaid,
        balanceDue,
        shippingName: shippingAddress.fullName,
        shippingStreet: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingZip: shippingAddress.postalCode,
        shippingPhone: shippingAddress.phone,
        paymentMethod: paymentMethod || 'Luxury Card',
        items: {
          create: orderItemsData,
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, orderNumber, trackingId, status, isBalancePaid, expectedDeliveryDate, shippedAt } = body;

    if (!id && !orderNumber) {
      return NextResponse.json({ error: 'Order ID or orderNumber is required' }, { status: 400, headers: corsHeaders() });
    }

    // Find target order by id or orderNumber
    let targetOrder = null;
    if (id) {
      targetOrder = await prisma.order.findUnique({ where: { id } });
    }
    if (!targetOrder && orderNumber) {
      targetOrder = await prisma.order.findUnique({ where: { orderNumber } });
    }

    if (!targetOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: corsHeaders() });
    }

    const updateData: any = {};
    if (trackingId !== undefined) updateData.trackingId = trackingId;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'SHIPPED') {
        const now = shippedAt ? new Date(shippedAt) : new Date();
        const expected = expectedDeliveryDate ? new Date(expectedDeliveryDate) : new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        updateData.shippedAt = now;
        updateData.expectedDeliveryDate = expected;
      }
    }
    if (expectedDeliveryDate) updateData.expectedDeliveryDate = new Date(expectedDeliveryDate);
    if (shippedAt) updateData.shippedAt = new Date(shippedAt);
    if (isBalancePaid !== undefined) updateData.isBalancePaid = isBalancePaid;

    const updated = await prisma.order.update({
      where: { id: targetOrder.id },
      data: updateData,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(updated, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}
