import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleCors } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCors();
}

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();

    const orders = await prisma.order.findMany({ select: { totalAmount: true } });
    const totalRevenue = orders.reduce((sum: number, o: { totalAmount: number }) => sum + o.totalAmount, 0);

    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return NextResponse.json(
      {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        categories,
        recentOrders,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}
