import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { corsHeaders, handleCors } from '@/lib/cors';

export async function OPTIONS() {
  return handleCors();
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Login Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed.', details: String(error) },
      { status: 500, headers: corsHeaders() }
    );
  }
}
