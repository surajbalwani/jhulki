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

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, fullName, street, city, state, postalCode, country, phone, isDefault } = body;

    if (!userId || !fullName || !street || !city || !state || !postalCode || !phone) {
      return NextResponse.json({ error: 'All address fields are required.' }, { status: 400, headers: corsHeaders() });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        title: title || 'Home',
        fullName,
        street,
        city,
        state,
        postalCode,
        country: country || 'India',
        phone,
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json(address, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}
